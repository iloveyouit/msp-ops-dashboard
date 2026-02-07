import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { snippetCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');
    const search = searchParams.get('search');

    const where: any = {};
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const snippets = await prisma.snippet.findMany({
      where,
      include: {
        pillars: { include: { pillar: { select: { name: true, color: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(snippets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = snippetCreateSchema.parse(body);

    const snippet = await prisma.snippet.create({
      data: {
        title: data.title,
        language: data.language,
        code: data.code,
        description: data.description,
        usageNotes: data.usageNotes,
        tags: data.tags || [],
        userId: session.id,
        pillars: data.pillarIds?.length ? {
          create: data.pillarIds.map((id) => ({ pillarId: id })),
        } : undefined,
      },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
