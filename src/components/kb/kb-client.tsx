'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { BookOpen, Search, Plus } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface KBClientProps {
  pillars: Array<{ id: string; name: string; color: string | null }>;
}

export function KBClient({ pillars }: KBClientProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pillarId, setPillarId] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (pillarId) params.set('pillarId', pillarId);
    const res = await fetch(`/api/kb?${params}`);
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }, [search, pillarId]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  return (
    <>
      <Header title="Knowledge Base" />
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search KB articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={pillarId} onChange={(e) => setPillarId(e.target.value)} className="w-48">
              <option value="">All Pillars</option>
              {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Link href="/kb/new">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Article</Button>
            </Link>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-lg border p-4 animate-pulse h-24" />)}</div>
        ) : articles.length === 0 ? (
          <EmptyState icon={BookOpen} title="No articles found" description="Build your knowledge base by creating articles from tickets or from scratch." actionLabel="New Article" actionHref="/kb/new" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/kb/${article.id}`} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.problem}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {article.pillars?.map((p: any) => (
                        <span key={p.pillar.name} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: p.pillar.color + '20', color: p.pillar.color }}>{p.pillar.name}</span>
                      ))}
                      {article.tags?.map((t: any) => <Badge key={t.tag} variant="secondary" className="text-xs">{t.tag}</Badge>)}
                      {article.client && <span className="text-xs text-gray-500">{article.client.acronym}</span>}
                      {article.ticket && <span className="text-xs text-blue-600">From ticket: {article.ticket.title}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{timeAgo(article.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
