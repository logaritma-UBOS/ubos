'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import MarketingPlaybook from '@/components/MarketingPlaybook';
import { Target } from 'lucide-react';

export default function PlaybookPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Target className="text-primary" /> Marketing & Strategic Playbook
        </h2>
        <p className="text-sm text-slate-400 mt-1">Panduan strategi eksekusi, Unique Selling Proposition, dan komparasi fitur Logaritma UBOS.</p>
      </div>
      
      <MarketingPlaybook />
    </div>
  );
}
