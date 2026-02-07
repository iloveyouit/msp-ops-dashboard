import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/layout/dashboard-client';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [openTickets, recentTickets, dueTasks, clients, recentKB, stats] = await Promise.all([
    prisma.ticket.count({ where: { status: { in: ['open', 'in_progress', 'waiting'] } } }),
    prisma.ticket.findMany({
      where: { createdAt: { gte: today } },
      include: {
        client: { select: { name: true, acronym: true } },
        pillars: { include: { pillar: { select: { name: true, color: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        status: { in: ['todo', 'in_progress'] },
        OR: [
          { dueDate: { lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) } },
          { dueDate: null },
        ],
      },
      include: {
        ticket: { select: { id: true, title: true } },
        client: { select: { name: true, acronym: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 10,
    }),
    prisma.client.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, acronym: true },
    }),
    prisma.kBArticle.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.ticket.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  stats.forEach((s: { status: string; _count: number }) => { statusCounts[s.status] = s._count; });

  return (
    <DashboardClient
      openTickets={openTickets}
      recentTickets={JSON.parse(JSON.stringify(recentTickets))}
      dueTasks={JSON.parse(JSON.stringify(dueTasks))}
      clients={clients}
      recentKB={JSON.parse(JSON.stringify(recentKB))}
      statusCounts={statusCounts}
      userName={session.name}
    />
  );
}
