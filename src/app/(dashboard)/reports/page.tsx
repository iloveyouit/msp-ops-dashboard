'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Download, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
    if (res.ok) setReport(await res.json());
    setLoading(false);
  };

  const exportMarkdown = () => {
    if (!report) return;
    const md = `# Activity Report\n\n**Period:** ${startDate} to ${endDate}\n\n## Summary\n- Total Tickets: ${report.summary.totalTickets}\n- Resolved: ${report.summary.resolvedTickets}\n- Open: ${report.summary.openTickets}\n- Time Spent: ${report.summary.totalTimeMinutes} minutes\n- Tasks Completed: ${report.summary.completedTasks}/${report.summary.totalTasks}\n- KB Articles Created: ${report.summary.kbArticlesCreated}\n\n## By Technology Pillar\n${Object.entries(report.breakdown.byPillar).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n## By Client\n${Object.entries(report.breakdown.byClient).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n## By Priority\n${Object.entries(report.breakdown.byPriority).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n## Tickets\n| Title | Client | Priority | Status | Time |\n|-------|--------|----------|--------|------|\n${report.tickets.map((t: any) => `| ${t.title} | ${t.client} | ${t.priority} | ${t.status} | ${t.timeSpent}m |`).join('\n')}\n`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report-${startDate}-to-${endDate}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header title="Reports" />
      <div className="p-6 space-y-6">
        <Card className="p-4">
          <div className="flex items-end gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { const d = new Date(); d.setDate(d.getDate() - 7); setStartDate(d.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }}>
                Last 7 Days
              </Button>
              <Button size="sm" variant="outline" onClick={() => { const d = new Date(); d.setDate(d.getDate() - 30); setStartDate(d.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }}>
                Last 30 Days
              </Button>
              <Button size="sm" variant="outline" onClick={() => { const d = new Date(); d.setDate(d.getDate() - 90); setStartDate(d.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }}>
                Last 90 Days
              </Button>
            </div>
            <Button onClick={generateReport} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-1" />}
              Generate
            </Button>
          </div>
        </Card>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Tickets', value: report.summary.totalTickets, color: 'text-blue-600' },
                { label: 'Resolved', value: report.summary.resolvedTickets, color: 'text-green-600' },
                { label: 'Time Spent', value: `${Math.round(report.summary.totalTimeMinutes / 60)}h ${report.summary.totalTimeMinutes % 60}m`, color: 'text-purple-600' },
                { label: 'KB Articles', value: report.summary.kbArticlesCreated, color: 'text-orange-600' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* By Pillar */}
              <Card>
                <CardHeader><CardTitle className="text-base">By Technology Pillar</CardTitle></CardHeader>
                <CardContent>
                  {Object.entries(report.breakdown.byPillar).length === 0 ? (
                    <p className="text-sm text-gray-500">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(report.breakdown.byPillar)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([name, count]) => (
                          <div key={name} className="flex items-center justify-between">
                            <span className="text-sm">{name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((count as number) / report.summary.totalTickets) * 100)}%` }} />
                              </div>
                              <span className="text-sm font-medium w-6 text-right">{count as number}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Client */}
              <Card>
                <CardHeader><CardTitle className="text-base">By Client</CardTitle></CardHeader>
                <CardContent>
                  {Object.entries(report.breakdown.byClient).length === 0 ? (
                    <p className="text-sm text-gray-500">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(report.breakdown.byClient)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([name, count]) => (
                          <div key={name} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="text-sm text-gray-600">{count as number} tickets</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* By Priority */}
              <Card>
                <CardHeader><CardTitle className="text-base">By Priority</CardTitle></CardHeader>
                <CardContent>
                  {Object.entries(report.breakdown.byPriority).length === 0 ? (
                    <p className="text-sm text-gray-500">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {['critical', 'high', 'medium', 'low'].map((p) => {
                        const count = (report.breakdown.byPriority[p] || 0) as number;
                        if (count === 0) return null;
                        const colors: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };
                        return (
                          <div key={p} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{p}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 rounded-full h-2">
                                <div className={`${colors[p]} h-2 rounded-full`} style={{ width: `${Math.min(100, (count / report.summary.totalTickets) * 100)}%` }} />
                              </div>
                              <span className="text-sm font-medium w-6 text-right">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ticket List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Tickets in Period</CardTitle>
                <Button variant="outline" size="sm" onClick={exportMarkdown}>
                  <Download className="h-4 w-4 mr-1" /> Export Markdown
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Title</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Client</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Priority</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Status</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.tickets.map((t: any) => (
                        <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 px-2"><a href={`/tickets/${t.id}`} className="text-blue-600 hover:underline">{t.title}</a></td>
                          <td className="py-2 px-2">{t.client}</td>
                          <td className="py-2 px-2 capitalize">{t.priority}</td>
                          <td className="py-2 px-2">{t.status.replace('_', ' ')}</td>
                          <td className="py-2 px-2 text-right">{t.timeSpent}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
