'use client';

import dynamic from 'next/dynamic';

// Loaded client-side only — excluded from SSR/initial server bundle
const PwaInstallPrompt = dynamic(() => import('./PwaInstallPrompt'), { ssr: false });

export default function PwaInstallPromptLazy() {
  return <PwaInstallPrompt />;
}
