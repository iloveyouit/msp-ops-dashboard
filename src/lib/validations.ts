import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ticketCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  clientId: z.string().min(1, 'Client is required'),
  category: z.enum(['incident', 'service_request', 'problem', 'change']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  symptoms: z.string().optional(),
  impactedService: z.string().optional(),
  quickNotes: z.string().optional(),
  description: z.string().optional(),
  affectedUsers: z.number().optional(),
  isOutage: z.boolean().optional(),
  sensitivity: z.enum(['internal', 'client_shareable']).optional(),
  pillarIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const ticketUpdateSchema = ticketCreateSchema.partial().extend({
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional(),
});

export const resolutionSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  rootCause: z.string().optional(),
  fixApplied: z.string().optional(),
  validationSteps: z.string().optional(),
  prevention: z.string().optional(),
  timeSpentMinutes: z.number().optional(),
  collaborators: z.string().optional(),
  handoffNotes: z.string().optional(),
});

export const kbCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  problem: z.string().min(1, 'Problem description is required'),
  environment: z.string().optional(),
  symptoms: z.string().optional(),
  cause: z.string().optional(),
  resolution: z.string().min(1, 'Resolution is required'),
  commands: z.string().optional(),
  references: z.string().optional(),
  sensitivity: z.enum(['internal', 'client_shareable']).optional(),
  ticketId: z.string().optional(),
  clientId: z.string().optional(),
  pillarIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  dueDate: z.string().optional(),
  category: z.enum(['follow_up', 'monitoring', 'client_action', 'internal']).optional(),
  ticketId: z.string().optional(),
  clientId: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional(),
});

export const snippetCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  language: z.enum(['powershell', 'terraform', 'bash', 'sql', 'python', 'cli', 'other']),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  usageNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pillarIds: z.array(z.string()).optional(),
});

export const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  acronym: z.string().min(1, 'Acronym is required').max(10),
  notes: z.string().optional(),
  envType: z.enum(['azure', 'on-prem', 'hybrid']).optional(),
  envTags: z.array(z.string()).optional(),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>;
export type ResolutionInput = z.infer<typeof resolutionSchema>;
export type KBCreateInput = z.infer<typeof kbCreateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type SnippetCreateInput = z.infer<typeof snippetCreateSchema>;
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
