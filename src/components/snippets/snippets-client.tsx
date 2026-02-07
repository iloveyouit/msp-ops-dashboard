'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Code2, Search, Plus, Copy, Check } from 'lucide-react';
import { SNIPPET_LANGUAGES } from '@/lib/utils';

export function SnippetsClient() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (language) params.set('language', language);
    const res = await fetch(`/api/snippets?${params}`);
    if (res.ok) setSnippets(await res.json());
    setLoading(false);
  }, [search, language]);

  useEffect(() => { fetchSnippets(); }, [fetchSnippets]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Header title="Snippets" />
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-40">
              <option value="">All Languages</option>
              {SNIPPET_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Link href="/snippets/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Snippet</Button>
            </Link>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-lg border p-4 animate-pulse h-32" />)}</div>
        ) : snippets.length === 0 ? (
          <EmptyState icon={Code2} title="No snippets" description="Save reusable code snippets for quick access." actionLabel="New Snippet" actionHref="/snippets/new" />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {snippets.map((snippet) => (
              <Card key={snippet.id}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{snippet.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{snippet.language}</Badge>
                      {snippet.tags?.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                      {snippet.pillars?.map((p: any) => (
                        <span key={p.pillar.name} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: p.pillar.color + '20', color: p.pillar.color }}>{p.pillar.name}</span>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyCode(snippet.id, snippet.code)}>
                    {copiedId === snippet.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  {snippet.description && <p className="text-sm text-gray-500 mb-2">{snippet.description}</p>}
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs overflow-auto max-h-48 font-mono">{snippet.code}</pre>
                  {snippet.usageNotes && <p className="text-xs text-gray-500 mt-2 italic">{snippet.usageNotes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
