import { prisma } from './prisma';

interface TicketExportData {
  title: string;
  client: string;
  ticketId: string;
  priority: string;
  status: string;
  category: string;
  createdAt: string;
  symptoms: string;
  impactedService: string;
  quickNotes: string;
  description: string;
  sensitivity: string;
  affectedUsers: string;
  isOutage: string;
  detectedAt: string;
  acknowledgedAt: string;
  mitigatedAt: string;
  resolvedAt: string;
  user: string;
  date: string;
  resolution: {
    summary: string;
    rootCause: string;
    fixApplied: string;
    validationSteps: string;
    prevention: string;
    timeSpentMinutes: string;
    handoffNotes: string;
  };
  tasks: string;
  outageDuration: string;
}

function formatDateExport(d: Date | null): string {
  if (!d) return 'N/A';
  return d.toLocaleString('en-US');
}

export async function getTicketExportData(ticketId: string): Promise<TicketExportData> {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: {
      client: true,
      user: true,
      resolution: true,
      tasks: true,
    },
  });

  const outageDuration = ticket.detectedAt && ticket.resolvedAt
    ? `${Math.round((ticket.resolvedAt.getTime() - ticket.detectedAt.getTime()) / 60000)} minutes`
    : 'N/A';

  const tasksList = ticket.tasks
    .map((t) => `- [${t.status === 'done' ? 'x' : ' '}] ${t.title}`)
    .join('\n');

  return {
    title: ticket.title,
    client: ticket.client.name,
    ticketId: ticket.externalId || ticket.id,
    priority: ticket.priority,
    status: ticket.status,
    category: ticket.category,
    createdAt: formatDateExport(ticket.createdAt),
    symptoms: ticket.symptoms || 'N/A',
    impactedService: ticket.impactedService || 'N/A',
    quickNotes: ticket.quickNotes || '',
    description: ticket.description || '',
    sensitivity: ticket.sensitivity,
    affectedUsers: String(ticket.affectedUsers || 'N/A'),
    isOutage: ticket.isOutage ? 'Yes' : 'No',
    detectedAt: formatDateExport(ticket.detectedAt),
    acknowledgedAt: formatDateExport(ticket.acknowledgedAt),
    mitigatedAt: formatDateExport(ticket.mitigatedAt),
    resolvedAt: formatDateExport(ticket.resolvedAt),
    user: ticket.user.name,
    date: formatDateExport(new Date()),
    resolution: {
      summary: ticket.resolution?.summary || 'Pending',
      rootCause: ticket.resolution?.rootCause || 'Under investigation',
      fixApplied: ticket.resolution?.fixApplied || 'Pending',
      validationSteps: ticket.resolution?.validationSteps || 'Pending',
      prevention: ticket.resolution?.prevention || 'TBD',
      timeSpentMinutes: String(ticket.resolution?.timeSpentMinutes || 0),
      handoffNotes: ticket.resolution?.handoffNotes || '',
    },
    tasks: tasksList || 'No tasks',
    outageDuration,
  };
}

export function applyTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;
  
  function replaceNested(obj: Record<string, unknown>, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        replaceNested(value as Record<string, unknown>, fullKey);
      } else {
        const placeholder = `{{${fullKey}}}`;
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value ?? ''));
      }
    }
  }

  replaceNested(data);
  return result;
}
