import { prisma } from '@/lib/prisma';
import { TasksClient } from '@/components/tasks/tasks-client';

export default async function TasksPage() {
  const clients = await prisma.client.findMany({ where: { isActive: true }, select: { id: true, name: true, acronym: true } });
  return <TasksClient clients={clients} />;
}
