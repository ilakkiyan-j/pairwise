"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Search, Filter, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ParticipantCard } from "@/components/participant-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorMessage } from "@/components/error-message";
import { Participant } from "@/lib/schemas";

export default function PeopleDirectoryPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "pending">("all");

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load participants");
      }
      setParticipants(data.participants || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load participants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.displayName.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;

    if (statusFilter === "ready") return p.analysisStatus === "completed";
    if (statusFilter === "pending") return p.analysisStatus !== "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Directory"
        title="Consented Participants"
        description="Browse all opted-in participants. Each profile includes verified LinkedIn and Instagram source links and evidence-backed profile intelligence."
        action={
          <Link
            href="/people/new"
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-subtle hover:bg-primary-hover transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Participant
          </Link>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-card border border-border bg-surface p-3.5 shadow-subtle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants by name..."
            className="w-full rounded-btn border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted hidden sm:block" />
          <div className="inline-flex rounded-btn border border-border bg-surface-muted p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded px-2.5 py-1 transition-colors ${
                statusFilter === "all" ? "bg-surface text-foreground shadow-subtle font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              All ({participants.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ready")}
              className={`rounded px-2.5 py-1 transition-colors ${
                statusFilter === "ready" ? "bg-surface text-foreground shadow-subtle font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              Ready ({participants.filter((p) => p.analysisStatus === "completed").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`rounded px-2.5 py-1 transition-colors ${
                statusFilter === "pending" ? "bg-surface text-foreground shadow-subtle font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              Needs Analysis ({participants.filter((p) => p.analysisStatus !== "completed").length})
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          title="Could Not Load Participants"
          message={error}
          onRetry={fetchParticipants}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted">Loading participant directory...</p>
        </div>
      )}

      {/* Grid of participants */}
      {!loading && !error && filteredParticipants.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredParticipants.map((participant) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
        </div>
      )}

      {/* Empty State if no participants in store */}
      {!loading && !error && participants.length === 0 && (
        <EmptyState
          icon={Users}
          title="No Participants Registered Yet"
          description="Be the first to add a consenting participant with their LinkedIn and public Instagram URLs."
          action={
            <Link
              href="/people/new"
              className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white shadow-subtle hover:bg-primary-hover"
            >
              <UserPlus className="h-4 w-4" />
              Add First Participant
            </Link>
          }
        />
      )}

      {/* Empty search filter result */}
      {!loading && !error && participants.length > 0 && filteredParticipants.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Matching Participants"
          description={`No participants match your query "${searchQuery}".`}
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="inline-flex items-center rounded-btn border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Clear Filters
            </button>
          }
        />
      )}
    </div>
  );
}
