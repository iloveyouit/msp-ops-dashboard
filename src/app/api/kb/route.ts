import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { kbCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const pillarId = searchParams.get('pillarId');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problem: { contains: search, mode: 'insensitive' } },
        { symptoms: { contains: search, mode: 'insensitive' } },
        { resolution: { contains: search, mode: 'insensitive' } },
        { commands: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { some: { tag } };
    }
    if (pillarId) {
      where.pillars = { some: { pillarId } };
    }

    const articles = await prisma.kBArticle.findMany({
      where,
      include: {
        pillars: { include: { pillar: { select: { name: true, color: true } } } },
        tags: true,
        client: { select: { name: true, acronym: true } },
        ticket: { select: { id: true, title: true, externalId: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = kbCreateSchema.parse(body);

    const article = await prisma.kBArticle.create({
      data: {
        title: data.title,
        problem: data.problem,
        environment: data.environment,
        symptoms: data.symptoms,
        cause: data.cause,
        resolution: data.resolution,
        commands: data.commands,
        references: data.references,
        sensitivity: data.sensitivity || 'internal',
        ticketId: data.ticketId,
        clientId: data.clientId,
        userId: session.id,
        pillars: data.pillarIds?.length ? {
          create: data.pillarIds.map((id) => ({ pillarId: id })),
        } : undefined,
        tags: data.tags?.length ? {
          create: data.tags.map((tag) => ({ tag })),
        } : undefined,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
