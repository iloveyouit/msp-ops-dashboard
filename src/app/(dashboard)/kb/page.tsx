import { prisma } from '@/lib/prisma';
import { KBClient } from '@/components/kb/kb-client';

export default async function KBPage() {
  const pillars = await prisma.technologyPillar.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  return <KBClient pillars={pillars} />;
}
