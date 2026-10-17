import { NextRequest, NextResponse } from "next/server";
import { CreateParticipantInputSchema } from "@/lib/schemas";
import {
  getParticipants,
  createParticipant,
  findParticipantByUrls,
} from "@/lib/db";
import { validateProfileSources } from "@/lib/source-ingestion";

export async function GET() {
  try {
    const participants = await getParticipants(true);
    return NextResponse.json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (error) {
    console.error("[API GET /api/people] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve participants" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod input validation
    const parsed = CreateParticipantInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      displayName,
      linkedinUrl,
      instagramUrl,
      consentGiven,
      sourceContentText,
      recordType,
    } = parsed.data;

    // 2. Profile sources and consent gate validation
    const validation = validateProfileSources(linkedinUrl, instagramUrl, consentGiven);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid source URLs or missing consent",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 3. Duplicate check based on normalized profile URLs
    const existing = await findParticipantByUrls(linkedinUrl, instagramUrl);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A participant with this profile URL is already registered (${existing.displayName}).`,
          existingParticipantId: existing.id,
        },
        { status: 409 }
      );
    }

    // 4. Create participant record
    const participant = await createParticipant({
      displayName,
      linkedinUrl: validation.normalizedLinkedInUrl || linkedinUrl,
      instagramUrl: validation.normalizedInstagramUrl || instagramUrl,
      consentGiven: true,
      consentedAt: new Date().toISOString(),
      recordType: recordType || "participant",
      status: "active",
      sourceContentText: sourceContentText || "",
      sourceAccessMethod: "participant_provided",
      analysisStatus: "none",
      analysis: null,
    });

    return NextResponse.json(
      {
        success: true,
        participant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API POST /api/people] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register participant" },
      { status: 500 }
    );
  }
}
