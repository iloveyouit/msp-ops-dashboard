'use client';

import { useState } from 'react';
import { Header } from './header';
import { QuickCaptureModal } from './quick-capture-modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, TaskStatusBadge } from '@/components/shared/status-badge';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { Ticket, CheckSquare, BookOpen, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime, timeAgo } from '@/lib/utils';

interface DashboardProps {
  openTickets: number;
  recentTickets: any[];
  dueTasks: any[];
  clients: Array<{ id: string; name: string; acronym: string }>;
  recentKB: any[];
  statusCounts: Record<string, number>;
  userName: string;
}

export function DashboardClient({
  openTickets,
  recentTickets,
  dueTasks,
  clients,
  recentKB,
  statusCounts,
  userName,
}: DashboardProps) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  useKeyboardShortcut({ key: 'n', ctrl: true }, () => setQuickCaptureOpen(true));

  const statCards = [
    { label: 'Open Tickets', value: openTickets, icon: Ticket, color: 'text-blue-600 bg-blue-50' },
    { label: 'In Progress', value: statusCounts['in_progress'] || 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Waiting', value: statusCounts['waiting'] || 0, icon: AlertTriangle, color: 'text-purple-600 bg-purple-50' },
    { label: 'Tasks Due', value: dueTasks.length, icon: CheckSquare, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <>
      <Header title={`Welcome back, ${userName}`} onQuickCapture={() => setQuickCaptureOpen(true)} />
      
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <Card className="col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Tickets</CardTitle>
              <Link href="/tickets" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentTickets.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No tickets today. Press Ctrl+N to create one.</p>
              ) : (
                <div className="space-y-2">
                  {recentTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={ticket.priority} />
                          <span className="text-sm font-medium truncate">{ticket.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{ticket.client.acronym}</span>
                          {ticket.pillars.map((p: any) => (
                            <span
                              key={p.pillar.name}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: p.pillar.color + '20', color: p.pillar.color }}
                            >
                              {p.pillar.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <StatusBadge status={ticket.status} />
                        <span className="text-xs text-gray-400">{timeAgo(ticket.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar: Tasks + KB */}
          <div className="space-y-6">
            {/* Due Tasks */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Due Soon</CardTitle>
                <Link href="/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {dueTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No upcoming tasks</p>
                ) : (
                  <div className="space-y-2">
                    {dueTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-gray-50">
                        <TaskStatusBadge status={task.status} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {task.client?.acronym && `${task.client.acronym} · `}
                            {task.dueDate ? formatDateTime(task.dueDate) : 'No due date'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent KB */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent KB Articles</CardTitle>
                <Link href="/kb" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentKB.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No articles yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentKB.map((article) => (
                      <Link
                        key={article.id}
                        href={`/kb/${article.id}`}
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50"
                      >
                        <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{article.title}</p>
                          <p className="text-xs text-gray-400">{timeAgo(article.updatedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">
          Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs border">Ctrl+N</kbd> to quick capture a new ticket from anywhere
        </p>
      </div>

      <QuickCaptureModal
        open={quickCaptureOpen}
        onOpenChange={setQuickCaptureOpen}
        clients={clients}
      />
    </>
  );
}
