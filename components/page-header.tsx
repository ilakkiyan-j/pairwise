import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ badge, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div className="space-y-1.5">
        {badge && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2.5">{action}</div>}
    </div>
  );
}
