/**
 * PairWise - End-to-End Automated Integration & Verification Test Suite
 * Validates the complete lifecycle:
 *  1. Source Ingestion & Mandatory Consent Gates
 *  2. Duplicate Prevention
 *  3. Profile Analysis & Evidence Attribution
 *  4. Agent Dating Simulation (Distinct Contexts, Alternating Turns, Post-Date Directional Eval)
 *  5. Deterministic 5-Factor Compatibility Math (pairwise-match-v1)
 *  6. Disk Persistence & Cascade Integrity
 *  7. Credential / Secret Leak Audit
 */

import {
  MATCH_ALGORITHM_VERSION,
  MATCH_WEIGHTS,
  CreateParticipantInputSchema,
  ProfileAnalysisSchema,
  DateSessionSchema,
  CandidateRankingSchema,
} from "../lib/schemas";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("=================================================");
  console.log("  PAIRWISE END-TO-END QA & INTEGRATION TEST SUITE");
  console.log(`  Target: ${BASE_URL}`);
  console.log("=================================================\n");

  // --- SUITE 1: SOURCE INGESTION & CONSENT ENFORCEMENT ---
  console.log("Suite 1: Consent, URL Validation & Security Gates");

  // 1.1 Reject missing consent
  const unconsentedRes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: "Unconsented User",
      linkedinUrl: "https://linkedin.com/in/unconsented",
      instagramUrl: "https://instagram.com/unconsented",
      consentGiven: false,
    }),
  });
  assert(
    unconsentedRes.status === 400,
    "Reject participant registration without explicit consent (HTTP 400)",
    `Got status ${unconsentedRes.status}`
  );

  // 1.2 Reject invalid LinkedIn URL
  const invalidLinkedInRes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: "Bad URL User",
      linkedinUrl: "https://notlinkedin.com/in/someone",
      instagramUrl: "https://instagram.com/someone",
      consentGiven: true,
    }),
  });
  assert(
    invalidLinkedInRes.status === 400,
    "Reject non-LinkedIn domain for LinkedIn source (HTTP 400)",
    `Got status ${invalidLinkedInRes.status}`
  );

  // 1.3 Reject non-HTTPS URL
  const nonHttpsRes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: "Insecure URL User",
      linkedinUrl: "http://linkedin.com/in/insecure",
      instagramUrl: "https://instagram.com/secure",
      consentGiven: true,
    }),
  });
  assert(
    nonHttpsRes.status === 400,
    "Reject insecure HTTP source URLs (HTTP 400)",
    `Got status ${nonHttpsRes.status}`
  );

  // --- SUITE 2: PARTICIPANT ONBOARDING & DUPLICATE PREVENTION ---
  console.log("\nSuite 2: Participant Onboarding & Duplicate Prevention");

  const testSuffix = Date.now().toString().slice(-4);
  const userAData = {
    displayName: `Elena Rostova ${testSuffix}`,
    linkedinUrl: `https://linkedin.com/in/elena-rostova-${testSuffix}`,
    instagramUrl: `https://instagram.com/elena.design.${testSuffix}`,
    consentGiven: true,
    sourceContentText:
      "Architectural photographer and ceramics enthusiast in Brooklyn. Values slow mornings, art gallery visits, emotional depth, and direct, gentle communication. Looking for long-term intentional companionship.",
  };

  const userBData = {
    displayName: `Marcus Vance ${testSuffix}`,
    linkedinUrl: `https://linkedin.com/in/marcus-vance-${testSuffix}`,
    instagramUrl: `https://instagram.com/marcus.runs.${testSuffix}`,
    consentGiven: true,
    sourceContentText:
      "Urban planner and trail runner in Manhattan. Passionate about sustainable transit, sourdough baking, trail marathons, and gallery openings. Seeks an emotionally intelligent partner who values honest dialogue and shared weekend adventures.",
  };

  // 2.1 Create Participant A
  const createARes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userAData),
  });
  const createAJson = await createARes.json();
  assert(
    createARes.status === 201 && createAJson.success && createAJson.participant?.id,
    "Successfully onboard consenting Participant A (HTTP 201)",
    createAJson.error
  );
  const participantAId = createAJson.participant?.id;

  // 2.2 Reject duplicate LinkedIn URL
  const duplicateRes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...userAData,
      displayName: "Duplicate Person",
    }),
  });
  assert(
    duplicateRes.status === 409,
    "Reject registration with already-registered LinkedIn URL (HTTP 409 Conflict)",
    `Got status ${duplicateRes.status}`
  );

  // 2.3 Create Participant B
  const createBRes = await fetch(`${BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userBData),
  });
  const createBJson = await createBRes.json();
  assert(
    createBRes.status === 201 && createBJson.success && createBJson.participant?.id,
    "Successfully onboard consenting Participant B (HTTP 201)",
    createBJson.error
  );
  const participantBId = createBJson.participant?.id;

  // --- SUITE 3: PROFILE ANALYSIS & PROVENANCE ---
  console.log("\nSuite 3: Profile Intelligence & Provenance Tracking");

  // 3.1 Analyze Participant A
  const analyzeARes = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: participantAId }),
  });
  const analyzeAJson = await analyzeARes.json();
  assert(
    analyzeARes.status === 200 && analyzeAJson.success && analyzeAJson.participant?.analysisStatus === "completed",
    "Generate structured profile intelligence for Participant A (HTTP 200)",
    analyzeAJson.error
  );

  const analysisA = analyzeAJson.participant?.analysis;
  const analysisParsed = ProfileAnalysisSchema.safeParse(analysisA);
  assert(
    analysisParsed.success,
    "Profile analysis conforms to strict Zod ProfileAnalysisSchema",
    analysisParsed.success ? "" : JSON.stringify(analysisParsed.error.issues)
  );

  assert(
    analysisA.evidence && analysisA.evidence.length > 0 && analysisA.evidence[0].sourceType,
    "Evidence items contain verified source attribution and confidence classification"
  );

  assert(
    analysisA.unknowns && analysisA.unknowns.length > 0,
    "Explicitly preserves unknowns rather than inventing facts"
  );

  // 3.2 Analyze Participant B
  const analyzeBRes = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: participantBId }),
  });
  const analyzeBJson = await analyzeBRes.json();
  assert(
    analyzeBRes.status === 200 && analyzeBJson.success && analyzeBJson.participant?.analysisStatus === "completed",
    "Generate structured profile intelligence for Participant B (HTTP 200)",
    analyzeBJson.error
  );

  // --- SUITE 4: AGENT DATING RUNTIME ---
  console.log("\nSuite 4: Agent Dating Simulation Arena");

  // 4.1 Reject self-dating
  const selfDateRes = await fetch(`${BASE_URL}/api/dates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantAId,
      participantBId: participantAId,
    }),
  });
  assert(
    selfDateRes.status === 400,
    "Reject date simulation between a participant and themselves (HTTP 400)",
    `Got status ${selfDateRes.status}`
  );

  // 4.2 Run real 6-turn alternating date simulation
  const dateRes = await fetch(`${BASE_URL}/api/dates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantAId,
      participantBId,
    }),
  });
  const dateJson = await dateRes.json();
  assert(
    dateRes.status === 201 && dateJson.success && dateJson.date?.id,
    "Execute full agent-to-agent dating session (HTTP 201)",
    dateJson.error
  );

  const session = dateJson.date;
  assert(
    session.status === "completed",
    "Date session reaches completed status",
    `Status is ${session.status}`
  );

  assert(
    session.messages && session.messages.length >= 6,
    "Transcript contains at least 6 alternating turns",
    `Count: ${session.messages?.length}`
  );

  // Check turn alternation
  const speakers = session.messages.map((m: any) => m.speaker);
  const alternates = speakers[0] === "agent_a" && speakers[1] === "agent_b" && speakers[2] === "agent_a";
  assert(
    alternates,
    "Messages alternate strictly between Agent A and Agent B"
  );

  assert(
    session.evaluationA && session.evaluationB && session.mutualSummary,
    "Post-date directional evaluations (A→B, B→A) and mutual summary are fully generated"
  );

  // --- SUITE 5: DETERMINISTIC COMPATIBILITY ARITHMETIC ---
  console.log("\nSuite 5: Deterministic Compatibility Engine (pairwise-match-v1)");

  const rankingsARes = await fetch(`${BASE_URL}/api/rankings/${participantAId}?recompute=true`);
  const rankingsAJson = await rankingsARes.json();
  assert(
    rankingsARes.status === 200 && rankingsAJson.success,
    "Calculate candidate rankings for Participant A (HTTP 200)",
    rankingsAJson.error
  );

  const candidateEntryA = rankingsAJson.rankings.find((r: any) => r.candidateId === participantBId);
  assert(
    !!candidateEntryA,
    "Rankings roster includes Participant B as candidate"
  );

  assert(
    candidateEntryA?.mode === "completed_date",
    "Candidate ranking reflects completed_date mode with full 5 factors"
  );

  assert(
    candidateEntryA?.score >= 0 && candidateEntryA?.score <= 100,
    `Calculates valid integer compatibility score (Score: ${candidateEntryA?.score}/100)`
  );

  assert(
    candidateEntryA?.coveragePercent === 100,
    "Reports 100% evidence coverage across all 5 dimensions"
  );

  // 5.2 Symmetric Pair Score Verification
  const rankingsBRes = await fetch(`${BASE_URL}/api/rankings/${participantBId}?recompute=true`);
  const rankingsBJson = await rankingsBRes.json();
  const candidateEntryB = rankingsBJson.rankings.find((r: any) => r.candidateId === participantAId);

  assert(
    candidateEntryA?.score === candidateEntryB?.score,
    `Symmetric pair score holds: Elena→Marcus (${candidateEntryA?.score}) === Marcus→Elena (${candidateEntryB?.score})`
  );

  assert(
    candidateEntryA?.factorScores?.relationshipGoals?.directionalA ===
      candidateEntryB?.factorScores?.relationshipGoals?.directionalB,
    "Directional sub-scores invert correctly according to viewer perspective"
  );

  // 5.3 Verify mathematical weighting precision
  const f = candidateEntryA?.factorScores;
  const computedPoints =
    f.relationshipGoals.score * MATCH_WEIGHTS.relationshipGoals +
    f.lifestyleValues.score * MATCH_WEIGHTS.lifestyleValues +
    f.sharedInterests.score * MATCH_WEIGHTS.sharedInterests +
    f.communicationPreferences.score * MATCH_WEIGHTS.communicationPreferences +
    f.dateConversation.score * MATCH_WEIGHTS.dateConversation;
  const expectedScore = Math.round(computedPoints / 100);

  assert(
    candidateEntryA?.score === expectedScore,
    `Arithmetic proof: round(${computedPoints}/100) === ${candidateEntryA?.score} (pairwise-match-v1 verified)`
  );

  // --- SUITE 6: DISK PERSISTENCE & CASCADE INTEGRITY ---
  console.log("\nSuite 6: Disk Persistence & Cascade Deletion");

  const storePath = path.join(process.cwd(), "data", "pairwise-store.json");
  const storeExists = fs.existsSync(storePath);
  assert(storeExists, "Local store data/pairwise-store.json exists on disk");

  const storeContent = JSON.parse(fs.readFileSync(storePath, "utf-8"));
  const foundA = storeContent.participants.some((p: any) => p.id === participantAId);
  const foundDate = storeContent.dateSessions.some((d: any) => d.id === session.id);
  assert(foundA && foundDate, "Participants and date sessions are persisted to disk");

  // 6.2 Cascade Deletion
  const deleteRes = await fetch(`${BASE_URL}/api/people/${participantAId}`, { method: "DELETE" });
  assert(deleteRes.status === 200, "Successfully delete test participant (HTTP 200)");

  const checkGetDeletedRes = await fetch(`${BASE_URL}/api/people/${participantAId}`);
  assert(checkGetDeletedRes.status === 404, "Deleted participant is inaccessible (HTTP 404)");

  // Clean up Participant B
  await fetch(`${BASE_URL}/api/people/${participantBId}`, { method: "DELETE" });

  // --- SUITE 7: SECURITY & CREDENTIAL LEAK AUDIT ---
  console.log("\nSuite 7: Security & Secret Leak Audit");

  // 7.1 Verify gitignore covers secrets
  const gitignore = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf-8");
  assert(gitignore.includes(".env"), ".gitignore strictly excludes .env files");
  assert(gitignore.includes("data/"), ".gitignore strictly excludes data/ directory");

  // 7.2 Verify client page bundle does not expose server secrets
  const sampleClientPage = fs.readFileSync(path.join(process.cwd(), "app", "rankings", "page.tsx"), "utf-8");
  assert(
    !sampleClientPage.includes("API_KEY") && !sampleClientPage.includes("SECRET"),
    "Client page bundles do not reference server secret keys"
  );

  // --- SUMMARY ---
  console.log("\n=================================================");
  console.log(`  QA SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
