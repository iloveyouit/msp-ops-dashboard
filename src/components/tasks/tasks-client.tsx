'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TaskStatusBadge, PriorityBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { CheckSquare, Plus, Loader2, Calendar, Ticket } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime, formatDate } from '@/lib/utils';

interface TasksClientProps {
  clients: Array<{ id: string; name: string; acronym: string }>;
}

export function TasksClient({ clients }: TasksClientProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', category: 'follow_up', clientId: '' });
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/tasks?${params}`);
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setShowNewTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', category: 'follow_up', clientId: '' });
      fetchTasks();
    }
    setSaving(false);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    fetchTasks();
  };

  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    blocked: tasks.filter((t) => t.status === 'blocked'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <>
      <Header title="Tasks" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['', 'todo', 'in_progress', 'blocked', 'done'].map((s) => (
              <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
                {s ? s.replace('_', ' ') : 'All'} {s ? `(${(grouped as any)[s]?.length || 0})` : `(${tasks.length})`}
              </Button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowNewTask(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-lg border p-4 animate-pulse h-16" />)}</div>
        ) : tasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No tasks" description="Create tasks to track follow-ups, monitoring, and client actions." actionLabel="New Task" onAction={() => setShowNewTask(true)} />
        ) : (
          <div className="space-y-2">
            {(statusFilter ? (grouped as any)[statusFilter] || [] : tasks).map((task: any) => (
              <Card key={task.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="w-32 h-8 text-xs">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </Select>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <span className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.client && <span className="text-xs text-gray-500">{task.client.acronym}</span>}
                        {task.ticket && (
                          <Link href={`/tickets/${task.ticket.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                            <Ticket className="h-3 w-3" /> {task.ticket.title}
                          </Link>
                        )}
                        <span className="text-xs text-gray-400">{task.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        <Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}
                      </span>
                    )}
                    <button onClick={() => handleDelete(task.id)} className="text-xs text-gray-400 hover:text-red-500">&times;</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
        <form onSubmit={handleCreateTask}>
          <DialogContent>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required autoFocus /></div>
              <div><Label>Description</Label><Input value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label><Select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select></div>
                <div><Label>Category</Label><Select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}><option value="follow_up">Follow Up</option><option value="monitoring">Monitoring</option><option value="client_action">Client Action</option><option value="internal">Internal</option></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Due Date</Label><Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} /></div>
                <div><Label>Client</Label><Select value={newTask.clientId} onChange={(e) => setNewTask({...newTask, clientId: e.target.value})}><option value="">None</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.acronym}</option>)}</Select></div>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create Task</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
