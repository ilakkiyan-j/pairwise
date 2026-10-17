import { NextRequest, NextResponse } from "next/server";
import { getParticipantById, getRankingsForParticipant } from "@/lib/db";
import { calculateRankingsForParticipant } from "@/lib/compatibility";

export async function GET(
  req: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const { personId } = params;
    const participant = await getParticipantById(personId);

    if (!participant || participant.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant not found or inactive" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forceRecompute = searchParams.get("recompute") === "true";

    let rankings = await getRankingsForParticipant(personId);

    if (rankings.length === 0 || forceRecompute) {
      rankings = await calculateRankingsForParticipant(personId);
    }

    return NextResponse.json({
      success: true,
      participantId: personId,
      participantName: participant.displayName,
      count: rankings.length,
      rankings,
    });
  } catch (error: any) {
    console.error("[API GET /api/rankings/[personId]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve candidate rankings" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const { personId } = params;
    const participant = await getParticipantById(personId);

    if (!participant || participant.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant not found or inactive" },
        { status: 404 }
      );
    }

    const rankings = await calculateRankingsForParticipant(personId);

    return NextResponse.json({
      success: true,
      participantId: personId,
      participantName: participant.displayName,
      count: rankings.length,
      rankings,
    });
  } catch (error: any) {
    console.error("[API POST /api/rankings/[personId]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recompute candidate rankings" },
      { status: 500 }
    );
  }
}
