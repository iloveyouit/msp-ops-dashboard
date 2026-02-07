import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const article = await prisma.kBArticle.findUniqueOrThrow({
      where: { id },
      include: {
        pillars: { include: { pillar: true } },
        tags: true,
        client: true,
        ticket: { select: { id: true, title: true, externalId: true } },
        user: { select: { name: true } },
        evidence: true,
      },
    });
    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await req.json();
    const { pillarIds, tags, ...updateData } = body;

    const article = await prisma.kBArticle.update({
      where: { id },
      data: {
        ...updateData,
        ...(pillarIds !== undefined ? {
          pillars: { deleteMany: {}, create: pillarIds.map((pid: string) => ({ pillarId: pid })) },
        } : {}),
        ...(tags !== undefined ? {
          tags: { deleteMany: {}, create: tags.map((tag: string) => ({ tag })) },
        } : {}),
      },
    });

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    await prisma.kBArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
