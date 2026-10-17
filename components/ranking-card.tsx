"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CandidateRanking,
  MATCH_WEIGHTS,
} from "@/lib/schemas";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  MessageSquareHeart,
  User,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingCardProps {
  ranking: CandidateRanking;
  currentParticipantName: string;
}

const FACTOR_LABELS: Record<string, { label: string; weight: number }> = {
  relationshipGoals: { label: "Relationship Goals & Intent", weight: MATCH_WEIGHTS.relationshipGoals },
  lifestyleValues: { label: "Lifestyle & Values", weight: MATCH_WEIGHTS.lifestyleValues },
  sharedInterests: { label: "Shared Interests & Activities", weight: MATCH_WEIGHTS.sharedInterests },
  communicationPreferences: { label: "Communication Preferences", weight: MATCH_WEIGHTS.communicationPreferences },
  dateConversation: { label: "Agent-Date Conversation Quality", weight: MATCH_WEIGHTS.dateConversation },
};

export function RankingCard({ ranking, currentParticipantName }: RankingCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isScored = ranking.status === "scored" && ranking.score !== null;
  const isCompletedDate = ranking.mode === "completed_date";

  // Score color gradient
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted border-border bg-surface-muted";
    if (score >= 80) return "text-primary border-primary/30 bg-primary-soft";
    if (score >= 65) return "text-evergreen border-evergreen/30 bg-evergreen-soft";
    if (score >= 50) return "text-amber-800 border-amber-300 bg-amber-50";
    return "text-stone-700 border-stone-300 bg-stone-100";
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">High Confidence</span>;
      case "medium":
        return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">Medium Confidence</span>;
      default:
        return <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 border border-stone-200">Low Confidence</span>;
    }
  };

  const getCoverageLabel = (coverage: number) => {
    if (coverage >= 80) return `High Evidence (${coverage}%)`;
    if (coverage >= 50) return `Moderate Evidence (${coverage}%)`;
    return `Limited Evidence (${coverage}%)`;
  };

  return (
    <article className="group relative rounded-card border border-border bg-surface p-5 sm:p-6 shadow-subtle transition-all hover:shadow-card">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          {/* Rank Badge */}
          <div
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm",
              ranking.rank === 1
                ? "bg-primary text-white ring-2 ring-primary/20"
                : ranking.rank === 2
                ? "bg-evergreen text-white"
                : "bg-surface-muted text-foreground border border-border"
            )}
          >
            {ranking.rank <= 3 && <Trophy className="mr-1 h-3.5 w-3.5" />}
            #{ranking.rank}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/people/${ranking.candidateId}`}
                className="text-lg font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {ranking.candidateName}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted border border-border">
                {ranking.candidateRecordType}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border",
                  isCompletedDate
                    ? "bg-evergreen-soft text-evergreen border-evergreen/20"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                {isCompletedDate ? "Completed Agent Date" : "Pre-Date Estimate"}
              </span>
              <span>•</span>
              <span>{getCoverageLabel(ranking.coveragePercent)}</span>
              <span>•</span>
              {getConfidenceBadge(ranking.confidence)}
            </div>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div
            className={cn(
              "flex items-baseline gap-1 rounded-xl border px-4 py-2 font-mono shadow-sm",
              getScoreColor(ranking.score)
            )}
          >
            <span className="text-3xl font-extrabold tracking-tight">
              {isScored ? ranking.score : "—"}
            </span>
            <span className="text-xs font-semibold opacity-70">/ 100</span>
          </div>
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Compatibility Score
          </span>
        </div>
      </div>

      {/* Highlights & Friction Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Why it may work */}
        <div className="rounded-lg border border-border/80 bg-surface-muted/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-evergreen">
            <Sparkles className="h-3.5 w-3.5" />
            Why It May Work
          </div>
          <ul className="mt-2 space-y-1.5">
            {ranking.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                <span className="text-evergreen font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential Friction */}
        <div className="rounded-lg border border-border/80 bg-surface-muted/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            Potential Friction & Differences
          </div>
          <ul className="mt-2 space-y-1.5">
            {ranking.possibleFriction.map((friction, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                <span className="text-amber-600 font-bold">•</span>
                <span>{friction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Unknowns Bar */}
      {ranking.unknowns && ranking.unknowns.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/60 bg-surface-muted/20 px-3.5 py-2.5 text-xs text-muted">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted" />
          <div className="flex-1">
            <span className="font-semibold text-foreground">Open Questions: </span>
            <span>{ranking.unknowns.join(" • ")}</span>
          </div>
        </div>
      )}

      {/* Expandable 5-Factor Details */}
      <div className="mt-4 border-t border-border pt-3">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between text-xs font-semibold text-muted hover:text-foreground transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            {detailsOpen ? "Hide" : "Inspect"} 5-Factor Arithmetic Breakdown ({ranking.algorithmVersion})
          </span>
          {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {detailsOpen && (
          <div className="mt-3 space-y-3.5 rounded-lg border border-border bg-surface-muted/30 p-4 animate-in fade-in-50 duration-200">
            <div className="text-[11px] text-muted italic">
              Scores are calculated via symmetric mutual aggregation: (Score<sub>A→B</sub> + Score<sub>B→A</sub>) / 2. Unknown dimensions are omitted from denominator, not penalized as zero.
            </div>

            {Object.entries(FACTOR_LABELS).map(([key, config]) => {
              const factor = ranking.factorScores[key];
              if (!factor) return null;

              const hasScore = factor.score !== null;

              return (
                <div key={key} className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {config.label} <span className="font-normal text-muted">({config.weight}% weight)</span>
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {hasScore ? `${factor.score}/100` : "Unassessed"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        hasScore && factor.score! >= 75 ? "bg-evergreen" : hasScore && factor.score! >= 60 ? "bg-primary" : "bg-amber-500"
                      )}
                      style={{ width: `${factor.score ?? 0}%` }}
                    />
                  </div>

                  {/* Directional Sub-scores */}
                  {(factor.directionalA !== undefined || factor.directionalB !== undefined) && (
                    <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-muted">
                      {factor.directionalA !== undefined && factor.directionalA !== null && (
                        <span>
                          {currentParticipantName} evaluated {ranking.candidateName}:{" "}
                          <strong className="text-foreground">{factor.directionalA}/100</strong>
                        </span>
                      )}
                      {factor.directionalB !== undefined && factor.directionalB !== null && (
                        <span>
                          {ranking.candidateName} evaluated {currentParticipantName}:{" "}
                          <strong className="text-foreground">{factor.directionalB}/100</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rationale */}
                  {factor.rationale && (
                    <p className="mt-1 text-[11px] text-muted leading-relaxed">
                      {factor.rationale}
                    </p>
                  )}

                  {/* Evidence References */}
                  {factor.evidenceRefs && factor.evidenceRefs.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {factor.evidenceRefs.map((ref, rIdx) => (
                        <span
                          key={rIdx}
                          className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-foreground/80 border border-border"
                        >
                          Source: {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Link
          href={`/people/${ranking.candidateId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <User className="h-3.5 w-3.5" />
          View Full Profile & Provenance
        </Link>

        <div className="flex items-center gap-2">
          {ranking.dateId ? (
            <Link
              href={`/dates/${ranking.dateId}`}
              className="inline-flex items-center gap-1.5 rounded-btn bg-evergreen px-3.5 py-1.5 text-xs font-medium text-white hover:bg-evergreen/90 transition-colors shadow-sm"
            >
              <MessageSquareHeart className="h-3.5 w-3.5" />
              Inspect Agent Date Transcript
            </Link>
          ) : (
            <Link
              href={`/dates?p1=${ranking.participantId}&p2=${ranking.candidateId}`}
              className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-3.5 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Simulate Agent Date
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
