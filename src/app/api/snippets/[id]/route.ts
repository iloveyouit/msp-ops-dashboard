import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await req.json();
    const { pillarIds, ...updateData } = body;

    const snippet = await prisma.snippet.update({
      where: { id },
      data: {
        ...updateData,
        ...(pillarIds !== undefined ? {
          pillars: { deleteMany: {}, create: pillarIds.map((pid: string) => ({ pillarId: pid })) },
        } : {}),
      },
    });

    return NextResponse.json(snippet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    await prisma.snippet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
