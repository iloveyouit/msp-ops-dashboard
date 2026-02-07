import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { getTicketExportData, applyTemplate } from '@/lib/export';
import { buildDocxFromMarkdown } from '@/lib/docx-export';

function toSafeFilename(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'ticket-export';
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const { ticketId, templateType, format } = await req.json();

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
    const exportFormat = format === 'docx' ? 'docx' : 'markdown';

    if (exportFormat === 'docx') {
      const docxBuffer = await buildDocxFromMarkdown(markdown);
      const filename = `${toSafeFilename(`${data.ticketId}-${template.name}`)}.docx`;

      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({ markdown, templateName: template.name, format: exportFormat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
