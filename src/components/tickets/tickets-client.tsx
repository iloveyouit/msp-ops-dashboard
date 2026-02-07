'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { QuickCaptureModal } from '@/components/layout/quick-capture-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { Ticket, Search, Filter, Plus } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface TicketsClientProps {
  clients: Array<{ id: string; name: string; acronym: string }>;
  pillars: Array<{ id: string; name: string; color: string | null }>;
}

export function TicketsClient({ clients, pillars }: TicketsClientProps) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    clientId: '',
    category: '',
    page: 1,
  });

  useKeyboardShortcut({ key: 'n', ctrl: true }, () => setQuickCaptureOpen(true));

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.clientId) params.set('clientId', filters.clientId);
    if (filters.category) params.set('category', filters.category);
    params.set('page', String(filters.page));

    const res = await fetch(`/api/tickets?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets);
      setTotal(data.total);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <>
      <Header title="Tickets" onQuickCapture={() => setQuickCaptureOpen(true)} />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="w-36">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)} className="w-32">
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Select value={filters.clientId} onChange={(e) => updateFilter('clientId', e.target.value)} className="w-40">
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>
              ))}
            </Select>
            <Select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="w-40">
              <option value="">All Categories</option>
              <option value="incident">Incident</option>
              <option value="service_request">Service Request</option>
              <option value="problem">Problem</option>
              <option value="change">Change</option>
            </Select>
          </div>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} ticket{total !== 1 ? 's' : ''} found
          </p>
          <Button size="sm" onClick={() => setQuickCaptureOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Ticket
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="Create your first ticket to start tracking incidents and work."
            actionLabel="New Ticket"
            onAction={() => setQuickCaptureOpen(true)}
          />
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={ticket.priority} />
                      <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium">{ticket.client.acronym}</span>
                      <span>{ticket.category.replace('_', ' ')}</span>
                      {ticket.pillars.map((p: any) => (
                        <span
                          key={p.pillar.name}
                          className="px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: p.pillar.color + '20', color: p.pillar.color }}
                        >
                          {p.pillar.name}
                        </span>
                      ))}
                      {ticket._count.tasks > 0 && <span>{ticket._count.tasks} tasks</span>}
                      {ticket._count.evidence > 0 && <span>{ticket._count.evidence} evidence</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge status={ticket.status} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(ticket.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500 flex items-center">
              Page {filters.page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= Math.ceil(total / 20)}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <QuickCaptureModal
        open={quickCaptureOpen}
        onOpenChange={setQuickCaptureOpen}
        clients={clients}
      />
    </>
  );
}
