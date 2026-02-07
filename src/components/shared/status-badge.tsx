import { Badge } from '@/components/ui/badge';
import { cn, STATUS_COLORS, PRIORITY_COLORS, TASK_STATUS_COLORS } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold', PRIORITY_COLORS[priority] || 'bg-gray-500 text-white')}>
      {priority}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TASK_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace('_', ' ')}
    </span>
  );
}
