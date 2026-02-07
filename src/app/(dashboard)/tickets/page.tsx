import { prisma } from '@/lib/prisma';
import { TicketsClient } from '@/components/tickets/tickets-client';

export default async function TicketsPage() {
  const [clients, pillars] = await Promise.all([
    prisma.client.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, acronym: true } }),
    prisma.technologyPillar.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  return <TicketsClient clients={clients} pillars={pillars} />;
}
