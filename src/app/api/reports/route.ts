import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [tickets, tasks, kbArticles] = await Promise.all([
      prisma.ticket.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          client: { select: { name: true, acronym: true } },
          pillars: { include: { pillar: { select: { name: true } } } },
          resolution: { select: { timeSpentMinutes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: { OR: [
          { createdAt: { gte: start, lte: end } },
          { completedAt: { gte: start, lte: end } },
        ]},
      }),
      prisma.kBArticle.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    // Compute stats
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
    const totalTimeMinutes = tickets.reduce((sum, t) => sum + (t.resolution?.timeSpentMinutes || 0), 0);

    // Tickets by pillar
    const pillarCounts: Record<string, number> = {};
    tickets.forEach(t => {
      t.pillars.forEach(p => {
        pillarCounts[p.pillar.name] = (pillarCounts[p.pillar.name] || 0) + 1;
      });
    });

    // Tickets by client
    const clientCounts: Record<string, number> = {};
    tickets.forEach(t => {
      const key = t.client.acronym;
      clientCounts[key] = (clientCounts[key] || 0) + 1;
    });

    // Tickets by priority
    const priorityCounts: Record<string, number> = {};
    tickets.forEach(t => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    return NextResponse.json({
      period: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalTickets,
        resolvedTickets,
        openTickets: totalTickets - resolvedTickets,
        totalTimeMinutes,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        kbArticlesCreated: kbArticles.length,
      },
      breakdown: {
        byPillar: pillarCounts,
        byClient: clientCounts,
        byPriority: priorityCounts,
      },
      tickets: tickets.map(t => ({
        id: t.id,
        title: t.title,
        client: t.client.acronym,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        timeSpent: t.resolution?.timeSpentMinutes || 0,
      })),
      kbArticles,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
