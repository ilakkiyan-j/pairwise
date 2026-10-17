"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  BarChart3,
  MessageSquareHeart,
  Calendar,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  HelpCircle,
  Check,
  Compass,
  Heart,
  MessageCircle,
  Activity,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SourceLinks } from "@/components/source-links";
import { ErrorMessage } from "@/components/error-message";
import { formatDate } from "@/lib/utils";
import { Participant, ProfileAnalysis } from "@/lib/schemas";

export default function PersonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams?.get("created") === "true";

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchParticipant = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/people/${params.id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Participant not found");
      }
      setParticipant(data.participant);
    } catch (err: any) {
      setError(err?.message || "Failed to load participant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipant();
  }, [params.id]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: params.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to run profile analysis");
      }

      setParticipant(data.participant);
    } catch (err: any) {
      setAnalysisError(err?.message || "An unexpected error occurred during profile analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this participant and all associated records?")) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/people/${params.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete participant");
      }
      router.push("/people");
    } catch (err: any) {
      alert(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">Loading profile intelligence...</p>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="space-y-6">
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </Link>
        <ErrorMessage
          title="Profile Not Found"
          message={error || "Could not retrieve participant."}
          onRetry={fetchParticipant}
        />
      </div>
    );
  }

  const isAnalyzed = participant.analysisStatus === "completed" && participant.analysis;
  const analysis = participant.analysis;

  return (
    <div className="space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Participant Directory
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/rankings/${participant.id}`}
            className="inline-flex items-center gap-1.5 rounded-btn border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-subtle"
          >
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Rankings
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 rounded-btn border border-danger/30 bg-surface px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft/60"
            title="Delete participant"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Success banner if just created */}
      {justCreated && (
        <div className="flex items-center gap-3 rounded-card border border-secondary/30 bg-secondary-soft/60 p-4 text-sm text-secondary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Participant Onboarded Successfully</p>
            <p className="text-xs text-foreground/80 mt-0.5">
              Official source URLs and consent record are stored. Click &quot;Analyze Profile&quot; below to extract evidence-backed signals.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Error Banner */}
      {analysisError && (
        <ErrorMessage
          title="Profile Analysis Error"
          message={analysisError}
          onRetry={handleRunAnalysis}
        />
      )}

      {/* Profile Header Card */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary font-bold text-2xl shadow-subtle">
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {participant.displayName}
                </h1>
                <StatusBadge status={participant.recordType} />
                <StatusBadge
                  status={
                    participant.analysisStatus === "completed"
                      ? "ready"
                      : participant.analysisStatus === "pending" || isAnalyzing
                      ? "pending"
                      : participant.analysisStatus === "failed"
                      ? "failed"
                      : "not_analyzed"
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Onboarded {formatDate(participant.createdAt).split(",")[0]}
                </span>
                <span className="flex items-center gap-1 text-secondary font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Consent Verified
                </span>
                {participant.analysisUpdatedAt && (
                  <span className="flex items-center gap-1 text-muted">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Analyzed {formatDate(participant.analysisUpdatedAt).split(",")[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-subtle transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Sources...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {isAnalyzed ? "Re-run Analysis" : "Analyze Profile"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source References Provenance Strip */}
        <div className="mt-6 border-t border-border pt-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5">
            Verified Official Source Provenance (Exactly 2 References)
          </div>
          <SourceLinks
            linkedinUrl={participant.linkedinUrl}
            instagramUrl={participant.instagramUrl}
          />
        </div>
      </div>

      {/* Main Layout: Left 2 Cols (Analysis) + Right 1 Col (Metadata & Dating) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Structured Intelligence */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Profile Summary Card */}
          {isAnalyzed && analysis ? (
            <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Executive Profile Summary
                </h3>
                <span className="text-[11px] font-medium text-muted">Model Evaluated</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {analysis.summary}
              </p>
            </div>
          ) : null}

          {/* 2. Structured Dimensions (Interests, Goals, Lifestyle, Communication) */}
          {isAnalyzed && analysis ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Interests & Hobbies */}
              <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 text-muted">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  Interests & Confirmed Hobbies
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...analysis.interests, ...analysis.hobbies].map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Relationship Goals & Intent */}
              <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 text-muted">
                  <Heart className="h-3.5 w-3.5 text-primary" />
                  Explicit Relationship Goals
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.relationshipGoals.length > 0 ? (
                    analysis.relationshipGoals.map((goal, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-secondary/30 bg-secondary-soft px-2.5 py-1 text-xs font-medium text-secondary"
                      >
                        {goal}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted italic">No goals explicitly declared.</span>
                  )}
                </div>
              </div>

              {/* Lifestyle & Values */}
              <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 text-muted">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Lifestyle Patterns & Values
                </h3>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {analysis.lifestyle.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Communication Preferences */}
              <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-3">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5 text-muted">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  Communication Preferences
                </h3>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {analysis.communicationPreferences.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {/* 3. Evidence Provenance Panel */}
          {isAnalyzed && analysis ? (
            <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div>
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Evidence Provenance & Findings
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Every finding is backed by source provenance and classified as a direct statement or supported interpretation.
                  </p>
                </div>
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  {analysis.evidence.length} Cited Items
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-muted/40 p-4 space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                          {item.sourceType === "linkedin"
                            ? "LinkedIn"
                            : item.sourceType === "instagram"
                            ? "Instagram"
                            : "Participant Stated"}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            item.confidence === "high"
                              ? "bg-secondary-soft text-secondary"
                              : item.confidence === "medium"
                              ? "bg-warning-soft text-warning"
                              : "bg-surface-muted text-muted"
                          }`}
                        >
                          {item.confidence} confidence
                        </span>
                      </div>
                      <h4 className="mt-2 text-xs font-bold text-foreground">
                        {item.claim}
                      </h4>
                      <p className="mt-1 text-xs text-muted italic leading-relaxed">
                        &quot;{item.excerptOrBasis}&quot;
                      </p>
                    </div>

                    <div className="border-t border-border/40 pt-2 text-[10px] text-muted">
                      Classification:{" "}
                      <span className="font-medium text-foreground">
                        {item.classification === "stated" ? "Direct Participant Statement" : "Supported Interpretation"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 4. Unknowns & Follow-up Questions Panel */}
          {isAnalyzed && analysis ? (
            <div className="rounded-card border border-warning-soft/80 bg-warning-soft/20 p-6 shadow-card space-y-4">
              <div className="border-b border-warning-soft/80 pb-2.5">
                <h3 className="font-bold text-warning text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Unknowns & Open Questions (Preserving Uncertainty)
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Missing information is never penalized as a negative. These topics remain open for discussion during simulated agent dates.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Currently Unknown</h4>
                  <ul className="space-y-1.5 text-xs text-foreground/80">
                    {analysis.unknowns.map((u, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning mt-0.5">?</span>
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Recommended Agent Date Questions</h4>
                  <ul className="space-y-1.5 text-xs text-foreground/80">
                    {analysis.followUpQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">→</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Not Analyzed State Card */}
          {!isAnalyzed && (
            <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center shadow-card space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Profile Analysis Pending
                </h3>
                <p className="mt-1.5 max-w-md mx-auto text-xs leading-relaxed text-muted">
                  Click the &quot;Analyze Profile&quot; button above to have PairWise’s Profile Analyst examine the permitted source content and extract verified compatibility signals with evidence citations.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-subtle hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Start Profile Analysis Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Source Content & Actions */}
        <div className="space-y-6">
          {/* Supplied Bio Excerpt */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-3">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Supplied Content Excerpt
            </h3>
            {participant.sourceContentText ? (
              <p className="text-xs text-foreground/90 whitespace-pre-wrap rounded-lg bg-surface-muted/60 p-3.5 border border-border/60 leading-relaxed">
                {participant.sourceContentText}
              </p>
            ) : (
              <p className="text-xs text-muted italic">
                No supplemental bio text provided during onboarding.
              </p>
            )}
            <div className="text-[11px] text-muted">
              Provenance: <span className="font-medium text-foreground">Participant Provided</span>
            </div>
          </div>

          {/* Quick Match Actions */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card space-y-3">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted">
              Next Steps
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`/rankings/${participant.id}`}
                className="flex items-center justify-between rounded-btn border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-subtle"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Inspect Matched Rankings
                </span>
                <span>→</span>
              </Link>
              <Link
                href="/dates"
                className="flex items-center justify-between rounded-btn border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-subtle"
              >
                <span className="flex items-center gap-2">
                  <MessageSquareHeart className="h-4 w-4 text-secondary" />
                  Launch Agent Date
                </span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-2.5 text-xs text-muted leading-relaxed">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Safety & Data Ethics
            </h4>
            <p>
              PairWise never infers sensitive or protected attributes. All analysis findings are traceable to permitted source records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
