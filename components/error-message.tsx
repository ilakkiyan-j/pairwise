import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ title = "Something went wrong", message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-card border border-danger-soft bg-danger-soft/40 p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-danger">{title}</h4>
          <p className="mt-0.5 text-xs text-foreground/80 sm:text-sm">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 self-start rounded-btn border border-danger/30 bg-surface px-3 py-1.5 text-xs font-medium text-danger shadow-subtle hover:bg-danger-soft/50 sm:self-center"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
