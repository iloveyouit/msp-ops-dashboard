'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge, PriorityBadge, TaskStatusBadge } from '@/components/shared/status-badge';
import {
  ArrowLeft, Edit2, Save, X, FileText, CheckSquare, Paperclip, BookOpen, Download,
  Plus, Loader2, Clock, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

interface TicketDetailProps {
  ticket: any;
  pillars: any[];
  clients: Array<{ id: string; name: string; acronym: string }>;
}

export function TicketDetailClient({ ticket: initialTicket, pillars, clients }: TicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(initialTicket);
  const [saving, setSaving] = useState(false);
  const [resolutionData, setResolutionData] = useState(ticket.resolution || {
    summary: '', rootCause: '', fixApplied: '', validationSteps: '', prevention: '',
    timeSpentMinutes: 0, collaborators: '', handoffNotes: '',
  });
  const [savingResolution, setSavingResolution] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState('');
  const [exportError, setExportError] = useState('');

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTicket((prev: any) => ({ ...prev, ...updated }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editData.title,
        description: editData.description,
        symptoms: editData.symptoms,
        quickNotes: editData.quickNotes,
        impactedService: editData.impactedService,
        affectedUsers: editData.affectedUsers ? Number(editData.affectedUsers) : null,
        isOutage: editData.isOutage,
        priority: editData.priority,
        category: editData.category,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTicket((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSaveResolution = async () => {
    setSavingResolution(true);
    const endpoint = ticket.resolution
      ? `/api/tickets/${ticket.id}`
      : `/api/tickets/${ticket.id}`;
    // Save resolution via ticket update with resolution data
    const res = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: resolutionData }),
    });
    // Fallback: use a direct approach
    setSavingResolution(false);
    router.refresh();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, ticketId: ticket.id, clientId: ticket.clientId }),
    });
    setNewTaskTitle('');
    router.refresh();
  };

  const handleExport = async (templateType: string, format: 'markdown' | 'docx' = 'markdown') => {
    setExporting(true);
    setExportError('');
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, templateType, format }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Export failed' }));
      setExportError(err.error || 'Export failed');
      setExporting(false);
      return;
    }

    if (format === 'docx') {
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match?.[1] || `${ticket.externalId || ticket.id}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      const data = await res.json();
      setExportResult(data.markdown);
    }

    setExporting(false);
  };

  const handleConvertToKB = () => {
    const params = new URLSearchParams({ fromTicket: ticket.id });
    router.push(`/kb/new?${params}`);
  };

  return (
    <>
      <Header title="Ticket Details" />
      
      <div className="p-6 space-y-6">
        {/* Back + Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Link href="/tickets" className="mt-1 p-1 rounded hover:bg-gray-200">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                {ticket.externalId && <Badge variant="outline">{ticket.externalId}</Badge>}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {ticket.client.name} ({ticket.client.acronym}) · {ticket.category.replace('_', ' ')} · Created {formatDateTime(ticket.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} className="w-36">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleConvertToKB}>
              <BookOpen className="h-4 w-4 mr-1" /> Create KB
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({ticket.tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="evidence">Evidence ({ticket.evidence?.length || 0})</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {editing ? (
                    <>
                      <div>
                        <Label>Title</Label>
                        <Input value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                      </div>
                      <div>
                        <Label>Symptoms</Label>
                        <Textarea value={editData.symptoms || ''} onChange={(e) => setEditData({...editData, symptoms: e.target.value})} rows={3} />
                      </div>
                      <div>
                        <Label>Quick Notes</Label>
                        <Textarea value={editData.quickNotes || ''} onChange={(e) => setEditData({...editData, quickNotes: e.target.value})} rows={3} />
                      </div>
                      <div>
                        <Label>Affected Service</Label>
                        <Input value={editData.impactedService || ''} onChange={(e) => setEditData({...editData, impactedService: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Symptoms</p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.symptoms || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quick Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.quickNotes || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Affected Service</p>
                        <p className="text-sm">{ticket.impactedService || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Affected Users</p>
                        <p className="text-sm">{ticket.affectedUsers ?? '—'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Timeline */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: 'Detected', time: ticket.detectedAt, icon: AlertTriangle },
                        { label: 'Acknowledged', time: ticket.acknowledgedAt, icon: Clock },
                        { label: 'Mitigated', time: ticket.mitigatedAt, icon: Clock },
                        { label: 'Resolved', time: ticket.resolvedAt, icon: CheckSquare },
                        { label: 'Closed', time: ticket.closedAt, icon: CheckSquare },
                      ].map((entry) => (
                        <div key={entry.label} className="flex items-center gap-3">
                          <entry.icon className={`h-4 w-4 ${entry.time ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm font-medium w-24">{entry.label}</span>
                          <span className="text-sm text-gray-500">{entry.time ? formatDateTime(entry.time) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags & Pillars */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Tags & Pillars</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {ticket.pillars?.map((p: any) => (
                        <span
                          key={p.pillar.name}
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ backgroundColor: p.pillar.color + '20', color: p.pillar.color }}
                        >
                          {p.pillar.name}
                        </span>
                      ))}
                      {(!ticket.pillars || ticket.pillars.length === 0) && (
                        <span className="text-xs text-gray-400">No pillars assigned</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.tags?.map((t: any) => (
                        <Badge key={t.tag} variant="secondary">{t.tag}</Badge>
                      ))}
                      {(!ticket.tags || ticket.tags.length === 0) && (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Related KB */}
                {ticket.kbArticles?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Related KB Articles</CardTitle></CardHeader>
                    <CardContent>
                      {ticket.kbArticles.map((kb: any) => (
                        <Link key={kb.id} href={`/kb/${kb.id}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <BookOpen className="h-4 w-4" /> {kb.title}
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Resolution Tab */}
          <TabsContent value="resolution">
            <Card>
              <CardHeader><CardTitle className="text-base">Resolution Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Summary *</Label>
                  <Textarea
                    value={resolutionData.summary}
                    onChange={(e) => setResolutionData({...resolutionData, summary: e.target.value})}
                    placeholder="Brief summary of what happened and how it was resolved"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Root Cause</Label>
                    <Textarea
                      value={resolutionData.rootCause}
                      onChange={(e) => setResolutionData({...resolutionData, rootCause: e.target.value})}
                      placeholder="What caused the issue?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Fix Applied</Label>
                    <Textarea
                      value={resolutionData.fixApplied}
                      onChange={(e) => setResolutionData({...resolutionData, fixApplied: e.target.value})}
                      placeholder="What was done to fix it?"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Validation Steps</Label>
                    <Textarea
                      value={resolutionData.validationSteps}
                      onChange={(e) => setResolutionData({...resolutionData, validationSteps: e.target.value})}
                      placeholder="How was the fix validated?"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Prevention</Label>
                    <Textarea
                      value={resolutionData.prevention}
                      onChange={(e) => setResolutionData({...resolutionData, prevention: e.target.value})}
                      placeholder="How to prevent this in the future?"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Time Spent (minutes)</Label>
                    <Input
                      type="number"
                      value={resolutionData.timeSpentMinutes || ''}
                      onChange={(e) => setResolutionData({...resolutionData, timeSpentMinutes: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Collaborators</Label>
                    <Input
                      value={resolutionData.collaborators || ''}
                      onChange={(e) => setResolutionData({...resolutionData, collaborators: e.target.value})}
                      placeholder="Names of people who helped"
                    />
                  </div>
                  <div>
                    <Label>Handoff Notes</Label>
                    <Input
                      value={resolutionData.handoffNotes || ''}
                      onChange={(e) => setResolutionData({...resolutionData, handoffNotes: e.target.value})}
                      placeholder="Notes for next person"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveResolution} disabled={savingResolution}>
                  {savingResolution ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Save Resolution
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader><CardTitle className="text-base">Tasks & Follow-ups</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a task..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button size="sm" onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {ticket.tasks?.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-2 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                          <TaskStatusBadge status={task.status} />
                          <span className="text-sm">{task.title}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {task.dueDate ? formatDateTime(task.dueDate) : 'No due date'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence">
            <Card>
              <CardHeader><CardTitle className="text-base">Evidence & Attachments</CardTitle></CardHeader>
              <CardContent>
                {ticket.evidence?.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.evidence.map((ev: any) => (
                      <div key={ev.id} className="flex items-center justify-between p-2 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{ev.fileName}</span>
                          <Badge variant="secondary">{ev.fileType}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">{formatDateTime(ev.uploadedAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No evidence attached yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports">
            <Card>
              <CardHeader><CardTitle className="text-base">Export Ticket</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {['ticket_note', 'handoff', 'change_plan', 'pir'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(type, 'markdown')}
                      disabled={exporting}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('ticket_note', 'docx')}
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-1" /> Ticket Note DOCX
                  </Button>
                </div>
                {exportError && <p className="text-sm text-red-600 mb-3">{exportError}</p>}
                {exportResult && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Preview</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(exportResult);
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                    <pre className="bg-gray-50 border rounded p-4 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                      {exportResult}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
