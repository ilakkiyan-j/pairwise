"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquareHeart,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  BarChart3,
  Loader2,
  Clock,
  HeartHandshake,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ErrorMessage } from "@/components/error-message";
import { formatDate } from "@/lib/utils";
import { DateSession, Participant } from "@/lib/schemas";

export default function DateDetailPage({ params }: { params: { id: string } }) {
  const [dateSession, setDateSession] = useState<DateSession | null>(null);
  const [participantA, setParticipantA] = useState<Participant | null>(null);
  const [participantB, setParticipantB] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dates/${params.id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Date session not found");
      }
      setDateSession(data.date);
      setParticipantA(data.participantA);
      setParticipantB(data.participantB);
    } catch (err: any) {
      setError(err?.message || "Failed to load date session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDateSession();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">Retrieving saved conversation transcript...</p>
      </div>
    );
  }

  if (error || !dateSession) {
    return (
      <div className="space-y-6">
        <Link
          href="/dates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dates
        </Link>
        <ErrorMessage
          title="Date Transcript Not Found"
          message={error || "Could not retrieve date session."}
          onRetry={fetchDateSession}
        />
      </div>
    );
  }

  const nameA = participantA?.displayName || "Participant A";
  const nameB = participantB?.displayName || "Participant B";
  const mutualSummary = dateSession.mutualSummary;
  const evalA = dateSession.evaluationA;
  const evalB = dateSession.evaluationB;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dating Arena
        </Link>

        <div className="flex items-center gap-2">
          {participantA && (
            <Link
              href={`/rankings/${participantA.id}`}
              className="inline-flex items-center gap-1.5 rounded-btn border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-subtle"
            >
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              {nameA}&apos;s Rankings
            </Link>
          )}
          {participantB && (
            <Link
              href={`/rankings/${participantB.id}`}
              className="inline-flex items-center gap-1.5 rounded-btn border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-subtle"
            >
              <BarChart3 className="h-3.5 w-3.5 text-secondary" />
              {nameB}&apos;s Rankings
            </Link>
          )}
        </div>
      </div>

      {/* Arena Match Header Card */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Pair Title */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft border-2 border-surface text-primary font-bold text-lg shadow-subtle">
                {nameA.charAt(0)}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-soft border-2 border-surface text-secondary font-bold text-lg shadow-subtle">
                {nameB.charAt(0)}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Simulated Agent Date
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <span className="text-primary">{nameA}</span>{" "}
                <span className="text-muted font-normal">&amp;</span>{" "}
                <span className="text-secondary">{nameB}</span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(dateSession.startedAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  {dateSession.messages.length} Alternating Turns
                </span>
              </div>
            </div>
          </div>

          {/* Mutual Score Badge */}
          {mutualSummary?.overallScore !== undefined && (
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary-soft/50 p-4 sm:flex-col sm:items-end">
              <div className="text-right">
                <div className="text-xs font-semibold text-muted uppercase">Mutual Date Score</div>
                <div className="text-3xl font-black text-primary tabular-nums">
                  {mutualSummary.overallScore}
                  <span className="text-sm font-semibold text-muted">/100</span>
                </div>
              </div>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-secondary uppercase tracking-wider shadow-subtle">
                Evaluated
              </span>
            </div>
          )}
        </div>

        {/* Date Stage Progress Bar */}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold sm:grid-cols-4">
            <div className="rounded-lg bg-surface-muted p-2 text-foreground">
              1. Opening &amp; Interests
            </div>
            <div className="rounded-lg bg-surface-muted p-2 text-foreground">
              2. Goals &amp; Lifestyle
            </div>
            <div className="rounded-lg bg-surface-muted p-2 text-foreground">
              3. Explore Differences
            </div>
            <div className="rounded-lg bg-secondary-soft p-2 text-secondary font-bold">
              4. Mutual Evaluation ✓
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left 2 Cols (Live Transcript) + Right 1 Col (Evaluations) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Alternating Conversation Turns */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquareHeart className="h-4 w-4 text-primary" />
              Conversation Transcript
            </h2>
            <span className="text-xs text-muted">
              Turn-by-turn model calls
            </span>
          </div>

          {dateSession.messages.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-sm text-muted">No messages in this session.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dateSession.messages.map((msg) => {
                const isA = msg.speaker === "agent_a";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isA ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                      <span className={`font-bold ${isA ? "text-primary" : "text-secondary"}`}>
                        {isA ? `${nameA}'s Agent` : `${nameB}'s Agent`}
                      </span>
                      <span className="text-[11px] text-muted">
                        Turn {msg.turnIndex}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-subtle ${
                        isA
                          ? "rounded-tl-xs border border-primary/20 bg-surface text-foreground"
                          : "rounded-tr-xs border border-secondary/20 bg-secondary-soft/40 text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Directional & Mutual Evaluations */}
        <div className="space-y-6">
          {/* Mutual Date Summary */}
          {mutualSummary && (
            <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Date Summary &amp; Compatibility
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-foreground/90">
                {mutualSummary.narrativeSummary}
              </p>

              {/* Positive Highlights */}
              {mutualSummary.positiveHighlights.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Key Alignment Points
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {mutualSummary.positiveHighlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-secondary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Differences & Friction */}
              {mutualSummary.potentialFriction.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-border/60">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-warning flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Differences Explored
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {mutualSummary.potentialFriction.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-warning mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unresolved Questions */}
              {mutualSummary.keyQuestions.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-border/60">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Open Questions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {mutualSummary.keyQuestions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-muted mt-0.5">?</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Directional Factor Breakdown */}
          {evalA && evalB && (
            <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Directional Evaluations
              </h3>

              <div className="space-y-3 text-xs">
                {/* A evaluating B */}
                <div className="rounded-lg border border-border/80 bg-surface-muted/40 p-3 space-y-1.5">
                  <div className="font-semibold text-primary">
                    {nameA}&apos;s Evaluation of {nameB}:
                  </div>
                  <p className="text-muted leading-relaxed italic">
                    &quot;{evalA.summary}&quot;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <span>Conversation Quality:</span>
                    <span className="font-bold text-foreground">
                      {evalA.factors.dateConversation.score}/100
                    </span>
                  </div>
                </div>

                {/* B evaluating A */}
                <div className="rounded-lg border border-border/80 bg-surface-muted/40 p-3 space-y-1.5">
                  <div className="font-semibold text-secondary">
                    {nameB}&apos;s Evaluation of {nameA}:
                  </div>
                  <p className="text-muted leading-relaxed italic">
                    &quot;{evalB.summary}&quot;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <span>Conversation Quality:</span>
                    <span className="font-bold text-foreground">
                      {evalB.factors.dateConversation.score}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Link to Rankings Action */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-3">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted">
              Next Step: Rankings
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              This completed date conversation contributes a 10% weight to the mutual compatibility calculation.
            </p>
            {participantA && (
              <Link
                href={`/rankings/${participantA.id}`}
                className="flex items-center justify-between rounded-btn bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-subtle hover:bg-primary-hover transition-colors"
              >
                <span>Calculate &amp; View {nameA}&apos;s Rankings</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
