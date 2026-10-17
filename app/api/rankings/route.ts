import { NextResponse } from "next/server";
import { getParticipants, getRankingsForParticipant } from "@/lib/db";

export async function GET() {
  try {
    const participants = await getParticipants(true);

    const summaries = await Promise.all(
      participants.map(async (p) => {
        const rankings = await getRankingsForParticipant(p.id);
        const topCandidate = rankings.find((r) => r.status === "scored");

        return {
          participantId: p.id,
          displayName: p.displayName,
          recordType: p.recordType,
          analysisStatus: p.analysisStatus,
          totalCandidatesRanked: rankings.length,
          topMatch: topCandidate
            ? {
                candidateId: topCandidate.candidateId,
                candidateName: topCandidate.candidateName,
                score: topCandidate.score,
                mode: topCandidate.mode,
                coveragePercent: topCandidate.coveragePercent,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: summaries.length,
      summaries,
    });
  } catch (error: any) {
    console.error("[API GET /api/rankings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list rankings summaries" },
      { status: 500 }
    );
  }
}
