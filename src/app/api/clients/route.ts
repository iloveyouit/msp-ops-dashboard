import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { clientCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requireSession();
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tickets: true } },
      },
    });
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const body = await req.json();
    const data = clientCreateSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        name: data.name,
        acronym: data.acronym.toUpperCase(),
        notes: data.notes,
        envType: data.envType || 'hybrid',
        envTags: data.envTags || [],
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
