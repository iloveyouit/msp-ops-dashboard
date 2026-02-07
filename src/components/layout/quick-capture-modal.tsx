'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface QuickCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Array<{ id: string; name: string; acronym: string }>;
}

interface DraftData {
  title: string;
  clientId: string;
  category: string;
  priority: string;
  symptoms: string;
  impactedService: string;
  quickNotes: string;
}

const DRAFT_KEY = 'msp-ops-quick-capture-draft';

export function QuickCaptureModal({ open, onOpenChange, clients }: QuickCaptureModalProps) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DraftData>({
    title: '',
    clientId: '',
    category: 'incident',
    priority: 'medium',
    symptoms: '',
    impactedService: '',
    quickNotes: '',
  });

  // Load draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        try { setData(JSON.parse(draft)); } catch {}
      }
    }
  }, []);

  // Auto-save draft every 10s
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      if (data.title || data.symptoms || data.quickNotes) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [open, data]);

  const update = (field: keyof DraftData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const ticket = await res.json();
        sessionStorage.removeItem(DRAFT_KEY);
        setData({
          title: '',
          clientId: '',
          category: 'incident',
          priority: 'medium',
          symptoms: '',
          impactedService: '',
          quickNotes: '',
        });
        onOpenChange(false);
        window.location.href = `/tickets/${ticket.id}`;
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create ticket');
      }
    } catch (err) {
      alert('Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Quick Capture — New Ticket</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="qc-title">Title *</Label>
              <Input
                id="qc-title"
                value={data.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Brief description of the issue"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qc-client">Client *</Label>
                <Select
                  id="qc-client"
                  value={data.clientId}
                  onChange={(e) => update('clientId', e.target.value)}
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="qc-category">Category</Label>
                <Select
                  id="qc-category"
                  value={data.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  <option value="incident">Incident</option>
                  <option value="service_request">Service Request</option>
                  <option value="problem">Problem</option>
                  <option value="change">Change</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qc-priority">Priority</Label>
                <Select
                  id="qc-priority"
                  value={data.priority}
                  onChange={(e) => update('priority', e.target.value)}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="qc-service">Affected System</Label>
                <Input
                  id="qc-service"
                  value={data.impactedService}
                  onChange={(e) => update('impactedService', e.target.value)}
                  placeholder="e.g. Exchange, Azure AD"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qc-symptoms">Symptoms</Label>
              <Textarea
                id="qc-symptoms"
                value={data.symptoms}
                onChange={(e) => update('symptoms', e.target.value)}
                placeholder="What is the user experiencing?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="qc-notes">Quick Notes</Label>
              <Textarea
                id="qc-notes"
                value={data.quickNotes}
                onChange={(e) => update('quickNotes', e.target.value)}
                placeholder="Initial observations, steps taken..."
                rows={3}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Create Ticket
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
