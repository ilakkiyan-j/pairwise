import React from "react";
import { ExternalLink, Linkedin, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceLinksProps {
  linkedinUrl: string;
  instagramUrl: string;
  className?: string;
  compact?: boolean;
}

export function SourceLinks({ linkedinUrl, instagramUrl, className, compact }: SourceLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-btn border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-muted hover:text-primary",
          compact && "px-2 py-0.5 text-[11px]"
        )}
        title="Open official LinkedIn profile in new tab"
      >
        <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
        <span>LinkedIn</span>
        <ExternalLink className="h-2.5 w-2.5 text-muted" />
      </a>

      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-btn border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-muted hover:text-primary",
          compact && "px-2 py-0.5 text-[11px]"
        )}
        title="Open official Instagram profile in new tab"
      >
        <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
        <span>Instagram</span>
        <ExternalLink className="h-2.5 w-2.5 text-muted" />
      </a>
    </div>
  );
}
