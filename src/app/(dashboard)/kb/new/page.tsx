import { prisma } from '@/lib/prisma';
import { KBFormClient } from '@/components/kb/kb-form-client';

export default async function NewKBPage() {
  const [pillars, clients] = await Promise.all([
    prisma.technologyPillar.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.client.findMany({ where: { isActive: true }, select: { id: true, name: true, acronym: true } }),
  ]);

  return <KBFormClient pillars={pillars} clients={clients} />;
}
