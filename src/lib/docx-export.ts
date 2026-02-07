import { Document, HeadingLevel, Packer, Paragraph } from 'docx';

function markdownToParagraphs(markdown: string): Paragraph[] {
  return markdown.split('\n').map((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return new Paragraph({ text: '' });
    }

    if (trimmed.startsWith('### ')) {
      return new Paragraph({ heading: HeadingLevel.HEADING_3, text: trimmed.slice(4) });
    }

    if (trimmed.startsWith('## ')) {
      return new Paragraph({ heading: HeadingLevel.HEADING_2, text: trimmed.slice(3) });
    }

    if (trimmed.startsWith('# ')) {
      return new Paragraph({ heading: HeadingLevel.HEADING_1, text: trimmed.slice(2) });
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return new Paragraph({
        text: trimmed.slice(2),
        bullet: { level: 0 },
      });
    }

    return new Paragraph({ text: line });
  });
}

export async function buildDocxFromMarkdown(markdown: string): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: markdownToParagraphs(markdown),
      },
    ],
  });

  return Packer.toBuffer(doc);
}
