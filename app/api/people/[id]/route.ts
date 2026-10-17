import { NextRequest, NextResponse } from "next/server";
import { getParticipantById, deleteParticipant } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participant = await getParticipantById(params.id);
    if (!participant || participant.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      participant,
    });
  } catch (error) {
    console.error(`[API GET /api/people/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve participant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteParticipant(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Participant not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Participant and associated matching records deleted successfully",
    });
  } catch (error) {
    console.error(`[API DELETE /api/people/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete participant" },
      { status: 500 }
    );
  }
}
