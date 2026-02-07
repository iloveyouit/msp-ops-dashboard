import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { ticketCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { symptoms: { contains: search, mode: 'insensitive' } },
        { quickNotes: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          client: { select: { name: true, acronym: true } },
          pillars: { include: { pillar: { select: { name: true, color: true } } } },
          _count: { select: { tasks: true, evidence: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({ tickets, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = ticketCreateSchema.parse(body);

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        clientId: data.clientId,
        category: data.category,
        priority: data.priority,
        symptoms: data.symptoms,
        impactedService: data.impactedService,
        quickNotes: data.quickNotes,
        description: data.description,
        affectedUsers: data.affectedUsers,
        isOutage: data.isOutage,
        sensitivity: data.sensitivity || 'internal',
        userId: session.id,
        detectedAt: new Date(),
        pillars: data.pillarIds?.length ? {
          create: data.pillarIds.map((id) => ({ pillarId: id })),
        } : undefined,
        tags: data.tags?.length ? {
          create: data.tags.map((tag) => ({ tag })),
        } : undefined,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
