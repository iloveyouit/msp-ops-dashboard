import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { getTicketExportData, applyTemplate } from '@/lib/export';

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { ticketId, templateType } = await req.json();

    if (!ticketId || !templateType) {
      return NextResponse.json({ error: 'ticketId and templateType are required' }, { status: 400 });
    }

    const template = await prisma.exportTemplate.findFirst({
      where: { type: templateType, isDefault: true },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const data = await getTicketExportData(ticketId);
    const markdown = applyTemplate(template.content, data as unknown as Record<string, unknown>);

    return NextResponse.json({ markdown, templateName: template.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
