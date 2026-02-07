import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { TicketDetailClient } from '@/components/tickets/ticket-detail-client';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [ticket, pillars, clients] = await Promise.all([
    prisma.ticket.findUnique({
      where: { id },
      include: {
        client: true,
        user: { select: { id: true, name: true, email: true } },
        resolution: true,
        pillars: { include: { pillar: true } },
        tags: true,
        tasks: { orderBy: { createdAt: 'desc' } },
        evidence: { orderBy: { uploadedAt: 'desc' } },
        docArtifacts: { orderBy: { createdAt: 'desc' } },
        kbArticles: { select: { id: true, title: true } },
      },
    }),
    prisma.technologyPillar.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.client.findMany({ where: { isActive: true }, select: { id: true, name: true, acronym: true } }),
  ]);

  if (!ticket) notFound();

  return (
    <TicketDetailClient
      ticket={JSON.parse(JSON.stringify(ticket))}
      pillars={pillars}
      clients={clients}
    />
  );
}
