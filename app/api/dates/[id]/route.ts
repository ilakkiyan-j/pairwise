import { NextRequest, NextResponse } from "next/server";
import { getDateSessionById, getParticipantById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getDateSessionById(params.id);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Date session not found" },
        { status: 404 }
      );
    }

    const participantA = await getParticipantById(session.participantAId);
    const participantB = await getParticipantById(session.participantBId);

    return NextResponse.json({
      success: true,
      date: session,
      participantA,
      participantB,
    });
  } catch (error: any) {
    console.error(`[API GET /api/dates/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve date session" },
      { status: 500 }
    );
  }
}
