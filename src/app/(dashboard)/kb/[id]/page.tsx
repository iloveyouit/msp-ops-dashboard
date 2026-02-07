import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Ticket } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function KBDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.kBArticle.findUnique({
    where: { id },
    include: {
      pillars: { include: { pillar: true } },
      tags: true,
      client: true,
      ticket: { select: { id: true, title: true, externalId: true } },
      user: { select: { name: true } },
    },
  });

  if (!article) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/kb" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Knowledge Base
      </Link>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            By {article.user.name} · Updated {formatDateTime(article.updatedAt)}
            {article.client && ` · ${article.client.name}`}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {article.pillars.map((p: { pillar: { name: string; color: string | null } }) => (
              <span key={p.pillar.name} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: (p.pillar.color || '#666') + '20', color: p.pillar.color || '#666' }}>{p.pillar.name}</span>
            ))}
            {article.tags.map((t: { tag: string }) => <Badge key={t.tag} variant="secondary">{t.tag}</Badge>)}
          </div>
        </div>
        <Link href={`/kb/new?edit=${article.id}`}>
          <Button variant="outline" size="sm"><Edit2 className="h-4 w-4 mr-1" /> Edit</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Problem</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{article.problem}</p></CardContent>
        </Card>

        {article.symptoms && (
          <Card>
            <CardHeader><CardTitle className="text-base">Symptoms</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap">{article.symptoms}</p></CardContent>
          </Card>
        )}

        {article.cause && (
          <Card>
            <CardHeader><CardTitle className="text-base">Root Cause</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap">{article.cause}</p></CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Resolution</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{article.resolution}</p></CardContent>
        </Card>

        {article.commands && (
          <Card>
            <CardHeader><CardTitle className="text-base">Commands / Scripts</CardTitle></CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-auto font-mono whitespace-pre-wrap">{article.commands}</pre>
            </CardContent>
          </Card>
        )}

        {article.references && (
          <Card>
            <CardHeader><CardTitle className="text-base">References</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap">{article.references}</p></CardContent>
          </Card>
        )}

        {article.ticket && (
          <Card>
            <CardHeader><CardTitle className="text-base">Related Ticket</CardTitle></CardHeader>
            <CardContent>
              <Link href={`/tickets/${article.ticket.id}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                <Ticket className="h-4 w-4" />
                {article.ticket.externalId || article.ticket.id}: {article.ticket.title}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
