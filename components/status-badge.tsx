import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ready" | "pending" | "failed" | "not_analyzed" | "demo" | "participant" | "synthetic" | "consented";
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  switch (status) {
    case "ready":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-secondary-soft bg-secondary-soft/70 px-2.5 py-0.5 text-xs font-medium text-secondary",
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          {label || "Profile Ready"}
        </span>
      );
    case "pending":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-warning-soft bg-warning-soft/70 px-2.5 py-0.5 text-xs font-medium text-warning",
            className
          )}
        >
          <Clock className="h-3 w-3 stroke-[2.5] animate-spin" />
          {label || "Analyzing..."}
        </span>
      );
    case "failed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-danger-soft bg-danger-soft/70 px-2.5 py-0.5 text-xs font-medium text-danger",
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
          {label || "Needs Attention"}
        </span>
      );
    case "not_analyzed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted" />
          {label || "Not Analyzed"}
        </span>
      );
    case "demo":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-primary-soft bg-primary-soft/60 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider",
            className
          )}
        >
          <Database className="h-3 w-3" />
          {label || "Demo Seed"}
        </span>
      );
    case "participant":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-secondary-soft bg-secondary-soft/50 px-2.5 py-0.5 text-[11px] font-semibold text-secondary uppercase tracking-wider",
            className
          )}
        >
          <Sparkles className="h-3 w-3" />
          {label || "Consented"}
        </span>
      );
    case "synthetic":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted uppercase tracking-wider",
            className
          )}
        >
          {label || "Synthetic Test"}
        </span>
      );
    case "consented":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-secondary-soft bg-secondary-soft/70 px-2.5 py-0.5 text-xs font-medium text-secondary",
            className
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5 stroke-[2]" />
          {label || "Consent Recorded"}
        </span>
      );
    default:
      return null;
  }
}
