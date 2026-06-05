'use client';

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
      <Copy className="w-4 h-4 mr-2" />
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}