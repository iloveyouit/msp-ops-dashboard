import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const ticket = await prisma.ticket.findUniqueOrThrow({
      where: { id },
      include: {
        client: true,
        user: { select: { id: true, name: true, email: true } },
        resolution: true,
        pillars: { include: { pillar: true } },
        tags: true,
        tasks: { orderBy: { createdAt: 'desc' } },
        evidence: { orderBy: { uploadedAt: 'desc' } },
        docArtifacts: { orderBy: { createdAt: 'desc' } },
        kbArticles: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await req.json();

    // Auto-timestamp status changes
    const current = await prisma.ticket.findUniqueOrThrow({ where: { id } });
    const timestamps: Record<string, Date> = {};
    if (body.status && body.status !== current.status) {
      const now = new Date();
      if (body.status === 'in_progress' && !current.acknowledgedAt) timestamps.acknowledgedAt = now;
      if (body.status === 'waiting' && !current.mitigatedAt) timestamps.mitigatedAt = now;
      if (body.status === 'resolved' && !current.resolvedAt) timestamps.resolvedAt = now;
      if (body.status === 'closed') timestamps.closedAt = now;
    }

    // Handle pillar updates
    const { pillarIds, tags, ...updateData } = body;
    
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updateData,
        ...timestamps,
        ...(pillarIds !== undefined ? {
          pillars: {
            deleteMany: {},
            create: pillarIds.map((pid: string) => ({ pillarId: pid })),
          },
        } : {}),
        ...(tags !== undefined ? {
          tags: {
            deleteMany: {},
            create: tags.map((tag: string) => ({ tag })),
          },
        } : {}),
      },
      include: {
        client: true,
        pillars: { include: { pillar: true } },
        tags: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    await prisma.ticket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
