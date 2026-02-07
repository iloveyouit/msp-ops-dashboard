'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface KBFormProps {
  pillars: any[];
  clients: Array<{ id: string; name: string; acronym: string }>;
  initialData?: any;
}

export function KBFormClient({ pillars, clients, initialData }: KBFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTicket = searchParams.get('fromTicket');
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    title: initialData?.title || '',
    problem: initialData?.problem || '',
    environment: initialData?.environment || '',
    symptoms: initialData?.symptoms || '',
    cause: initialData?.cause || '',
    resolution: initialData?.resolution || '',
    commands: initialData?.commands || '',
    references: initialData?.references || '',
    sensitivity: initialData?.sensitivity || 'internal',
    clientId: initialData?.clientId || '',
    ticketId: fromTicket || initialData?.ticketId || '',
    pillarIds: initialData?.pillarIds || [],
    tags: initialData?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const update = (field: string, value: any) => setData((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      update('tags', [...data.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const togglePillar = (id: string) => {
    update('pillarIds', data.pillarIds.includes(id) ? data.pillarIds.filter((p: string) => p !== id) : [...data.pillarIds, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(initialData ? `/api/kb/${initialData.id}` : '/api/kb', {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const article = await res.json();
      router.push(`/kb/${article.id}`);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <>
      <Header title={initialData ? 'Edit KB Article' : 'New KB Article'} />
      <div className="p-6 max-w-4xl">
        <Link href="/kb" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Knowledge Base
        </Link>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="KB article title" required />
              </div>
              <div>
                <Label>Problem *</Label>
                <Textarea value={data.problem} onChange={(e) => update('problem', e.target.value)} placeholder="Describe the problem" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Symptoms</Label>
                  <Textarea value={data.symptoms} onChange={(e) => update('symptoms', e.target.value)} placeholder="Observable symptoms" rows={3} />
                </div>
                <div>
                  <Label>Root Cause</Label>
                  <Textarea value={data.cause} onChange={(e) => update('cause', e.target.value)} placeholder="Underlying cause" rows={3} />
                </div>
              </div>
              <div>
                <Label>Resolution *</Label>
                <Textarea value={data.resolution} onChange={(e) => update('resolution', e.target.value)} placeholder="Step-by-step resolution" rows={4} required />
              </div>
              <div>
                <Label>Commands / Scripts</Label>
                <Textarea value={data.commands} onChange={(e) => update('commands', e.target.value)} placeholder="PowerShell, CLI, SQL commands used..." rows={3} className="font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Environment</Label>
                  <Input value={data.environment} onChange={(e) => update('environment', e.target.value)} placeholder="e.g. Windows Server 2022, Azure" />
                </div>
                <div>
                  <Label>Client</Label>
                  <Select value={data.clientId} onChange={(e) => update('clientId', e.target.value)}>
                    <option value="">General (no client)</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label>References</Label>
                <Textarea value={data.references} onChange={(e) => update('references', e.target.value)} placeholder="Links, documentation references" rows={2} />
              </div>
              <div>
                <Label>Technology Pillars</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pillars.map((p) => (
                    <button key={p.id} type="button" onClick={() => togglePillar(p.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${data.pillarIds.includes(p.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}} />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {tag} <button type="button" onClick={() => update('tags', data.tags.filter((t: string) => t !== tag))} className="text-gray-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Link href="/kb"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  {initialData ? 'Update Article' : 'Create Article'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
}
