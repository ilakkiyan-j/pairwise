import { Participant, ProfileAnalysis, ProfileAnalysisSchema } from "./schemas";
import { callLLM } from "./llm";

const PROFILE_ANALYST_SYSTEM_PROMPT = `You are PairWise's Profile Analyst. Produce a careful, evidence-backed profile analysis for a consenting participant who has opted in to a dating-compatibility platform.

STRICT PRODUCT & SAFETY RULES:
1. Use ONLY the permitted source content, official URL references, and participant-provided text given in the user prompt. Never invent details or assume information not present.
2. DO NOT infer or store sensitive/protected traits (e.g. religion, health, political views, sexual orientation, ethnicity, or private personal data).
3. DO NOT infer romantic availability or private romantic intent from professional status, photos, likes, or followers.
4. Distinguish direct statements from cautious interpretations. Attach supporting evidence with source labels ("linkedin", "instagram", "participant_preferences") and confidence levels ("high", "medium", "low").
5. Label missing information as UNKNOWN or follow-up questions. Do not penalize or make negative assumptions about missing data.
6. Return a valid JSON object matching the requested schema.`;

export async function analyzeParticipantProfile(participant: Participant): Promise<ProfileAnalysis> {
  const userContent = `Analyze the following consenting participant's permitted source records:

Participant Display Name: ${participant.displayName}
Official LinkedIn Profile: ${participant.linkedinUrl}
Public Instagram Profile: ${participant.instagramUrl}
Consent Status: Explicitly Consented on ${participant.consentedAt || "Recorded"}

Participant-Supplied Content & Preferences:
${participant.sourceContentText || "(No supplemental text provided; rely only on the two official source references and stated preferences.)"}

Please produce structured profile intelligence with:
- summary: concise 2-3 sentence overview of interests, values, and relationship intent
- interests: array of supported interest topics
- hobbies: array of confirmed hobbies/activities
- lifestyle: array of observable or stated day-to-day lifestyle patterns
- communicationPreferences: array of communication expectations
- relationshipGoals: array of explicitly stated relationship expectations
- needs: array of declared needs or boundaries
- evidence: array of evidence items with { sourceType, claim, excerptOrBasis, confidence: "high"|"medium"|"low", classification: "stated"|"supported_interpretation" }
- unknowns: array of important relationship or lifestyle aspects that remain unknown
- followUpQuestions: array of respectful exploratory questions that could clarify compatibility`;

  const rawJson = await callLLM(
    [
      { role: "system", content: PROFILE_ANALYST_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    {
      temperature: 0.2,
      responseFormat: "json_object",
      maxTokens: 1800,
    }
  );

  let parsedData: any;
  try {
    parsedData = JSON.parse(rawJson);
  } catch (err) {
    // Attempt one repair retry
    console.warn("[ProfileAnalysis] JSON parse failed, retrying repair...");
    const repairedJson = await callLLM([
      { role: "system", content: "You are a JSON repair utility. Fix this malformed JSON and output only valid JSON without comments." },
      { role: "user", content: rawJson },
    ], { responseFormat: "json_object" });
    parsedData = JSON.parse(repairedJson);
  }

  // Validate with Zod schema
  const validated = ProfileAnalysisSchema.parse(parsedData);
  return validated;
}
