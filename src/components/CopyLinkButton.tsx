'use client';

import { useState } from 'react';
import { Copy, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className="h-11 rounded-2xl border-white/10 bg-white/5 px-4 text-sm backdrop-blur-xl hover:bg-white/10"
    >
      {copied ? <Copy className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
      {copied ? 'Copied' : 'Copy link'}
    </Button>
  );
}
