import { prisma } from '@/lib/prisma';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const [clients, pillars, templates] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { tickets: true } } } }),
    prisma.technologyPillar.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.exportTemplate.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <SettingsClient
      clients={JSON.parse(JSON.stringify(clients))}
      pillars={JSON.parse(JSON.stringify(pillars))}
      templates={JSON.parse(JSON.stringify(templates))}
    />
  );
}
