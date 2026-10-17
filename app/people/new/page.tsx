"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, ShieldCheck, AlertCircle, Linkedin, Instagram, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ErrorMessage } from "@/components/error-message";

export default function AddPersonPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [sourceContentText, setSourceContentText] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateLocal = () => {
    const errs: Record<string, string> = {};

    if (!displayName.trim() || displayName.trim().length < 2) {
      errs.displayName = "Display name must be at least 2 characters.";
    }

    if (!linkedinUrl.trim()) {
      errs.linkedinUrl = "LinkedIn profile URL is required.";
    } else if (!linkedinUrl.startsWith("https://")) {
      errs.linkedinUrl = "LinkedIn URL must start with https://";
    } else if (!/^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/i.test(linkedinUrl.trim())) {
      errs.linkedinUrl = "Must be a valid LinkedIn profile (e.g. https://linkedin.com/in/username)";
    }

    if (!instagramUrl.trim()) {
      errs.instagramUrl = "Instagram profile URL is required.";
    } else if (!instagramUrl.startsWith("https://")) {
      errs.instagramUrl = "Instagram URL must start with https://";
    } else if (!/^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/i.test(instagramUrl.trim())) {
      errs.instagramUrl = "Must be a valid Instagram profile (e.g. https://instagram.com/username)";
    }

    if (!consentGiven) {
      errs.consentGiven = "Explicit consent is required to process profile intelligence.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validateLocal()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          linkedinUrl: linkedinUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          consentGiven: true,
          sourceContentText: sourceContentText.trim(),
          recordType: "participant",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
        }
        setGlobalError(data.error || "Failed to create participant record.");
        setIsSubmitting(false);
        return;
      }

      // Success -> Navigate to new profile page
      router.push(`/people/${data.participant.id}?created=true`);
    } catch (err: any) {
      setGlobalError(err?.message || "A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[680px] space-y-6">
      <Link
        href="/people"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Participant Directory
      </Link>

      <PageHeader
        badge="Participant Onboarding"
        title="Add Consenting Participant"
        description="PairWise represents participants through two official source links and permitted content. Consent is required before any profile analysis is performed."
      />

      {globalError && (
        <ErrorMessage
          title="Onboarding Failed"
          message={globalError}
          onRetry={() => setGlobalError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8 rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        {/* Section 1: Identity & Profiles */}
        <div className="space-y-4">
          <div className="border-b border-border/80 pb-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary text-xs">1</span>
              Identity & Official Profiles
            </h2>
            <p className="mt-1 text-xs text-muted">
              Enter the participant’s display name and their two official public profiles.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Participant Name or Display Name <span className="text-danger">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: "" }));
              }}
              placeholder="e.g. Maya Lin"
              disabled={isSubmitting}
              className="w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.displayName && <p className="text-xs text-danger">{errors.displayName}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="linkedinUrl" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                LinkedIn Profile URL <span className="text-danger">*</span>
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (errors.linkedinUrl) setErrors((prev) => ({ ...prev, linkedinUrl: "" }));
                }}
                placeholder="https://linkedin.com/in/username"
                disabled={isSubmitting}
                className="w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.linkedinUrl && <p className="text-xs text-danger">{errors.linkedinUrl}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="instagramUrl" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
                Public Instagram URL <span className="text-danger">*</span>
              </label>
              <input
                id="instagramUrl"
                type="url"
                value={instagramUrl}
                onChange={(e) => {
                  setInstagramUrl(e.target.value);
                  if (errors.instagramUrl) setErrors((prev) => ({ ...prev, instagramUrl: "" }));
                }}
                placeholder="https://instagram.com/username"
                disabled={isSubmitting}
                className="w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.instagramUrl && <p className="text-xs text-danger">{errors.instagramUrl}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Permitted Source Content */}
        <div className="space-y-4">
          <div className="border-b border-border/80 pb-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary text-xs">2</span>
              Permitted Source Content & Preferences
            </h2>
            <p className="mt-1 text-xs text-muted">
              PairWise does not bypass access controls or scrape private accounts. Supply excerpts from the official profiles, stated relationship goals, or self-descriptions.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="sourceContent" className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Participant-Provided Content / Bio Excerpts
              </label>
              <span className="text-[11px] text-muted">Optional but recommended for analysis</span>
            </div>
            <textarea
              id="sourceContent"
              rows={4}
              value={sourceContentText}
              onChange={(e) => setSourceContentText(e.target.value)}
              placeholder="e.g. Bio excerpts: Architectural designer in Brooklyn. Loves ceramics, gravel biking, and natural wines. Looking for an intentional, emotionally mature partner who values thoughtful conversation and weekend farmers market strolls."
              disabled={isSubmitting}
              className="w-full rounded-btn border border-border bg-surface p-3.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[11px] text-muted">
              This content will be attributed to the participant and logged with provenance metadata.
            </p>
          </div>
        </div>

        {/* Section 3: Explicit Consent Gate */}
        <div className="space-y-4">
          <div className="border-b border-border/80 pb-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary text-xs">3</span>
              Consent Confirmation
            </h2>
          </div>

          <div className="rounded-xl border border-secondary/20 bg-secondary-soft/50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => {
                  setConsentGiven(e.target.checked);
                  if (errors.consentGiven) setErrors((prev) => ({ ...prev, consentGiven: "" }));
                }}
                disabled={isSubmitting}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div className="space-y-1 text-xs leading-relaxed text-foreground">
                <p className="font-semibold text-secondary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Mandatory Participant Consent Gate
                </p>
                <p className="text-muted">
                  I consent to PairWise processing the two supplied profile URLs and provided content to generate an AI-assisted profile, simulate agent-to-agent dating conversations, and calculate mutual compatibility rankings among consenting participants. I understand results are estimates and can request deletion anytime.
                </p>
              </div>
            </label>
            {errors.consentGiven && (
              <p className="mt-2 text-xs font-medium text-danger">{errors.consentGiven}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/people"
            className="rounded-btn border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-subtle transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering Participant...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Participant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
