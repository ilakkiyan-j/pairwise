import { NextRequest, NextResponse } from "next/server";
import {
  getDateSessions,
  createDateSession,
  getParticipantById,
  getParticipants,
} from "@/lib/db";
import { runAgentDateSession } from "@/lib/agent-runtime";

export async function GET() {
  try {
    const dates = await getDateSessions();
    const participants = await getParticipants(false);
    const participantMap = new Map(participants.map((p) => [p.id, p]));

    const enrichedDates = dates.map((d) => ({
      ...d,
      participantAName: participantMap.get(d.participantAId)?.displayName || "Participant A",
      participantBName: participantMap.get(d.participantBId)?.displayName || "Participant B",
    }));

    return NextResponse.json({
      success: true,
      count: enrichedDates.length,
      dates: enrichedDates,
    });
  } catch (error: any) {
    console.error("[API GET /api/dates] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve date sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantAId, participantBId } = body;

    if (!participantAId || !participantBId) {
      return NextResponse.json(
        { success: false, error: "Both participantAId and participantBId are required" },
        { status: 400 }
      );
    }

    if (participantAId === participantBId) {
      return NextResponse.json(
        { success: false, error: "A participant cannot date themselves" },
        { status: 400 }
      );
    }

    // Eligibility check
    const participantA = await getParticipantById(participantAId);
    const participantB = await getParticipantById(participantBId);

    if (!participantA || participantA.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant A not found or inactive" },
        { status: 404 }
      );
    }

    if (!participantB || participantB.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant B not found or inactive" },
        { status: 404 }
      );
    }

    if (!participantA.consentGiven || !participantB.consentGiven) {
      return NextResponse.json(
        { success: false, error: "Both participants must have verified consent to simulate a date" },
        { status: 403 }
      );
    }

    // Initialize date session
    const session = await createDateSession(participantA.id, participantB.id);

    // Run simulated date session
    const completedSession = await runAgentDateSession(session, participantA, participantB);

    return NextResponse.json(
      {
        success: true,
        date: completedSession,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/dates] Server error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to conduct agent date" },
      { status: 500 }
    );
  }
}
