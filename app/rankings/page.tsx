"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageSquareHeart,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingSummary {
  participantId: string;
  displayName: string;
  recordType: string;
  analysisStatus: string;
  totalCandidatesRanked: number;
  topMatch: {
    candidateId: string;
    candidateName: string;
    score: number | null;
    mode: string;
    coveragePercent: number;
  } | null;
}

export default function RankingsIndexPage() {
  const [summaries, setSummaries] = useState<RankingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummaries() {
      try {
        setLoading(true);
        const res = await fetch("/api/rankings");
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load rankings summaries");
        }
        setSummaries(data.summaries || []);
      } catch (err: any) {
        setError(err.message || "Failed to load rankings");
      } finally {
        setLoading(false);
      }
    }
    loadSummaries();
  }, []);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Mutual Compatibility Engine
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Candidate Match Rankings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Select any participant to explore their ranked candidate roster, 5-factor mathematical compatibility breakdowns, evidence coverage, and simulated agent-date evaluations.
          </p>
        </div>

        {summaries.length > 0 && (
          <Link
            href={`/rankings/${summaries[0].participantId}`}
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            View {summaries[0].displayName}&apos;s Dossier
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Directory List */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
          Active Participants Directory
        </h2>

        {loading ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-card border border-border bg-surface py-16">
            <BarChart3 className="h-8 w-8 animate-pulse text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Loading rankings directory...
            </p>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-card border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : summaries.length === 0 ? (
          <div className="mt-4 rounded-card border border-border bg-surface p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted" />
            <h3 className="mt-3 text-base font-bold text-foreground">No participants found</h3>
            <p className="mt-1 text-sm text-muted">
              Add consenting participants with LinkedIn & Instagram source links to calculate compatibility.
            </p>
            <div className="mt-5">
              <Link
                href="/people/new"
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
              >
                Onboard First Participant
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {summaries.map((s) => (
              <Link
                key={s.participantId}
                href={`/rankings/${s.participantId}`}
                className="group relative flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-subtle transition-all hover:border-primary/50 hover:shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {s.displayName}
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <span className="rounded bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted border border-border">
                          {s.recordType}
                        </span>
                        <span>•</span>
                        <span className={cn(
                          s.analysisStatus === "completed" ? "text-evergreen font-medium" : "text-amber-700"
                        )}>
                          Analysis: {s.analysisStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                      <TrendingUp className="h-4 w-4 text-muted group-hover:text-primary" />
                    </div>
                  </div>

                  {/* Top Match Preview */}
                  <div className="mt-4 rounded-lg border border-border/80 bg-surface-muted/40 p-3">
                    <div className="text-[11px] font-medium text-muted uppercase tracking-wider">
                      Top Compatible Candidate
                    </div>
                    {s.topMatch ? (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {s.topMatch.candidateName}
                        </span>
                        <span className="font-mono text-sm font-bold text-primary">
                          {s.topMatch.score !== null ? `${s.topMatch.score}/100` : "—"}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-muted">
                        No candidate pairings calculated yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                  <span>{s.totalCandidatesRanked} candidate evaluations</span>
                  <span className="font-semibold text-primary group-hover:underline">
                    View Rankings Dossier →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
