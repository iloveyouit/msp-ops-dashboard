import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { taskCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const ticketId = searchParams.get('ticketId');

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (ticketId) where.ticketId = ticketId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        ticket: { select: { id: true, title: true, externalId: true } },
        client: { select: { name: true, acronym: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = taskCreateSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        category: data.category || 'follow_up',
        ticketId: data.ticketId,
        clientId: data.clientId,
        userId: session.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
