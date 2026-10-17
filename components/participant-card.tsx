import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, User, Calendar } from "lucide-react";
import { Participant } from "@/lib/schemas";
import { StatusBadge } from "@/components/status-badge";
import { SourceLinks } from "@/components/source-links";
import { formatDate } from "@/lib/utils";

interface ParticipantCardProps {
  participant: Participant;
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  const isAnalyzed = participant.analysisStatus === "completed" && participant.analysis;
  const interests = participant.analysis?.interests || [];

  return (
    <div className="group relative flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-dropdown">
      <div className="space-y-3.5">
        {/* Header row: Name, Avatar icon, Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground/80 font-bold text-base transition-colors group-hover:bg-primary-soft group-hover:text-primary">
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base tracking-tight group-hover:text-primary transition-colors">
                {participant.displayName}
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                <StatusBadge status={participant.recordType} />
              </div>
            </div>
          </div>

          <StatusBadge
            status={
              participant.analysisStatus === "completed"
                ? "ready"
                : participant.analysisStatus === "pending"
                ? "pending"
                : participant.analysisStatus === "failed"
                ? "failed"
                : "not_analyzed"
            }
          />
        </div>

        {/* Source Links */}
        <div className="border-t border-border/60 pt-3">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
            Official Source Provenance
          </div>
          <SourceLinks
            linkedinUrl={participant.linkedinUrl}
            instagramUrl={participant.instagramUrl}
            compact
          />
        </div>

        {/* Extracted signals preview if analyzed */}
        {isAnalyzed && interests.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Identified Interests
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs text-foreground/90"
                >
                  {interest}
                </span>
              ))}
              {interests.length > 3 && (
                <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-muted">
                  +{interests.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* If not analyzed, show helper */}
        {!isAnalyzed && (
          <p className="text-xs text-muted leading-relaxed italic">
            Source content registered. Profile analysis pending.
          </p>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5">
        <span className="flex items-center gap-1 text-[11px] text-muted">
          <Calendar className="h-3 w-3" />
          {formatDate(participant.createdAt).split(",")[0]}
        </span>

        <Link
          href={`/people/${participant.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-hover group-hover:translate-x-0.5"
        >
          View Profile
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
