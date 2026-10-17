import { NextRequest, NextResponse } from "next/server";
import { getParticipantById, updateParticipant } from "@/lib/db";
import { analyzeParticipantProfile } from "@/lib/profile-analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantId } = body;

    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid participantId" },
        { status: 400 }
      );
    }

    const participant = await getParticipantById(participantId);
    if (!participant || participant.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant not found or deleted" },
        { status: 404 }
      );
    }

    // Set status to pending
    await updateParticipant(participantId, {
      analysisStatus: "pending",
    });

    try {
      // Execute LLM analysis
      const analysis = await analyzeParticipantProfile(participant);

      // Save completed analysis
      const updated = await updateParticipant(participantId, {
        analysis,
        analysisStatus: "completed",
        analysisUpdatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        participant: updated,
        analysis,
      });
    } catch (analysisErr: any) {
      console.error(`[API /api/analyze] Model execution failed for ${participantId}:`, analysisErr);
      await updateParticipant(participantId, {
        analysisStatus: "failed",
      });
      return NextResponse.json(
        {
          success: false,
          error: analysisErr?.message || "Profile analysis model execution failed",
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("[API POST /api/analyze] Server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during profile analysis" },
      { status: 500 }
    );
  }
}
