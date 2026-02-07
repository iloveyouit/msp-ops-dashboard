import { prisma } from '@/lib/prisma';
import { SnippetFormClient } from '@/components/snippets/snippet-form-client';

export default async function NewSnippetPage() {
  const pillars = await prisma.technologyPillar.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  return <SnippetFormClient pillars={pillars} />;
}
