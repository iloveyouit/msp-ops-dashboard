'use client';

import { Plus, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  onQuickCapture?: () => void;
}

export function Header({ title, onQuickCapture }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tickets?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tickets, KB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </form>
        
        {onQuickCapture && (
          <Button onClick={onQuickCapture} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Quick Capture
          </Button>
        )}
        
        <button className="relative p-2 rounded-md hover:bg-gray-100 text-gray-500">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
