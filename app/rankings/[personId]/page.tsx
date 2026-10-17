"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CandidateRanking,
  Participant,
  MATCH_ALGORITHM_VERSION,
  MATCH_WEIGHTS,
} from "@/lib/schemas";
import { RankingCard } from "@/components/ranking-card";
import {
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Users,
  Info,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ParticipantRankingsPage({
  params,
}: {
  params: { personId: string };
}) {
  const router = useRouter();
  const { personId } = params;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "completed_date" | "pre_date">("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch participant info and candidate rankings
      const [participantRes, rankingsRes, allPeopleRes] = await Promise.all([
        fetch(`/api/people/${personId}`),
        fetch(`/api/rankings/${personId}`),
        fetch(`/api/people`),
      ]);

      const participantData = await participantRes.json();
      const rankingsData = await rankingsRes.json();
      const allPeopleData = await allPeopleRes.json();

      if (!participantRes.ok || !participantData.success) {
        throw new Error(participantData.error || "Failed to load participant");
      }

      setParticipant(participantData.participant);
      setRankings(rankingsData.rankings || []);
      setAllParticipants(allPeopleData.people || []);
    } catch (err: any) {
      setError(err.message || "Failed to load rankings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [personId]);

  const handleRecompute = async () => {
    try {
      setRecomputing(true);
      const res = await fetch(`/api/rankings/${personId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to recompute rankings");
      }
      setRankings(data.rankings || []);
    } catch (err: any) {
      alert(`Error recomputing: ${err.message}`);
    } finally {
      setRecomputing(false);
    }
  };

  const filteredRankings = rankings.filter((r) => {
    if (filterMode === "all") return true;
    return r.mode === filterMode;
  });

  const topMatch = rankings.find((r) => r.status === "scored");
  const completedDateCount = rankings.filter((r) => r.mode === "completed_date").length;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <Link href="/rankings" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            All Rankings
          </Link>
          <span>/</span>
          {participant && (
            <Link href={`/people/${participant.id}`} className="hover:text-foreground transition-colors">
              {participant.displayName}
            </Link>
          )}
          <span>/</span>
          <span className="text-foreground font-semibold">Compatibility Dossier</span>
        </div>

        {/* Participant Selector */}
        {allParticipants.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-muted">Viewing as:</span>
            <select
              value={personId}
              onChange={(e) => router.push(`/rankings/${e.target.value}`)}
              className="rounded-btn border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              {allParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.recordType})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Mutual Compatibility Rankings
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {participant ? participant.displayName : "Participant"}&apos;s Match Rankings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Ranked candidate roster computed by the deterministic 5-factor{" "}
            <strong className="text-foreground">{MATCH_ALGORITHM_VERSION}</strong> engine. Grounded strictly in consented source provenance and completed agent dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecompute}
            disabled={recomputing || loading}
            className="flex items-center gap-2 rounded-btn border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", recomputing && "animate-spin text-primary")} />
            {recomputing ? "Recomputing..." : "Recalculate Scores"}
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
          <div className="text-xs font-medium text-muted">Candidates Evaluated</div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {rankings.length}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">Active consented profiles</div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
          <div className="text-xs font-medium text-muted">Top Match</div>
          <div className="mt-1 font-mono text-2xl font-bold text-primary">
            {topMatch && topMatch.score !== null ? `${topMatch.score}/100` : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-foreground font-medium truncate">
            {topMatch ? topMatch.candidateName : "No scored candidates"}
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
          <div className="text-xs font-medium text-muted">Completed Dates</div>
          <div className="mt-1 font-mono text-2xl font-bold text-evergreen">
            {completedDateCount}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">5-factor date verifications</div>
        </div>

        <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
          <div className="text-xs font-medium text-muted">Algorithm Engine</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">
            {MATCH_ALGORITHM_VERSION}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">Deterministic arithmetic</div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode("all")}
            className={cn(
              "rounded-btn px-3 py-1.5 text-xs font-semibold transition-colors",
              filterMode === "all"
                ? "bg-foreground text-surface shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            All Candidates ({rankings.length})
          </button>
          <button
            onClick={() => setFilterMode("completed_date")}
            className={cn(
              "rounded-btn px-3 py-1.5 text-xs font-semibold transition-colors",
              filterMode === "completed_date"
                ? "bg-evergreen text-white shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            Completed Agent Dates ({completedDateCount})
          </button>
          <button
            onClick={() => setFilterMode("pre_date")}
            className={cn(
              "rounded-btn px-3 py-1.5 text-xs font-semibold transition-colors",
              filterMode === "pre_date"
                ? "bg-amber-800 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            Pre-Date Estimates ({rankings.length - completedDateCount})
          </button>
        </div>

        <div className="text-xs text-muted">
          Sorted by mutual compatibility score & evidence coverage
        </div>
      </div>

      {/* Candidate Ranking List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-border bg-surface py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Computing compatibility rankings...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted" />
            <h3 className="mt-3 text-base font-bold text-foreground">No candidate rankings found</h3>
            <p className="mt-1 text-sm text-muted">
              Add more consenting participants and run profile analysis to generate compatibility pairings.
            </p>
            <div className="mt-5">
              <Link
                href="/people/new"
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
              >
                Onboard New Participant
              </Link>
            </div>
          </div>
        ) : (
          filteredRankings.map((ranking) => (
            <RankingCard
              key={ranking.candidateId}
              ranking={ranking}
              currentParticipantName={participant?.displayName || "Participant"}
            />
          ))
        )}
      </div>

      {/* Transparent Algorithm Specification Box */}
      <section className="mt-12 rounded-card border border-border bg-surface-muted/50 p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <Info className="h-4 w-4 text-primary" />
          Transparency & Deterministic Matching Protocol
        </div>

        <p className="mt-2 text-xs text-muted leading-relaxed">
          In accordance with the PairWise Charter, scores are strictly mathematical aggregations over permitted evidence, never black-box hallucinations.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-bold text-foreground">Relationship Goals</div>
            <div className="font-mono text-primary font-semibold mt-0.5">30% Weight</div>
            <p className="text-[11px] text-muted mt-1">Intent, commitment timeline, family vision.</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-bold text-foreground">Lifestyle & Values</div>
            <div className="font-mono text-primary font-semibold mt-0.5">25% Weight</div>
            <p className="text-[11px] text-muted mt-1">Day-to-day cadence, core priorities, ethics.</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-bold text-foreground">Shared Interests</div>
            <div className="font-mono text-primary font-semibold mt-0.5">20% Weight</div>
            <p className="text-[11px] text-muted mt-1">Active hobbies, creative & leisure activities.</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-bold text-foreground">Communication</div>
            <div className="font-mono text-primary font-semibold mt-0.5">15% Weight</div>
            <p className="text-[11px] text-muted mt-1">Frequency, directness, conflict navigation.</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-bold text-foreground">Agent-Date Quality</div>
            <div className="font-mono text-evergreen font-semibold mt-0.5">10% Weight</div>
            <p className="text-[11px] text-muted mt-1">Listening, curiosity, conversational chemistry.</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
          <div>
            <strong>Strictly Excluded Factors:</strong> PairWise strictly excludes attractiveness ratings, popularity metrics, follower counts, race/ethnicity, health data, income inferences, and religion from all compatibility evaluations.
          </div>
        </div>
      </section>
    </div>
  );
}
