'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Plus, Save, Loader2, Building2, Layers, FileText } from 'lucide-react';

interface SettingsClientProps {
  clients: any[];
  pillars: any[];
  templates: any[];
}

export function SettingsClient({ clients: initialClients, pillars, templates: initialTemplates }: SettingsClientProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [templates, setTemplates] = useState(initialTemplates);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', acronym: '', notes: '', envType: 'hybrid', envTags: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    });
    if (res.ok) {
      const client = await res.json();
      setClients([...clients, client]);
      setShowNewClient(false);
      setNewClient({ name: '', acronym: '', notes: '', envType: 'hybrid', envTags: [] });
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create');
    }
    setSaving(false);
  };

  const handleToggleClient = async (id: string, isActive: boolean) => {
    await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setClients(clients.map((c) => c.id === id ? { ...c, isActive: !isActive } : c));
  };

  return (
    <>
      <Header title="Settings" />
      <div className="p-6">
        <Tabs defaultValue="clients">
          <TabsList>
            <TabsTrigger value="clients"><Building2 className="h-4 w-4 mr-1" /> Clients</TabsTrigger>
            <TabsTrigger value="pillars"><Layers className="h-4 w-4 mr-1" /> Pillars</TabsTrigger>
            <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" /> Templates</TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowNewClient(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Client
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {clients.map((client) => (
                  <Card key={client.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{client.name}</span>
                          <Badge variant="outline">{client.acronym}</Badge>
                          <Badge variant={client.isActive ? 'default' : 'secondary'}>
                            {client.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="secondary">{client.envType}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {client._count?.tickets || 0} tickets
                          {client.notes && ` · ${client.notes}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleClient(client.id, client.isActive)}>
                        {client.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Pillars Tab */}
          <TabsContent value="pillars">
            <div className="grid grid-cols-2 gap-3">
              {pillars.map((pillar) => (
                <Card key={pillar.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pillar.color || '#666' }} />
                    <div>
                      <span className="font-medium">{pillar.name}</span>
                      <p className="text-xs text-gray-500">Sort order: {pillar.sortOrder}</p>
                    </div>
                    <Badge variant={pillar.isActive ? 'default' : 'secondary'} className="ml-auto">
                      {pillar.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline">{template.type}</Badge>
                      {template.isDefault && <Badge>Default</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-32 whitespace-pre-wrap">{template.content.substring(0, 300)}...</pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Client Dialog */}
      <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
        <DialogHeader><DialogTitle>Add Client</DialogTitle></DialogHeader>
        <form onSubmit={handleCreateClient}>
          <DialogContent>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} required /></div>
              <div><Label>Acronym *</Label><Input value={newClient.acronym} onChange={(e) => setNewClient({...newClient, acronym: e.target.value.toUpperCase()})} maxLength={10} required placeholder="e.g. CON" /></div>
              <div><Label>Environment Type</Label><Select value={newClient.envType} onChange={(e) => setNewClient({...newClient, envType: e.target.value})}><option value="hybrid">Hybrid</option><option value="azure">Azure</option><option value="on-prem">On-Prem</option></Select></div>
              <div><Label>Notes</Label><Textarea value={newClient.notes} onChange={(e) => setNewClient({...newClient, notes: e.target.value})} rows={2} /></div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewClient(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create Client</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={true} onOpenChange={() => setEditingTemplate(null)}>
          <DialogHeader><DialogTitle>Edit Template: {editingTemplate.name}</DialogTitle></DialogHeader>
          <DialogContent>
            <div className="space-y-3">
              <div>
                <Label>Template Content</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                  rows={15}
                  className="font-mono text-xs"
                />
              </div>
              <p className="text-xs text-gray-500">
                Use {'{{variable}}'} placeholders. Available: title, client, ticketId, priority, status, category,
                symptoms, quickNotes, resolution.summary, resolution.rootCause, etc.
              </p>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={() => { /* save template */ setEditingTemplate(null); }}>Save Template</Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
