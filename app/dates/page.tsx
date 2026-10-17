"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquareHeart,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorMessage } from "@/components/error-message";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { Participant, DateSession } from "@/lib/schemas";

interface EnrichedDateSession extends DateSession {
  participantAName?: string;
  participantBName?: string;
}

export default function DatesIndexPage() {
  const router = useRouter();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dates, setDates] = useState<EnrichedDateSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [peopleRes, datesRes] = await Promise.all([
        fetch("/api/people"),
        fetch("/api/dates"),
      ]);

      const peopleData = await peopleRes.json();
      const datesData = await datesRes.json();

      setParticipants(peopleData.participants || []);
      setDates(datesData.dates || []);

      // Auto-select first two if available
      if (peopleData.participants?.length >= 2) {
        setSelectedA(peopleData.participants[0].id);
        setSelectedB(peopleData.participants[1].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dating data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLaunchDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunchError(null);

    if (!selectedA || !selectedB) {
      setLaunchError("Please select both participants to launch a date.");
      return;
    }

    if (selectedA === selectedB) {
      setLaunchError("A participant cannot date themselves. Please choose two different people.");
      return;
    }

    setIsLaunching(true);

    try {
      const res = await fetch("/api/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantAId: selectedA,
          participantBId: selectedB,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to simulate agent date");
      }

      router.push(`/dates/${data.date.id}`);
    } catch (err: any) {
      setLaunchError(err?.message || "Failed to start date session.");
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Dating Arena"
        title="Agent-to-Agent Dating"
        description="Launch real alternating, multi-turn conversations between independent participant agents. Each agent speaks for its participant's goals, explores compatibility, and provides directional evaluations."
      />

      {error && <ErrorMessage title="Could Not Load Arena" message={error} onRetry={fetchData} />}

      {/* Date Launcher Section */}
      <section className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="border-b border-border/80 pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Launch a New Simulated Date
          </h2>
          <p className="text-xs text-muted mt-1">
            Select two consenting participants. Their respective AI advocate agents will conduct a 6-turn date and produce mutual evaluations.
          </p>
        </div>

        {launchError && (
          <div className="mt-4">
            <ErrorMessage title="Cannot Launch Date" message={launchError} />
          </div>
        )}

        <form onSubmit={handleLaunchDate} className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Participant A Selector */}
            <div className="space-y-2">
              <label htmlFor="selectA" className="block text-xs font-bold uppercase tracking-wider text-primary">
                Agent A (First Speaker)
              </label>
              <select
                id="selectA"
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                disabled={isLaunching || participants.length === 0}
                className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {participants.length === 0 && <option value="">No participants available</option>}
                {participants.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === selectedB}>
                    {p.displayName} ({p.analysisStatus === "completed" ? "Profile Ready" : "Unanalyzed"})
                  </option>
                ))}
              </select>
            </div>

            {/* Participant B Selector */}
            <div className="space-y-2">
              <label htmlFor="selectB" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                Agent B (Respondent)
              </label>
              <select
                id="selectB"
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                disabled={isLaunching || participants.length === 0}
                className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                {participants.length === 0 && <option value="">No participants available</option>}
                {participants.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === selectedA}>
                    {p.displayName} ({p.analysisStatus === "completed" ? "Profile Ready" : "Unanalyzed"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-[11px] text-muted italic">
              * This is an AI-to-AI simulated conversation. No messages are sent to real humans.
            </p>

            <button
              type="submit"
              disabled={isLaunching || participants.length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-subtle hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agents Are Meeting...
                </>
              ) : (
                <>
                  <MessageSquareHeart className="h-4 w-4" />
                  Start Agent Date
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Date History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted" />
            Completed Simulated Dates ({dates.length})
          </h2>
        </div>

        {loading && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted">Loading date transcripts...</p>
          </div>
        )}

        {!loading && dates.length === 0 && (
          <EmptyState
            icon={MessageSquareHeart}
            title="No Dates Simulated Yet"
            description="Use the launcher above to initiate a conversation between two participant agents."
          />
        )}

        {!loading && dates.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {dates.map((date) => {
              const score = date.mutualSummary?.overallScore;
              return (
                <div
                  key={date.id}
                  className="rounded-card border border-border bg-surface p-5 shadow-card transition-all hover:border-primary/40 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="text-primary">{date.participantAName}</span>
                        <span className="text-xs text-muted">&</span>
                        <span className="text-secondary">{date.participantBName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Calendar className="h-3 w-3" />
                        {formatDate(date.startedAt)}
                      </div>
                    </div>

                    {score !== undefined && score !== null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-base font-bold text-primary tabular-nums">
                          {score}/100
                        </span>
                        <span className="text-[10px] font-semibold text-muted uppercase">
                          Mutual Fit
                        </span>
                      </div>
                    ) : (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {date.mutualSummary?.narrativeSummary || "Date completed with saved multi-turn messages."}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="font-medium text-muted">
                      {date.messages.length} alternating turns
                    </span>
                    <Link
                      href={`/dates/${date.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-hover"
                    >
                      View Transcript & Evaluations
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
