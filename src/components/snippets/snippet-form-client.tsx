'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SNIPPET_LANGUAGES } from '@/lib/utils';

interface SnippetFormProps {
  pillars: any[];
}

export function SnippetFormClient({ pillars }: SnippetFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    title: '', language: 'powershell', code: '', description: '', usageNotes: '',
    tags: [] as string[], pillarIds: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const update = (field: string, value: any) => setData((prev) => ({ ...prev, [field]: value }));
  const addTag = () => { if (tagInput.trim() && !data.tags.includes(tagInput.trim())) { update('tags', [...data.tags, tagInput.trim()]); setTagInput(''); }};
  const togglePillar = (id: string) => update('pillarIds', data.pillarIds.includes(id) ? data.pillarIds.filter((p) => p !== id) : [...data.pillarIds, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push('/snippets');
    else alert('Failed to create snippet');
    setSaving(false);
  };

  return (
    <>
      <Header title="New Snippet" />
      <div className="p-6 max-w-3xl">
        <Link href="/snippets" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Snippets
        </Link>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={data.title} onChange={(e) => update('title', e.target.value)} required /></div>
                <div><Label>Language *</Label><Select value={data.language} onChange={(e) => update('language', e.target.value)}>
                  {SNIPPET_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select></div>
              </div>
              <div><Label>Code *</Label><Textarea value={data.code} onChange={(e) => update('code', e.target.value)} rows={10} className="font-mono text-sm" required placeholder="Paste your code here..." /></div>
              <div><Label>Description</Label><Input value={data.description} onChange={(e) => update('description', e.target.value)} placeholder="What does this snippet do?" /></div>
              <div><Label>Usage Notes</Label><Textarea value={data.usageNotes} onChange={(e) => update('usageNotes', e.target.value)} rows={2} placeholder="When and how to use this..." /></div>
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
                  {data.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {tag} <button type="button" onClick={() => update('tags', data.tags.filter((t) => t !== tag))} className="text-gray-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Link href="/snippets"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}<Save className="h-4 w-4 mr-1" /> Create Snippet</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
}
