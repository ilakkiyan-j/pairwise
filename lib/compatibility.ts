import {
  Participant,
  DateSession,
  CandidateRanking,
  CandidateRankingSchema,
  MATCH_ALGORITHM_VERSION,
  MATCH_WEIGHTS,
  FactorScoreDetail,
  Confidence,
} from "./schemas";
import {
  getParticipantById,
  getParticipants,
  getDateSessions,
  saveRankingsForParticipant,
} from "./db";

type FactorKey = keyof typeof MATCH_WEIGHTS;

interface HeuristicResult {
  score: number;
  status: "assessed" | "partial" | "unknown";
  rationale: string;
  evidenceRefs: string[];
}

/**
 * Deterministic text overlap and semantic compatibility heuristic for pre-date profile matching.
 */
function compareTextArrays(
  listA: string[],
  listB: string[],
  dimensionName: string
): HeuristicResult {
  if ((!listA || listA.length === 0) && (!listB || listB.length === 0)) {
    return {
      score: 50,
      status: "unknown",
      rationale: `Neither participant has provided explicit ${dimensionName} in their verified profiles.`,
      evidenceRefs: [],
    };
  }

  if (!listA || listA.length === 0 || !listB || listB.length === 0) {
    const presentList = listA?.length ? listA : listB;
    return {
      score: 55,
      status: "partial",
      rationale: `Only one participant has documented ${dimensionName} (${presentList.slice(0, 2).join(", ")}). Mutual fit cannot be fully verified.`,
      evidenceRefs: presentList.slice(0, 2),
    };
  }

  // Token-level and keyword similarity
  const listAWords = listA.flatMap((item) => item.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const listBWords = listB.flatMap((item) => item.toLowerCase().split(/\W+/).filter((w) => w.length > 3));

  const wordsA = new Set(listAWords);
  const wordsB = new Set(listBWords);

  const arrayA = Array.from(wordsA);
  const arrayB = Array.from(wordsB);

  const intersection = arrayA.filter((w) => wordsB.has(w));
  const union = new Set([...arrayA, ...arrayB]);
  const jaccard = union.size > 0 ? intersection.length / union.size : 0;

  // Base score 60 for both having active verified profiles in this dimension
  let score = 60 + Math.round(jaccard * 35);
  if (score > 95) score = 95;

  let rationale = `Both participants shared clear ${dimensionName}. `;
  if (intersection.length > 0) {
    rationale += `Identified shared touchpoints around "${intersection.slice(0, 3).join('", "')}".`;
  } else {
    rationale += `No direct keyword collision, but both profiles present complementary lifestyle perspectives.`;
  }

  return {
    score,
    status: "assessed",
    rationale,
    evidenceRefs: [...listA.slice(0, 2), ...listB.slice(0, 2)],
  };
}

/**
 * Calculates deterministic compatibility between two participants according to pairwise-match-v1.
 */
export function calculateCompatibility(
  participantA: Participant,
  candidate: Participant,
  dateSession?: DateSession | null
): CandidateRanking {
  if (participantA.id === candidate.id) {
    throw new Error("Cannot calculate compatibility with oneself");
  }

  // 1. Eligibility Gate: Must be active, consented, and have completed profile analysis
  const hasConsent = participantA.consentGiven && candidate.consentGiven;
  const isActive = participantA.status === "active" && candidate.status === "active";
  const hasAnalysis =
    participantA.analysisStatus === "completed" &&
    participantA.analysis &&
    candidate.analysisStatus === "completed" &&
    candidate.analysis;

  if (!hasConsent || !isActive || !hasAnalysis) {
    const emptyFactorScores: Record<string, FactorScoreDetail> = {
      relationshipGoals: { score: null, configuredWeight: MATCH_WEIGHTS.relationshipGoals, status: "unknown", rationale: "Analysis incomplete", evidenceRefs: [] },
      lifestyleValues: { score: null, configuredWeight: MATCH_WEIGHTS.lifestyleValues, status: "unknown", rationale: "Analysis incomplete", evidenceRefs: [] },
      sharedInterests: { score: null, configuredWeight: MATCH_WEIGHTS.sharedInterests, status: "unknown", rationale: "Analysis incomplete", evidenceRefs: [] },
      communicationPreferences: { score: null, configuredWeight: MATCH_WEIGHTS.communicationPreferences, status: "unknown", rationale: "Analysis incomplete", evidenceRefs: [] },
      dateConversation: { score: null, configuredWeight: MATCH_WEIGHTS.dateConversation, status: "unknown", rationale: "Analysis incomplete", evidenceRefs: [] },
    };

    return CandidateRankingSchema.parse({
      participantId: participantA.id,
      candidateId: candidate.id,
      candidateName: candidate.displayName,
      candidateRecordType: candidate.recordType,
      rank: 999,
      algorithmVersion: MATCH_ALGORITHM_VERSION,
      mode: "pre_date",
      status: "insufficient_evidence",
      score: null,
      coveragePercent: 0,
      confidence: "low",
      factorScores: emptyFactorScores,
      reasons: [],
      possibleFriction: ["Insufficient profile analysis to compute deterministic compatibility."],
      unknowns: ["Awaiting profile analysis completion for one or both participants."],
      dateId: null,
      calculatedAt: new Date().toISOString(),
    });
  }

  const analysisA = participantA.analysis!;
  const analysisB = candidate.analysis!;

  // 2. Check if a completed date session exists
  const hasCompletedDate =
    dateSession &&
    dateSession.status === "completed" &&
    dateSession.evaluationA &&
    dateSession.evaluationB;

  if (hasCompletedDate) {
    // Completed Date Mode (5 factors)
    // Orient directional evaluations:
    // evalFromAtoB: participantA evaluating candidate
    // evalFromBtoA: candidate evaluating participantA
    const isAParticipantA = dateSession.participantAId === participantA.id;
    const evalFromAtoB = isAParticipantA ? dateSession.evaluationA! : dateSession.evaluationB!;
    const evalFromBtoA = isAParticipantA ? dateSession.evaluationB! : dateSession.evaluationA!;

    const factorKeys: FactorKey[] = [
      "relationshipGoals",
      "lifestyleValues",
      "sharedInterests",
      "communicationPreferences",
      "dateConversation",
    ];

    const factorScores: Record<string, FactorScoreDetail> = {};
    let weightedNumerator = 0;
    let availableDenominator = 0;
    let maxDivergence = 0;
    const divergenceNotes: string[] = [];

    for (const key of factorKeys) {
      const assessmentA = evalFromAtoB.factors[key];
      const assessmentB = evalFromBtoA.factors[key];
      const weight = MATCH_WEIGHTS[key];

      const scoreA = assessmentA?.score ?? null;
      const scoreB = assessmentB?.score ?? null;

      if (scoreA !== null && scoreB !== null) {
        const mutual = Math.round((scoreA + scoreB) / 2);
        const divergence = Math.abs(scoreA - scoreB);
        if (divergence > maxDivergence) maxDivergence = divergence;

        if (divergence >= 25) {
          divergenceNotes.push(
            `Perspective divergence on ${key}: ${participantA.displayName} rated ${scoreA}/100 while ${candidate.displayName} rated ${scoreB}/100.`
          );
        }

        weightedNumerator += weight * mutual;
        availableDenominator += weight;

        const combinedEvidence = [
          assessmentA?.rationale,
          assessmentB?.rationale,
        ].filter(Boolean) as string[];

        factorScores[key] = {
          score: mutual,
          configuredWeight: weight,
          status: "assessed",
          directionalA: scoreA,
          directionalB: scoreB,
          rationale: `${assessmentA?.rationale || ""} ${assessmentB?.rationale || ""}`.trim(),
          evidenceRefs: combinedEvidence.slice(0, 3),
        };
      } else if (scoreA !== null || scoreB !== null) {
        const partialScore = scoreA ?? scoreB!;
        weightedNumerator += (weight * partialScore) * 0.8; // slight penalty for one-sided assessment
        availableDenominator += weight * 0.8;

        factorScores[key] = {
          score: partialScore,
          configuredWeight: weight,
          status: "partial",
          directionalA: scoreA,
          directionalB: scoreB,
          rationale: assessmentA?.rationale || assessmentB?.rationale || "One-sided evaluation available.",
          evidenceRefs: [],
        };
      } else {
        factorScores[key] = {
          score: null,
          configuredWeight: weight,
          status: "unknown",
          rationale: "Neither agent was able to assess this dimension during the date session.",
          evidenceRefs: [],
        };
      }
    }

    const finalScore = availableDenominator > 0 ? Math.round(weightedNumerator / availableDenominator) : null;
    const coveragePercent = Math.round((availableDenominator / 100) * 100);

    let confidence: Confidence = "low";
    if (coveragePercent >= 80 && maxDivergence < 20) {
      confidence = "high";
    } else if (coveragePercent >= 50 && maxDivergence <= 30) {
      confidence = "medium";
    }

    const mutualSummary = dateSession.mutualSummary;
    const reasons = [
      ...(mutualSummary?.positiveHighlights || []),
      ...evalFromAtoB.positiveSignals.slice(0, 2),
    ].slice(0, 3);

    const possibleFriction = [
      ...divergenceNotes,
      ...(mutualSummary?.potentialFriction || []),
      ...evalFromAtoB.tradeoffs.slice(0, 2),
    ].slice(0, 3);

    const unknowns = [
      ...(mutualSummary?.keyQuestions || []),
      ...evalFromAtoB.unresolvedQuestions.slice(0, 2),
    ].slice(0, 3);

    return CandidateRankingSchema.parse({
      participantId: participantA.id,
      candidateId: candidate.id,
      candidateName: candidate.displayName,
      candidateRecordType: candidate.recordType,
      rank: 1, // Will be updated during batch ranking sort
      algorithmVersion: MATCH_ALGORITHM_VERSION,
      mode: "completed_date",
      status: finalScore !== null ? "scored" : "insufficient_evidence",
      score: finalScore,
      coveragePercent,
      confidence,
      factorScores,
      reasons: reasons.length ? reasons : ["Demonstrated mutual conversational engagement during date session."],
      possibleFriction: possibleFriction.length ? possibleFriction : ["No major structural friction identified during the date."],
      unknowns: unknowns.length ? unknowns : ["In-person chemistry and daily cadence remain to be explored."],
      dateId: dateSession.id,
      calculatedAt: new Date().toISOString(),
    });
  }

  // 3. Pre-date Mode (4 profile factors, dateConversation is unknown)
  const factorKeysPreDate: Exclude<FactorKey, "dateConversation">[] = [
    "relationshipGoals",
    "lifestyleValues",
    "sharedInterests",
    "communicationPreferences",
  ];

  const factorScores: Record<string, FactorScoreDetail> = {};
  let weightedNumerator = 0;
  let availableDenominator = 0;

  // Relationship goals
  const relGoalsResult = compareTextArrays(
    analysisA.relationshipGoals,
    analysisB.relationshipGoals,
    "relationship goals"
  );
  factorScores.relationshipGoals = {
    score: relGoalsResult.score,
    configuredWeight: MATCH_WEIGHTS.relationshipGoals,
    status: relGoalsResult.status,
    rationale: relGoalsResult.rationale,
    evidenceRefs: relGoalsResult.evidenceRefs,
  };
  if (relGoalsResult.status !== "unknown") {
    weightedNumerator += MATCH_WEIGHTS.relationshipGoals * relGoalsResult.score;
    availableDenominator += MATCH_WEIGHTS.relationshipGoals;
  }

  // Lifestyle and values
  const lifestyleResult = compareTextArrays(
    [...analysisA.lifestyle, ...analysisA.needs],
    [...analysisB.lifestyle, ...analysisB.needs],
    "lifestyle and personal values"
  );
  factorScores.lifestyleValues = {
    score: lifestyleResult.score,
    configuredWeight: MATCH_WEIGHTS.lifestyleValues,
    status: lifestyleResult.status,
    rationale: lifestyleResult.rationale,
    evidenceRefs: lifestyleResult.evidenceRefs,
  };
  if (lifestyleResult.status !== "unknown") {
    weightedNumerator += MATCH_WEIGHTS.lifestyleValues * lifestyleResult.score;
    availableDenominator += MATCH_WEIGHTS.lifestyleValues;
  }

  // Shared interests & hobbies
  const interestsResult = compareTextArrays(
    [...analysisA.interests, ...analysisA.hobbies],
    [...analysisB.interests, ...analysisB.hobbies],
    "shared interests and hobbies"
  );
  factorScores.sharedInterests = {
    score: interestsResult.score,
    configuredWeight: MATCH_WEIGHTS.sharedInterests,
    status: interestsResult.status,
    rationale: interestsResult.rationale,
    evidenceRefs: interestsResult.evidenceRefs,
  };
  if (interestsResult.status !== "unknown") {
    weightedNumerator += MATCH_WEIGHTS.sharedInterests * interestsResult.score;
    availableDenominator += MATCH_WEIGHTS.sharedInterests;
  }

  // Communication preferences
  const commsResult = compareTextArrays(
    analysisA.communicationPreferences,
    analysisB.communicationPreferences,
    "communication preferences"
  );
  factorScores.communicationPreferences = {
    score: commsResult.score,
    configuredWeight: MATCH_WEIGHTS.communicationPreferences,
    status: commsResult.status,
    rationale: commsResult.rationale,
    evidenceRefs: commsResult.evidenceRefs,
  };
  if (commsResult.status !== "unknown") {
    weightedNumerator += MATCH_WEIGHTS.communicationPreferences * commsResult.score;
    availableDenominator += MATCH_WEIGHTS.communicationPreferences;
  }

  // Date conversation factor is unassessed in pre-date mode
  factorScores.dateConversation = {
    score: null,
    configuredWeight: MATCH_WEIGHTS.dateConversation,
    status: "unknown",
    rationale: "Pre-date estimate: agent dating simulation has not been conducted yet.",
    evidenceRefs: [],
  };

  // Pre-date maximum weight is 90 (30 + 25 + 20 + 15)
  const maxPreDateWeight = 90;
  const finalScore = availableDenominator > 0 ? Math.round(weightedNumerator / availableDenominator) : null;
  const coveragePercent = Math.round((availableDenominator / maxPreDateWeight) * 100);

  const confidence: Confidence = coveragePercent >= 75 ? "medium" : "low";

  const reasons = [
    `Profile alignment in ${interestsResult.status === "assessed" ? "shared activities" : "general interests"}.`,
    relGoalsResult.rationale,
  ].slice(0, 2);

  const possibleFriction = [
    "Pre-date estimate: in-depth conversational chemistry and conflict styles are unverified.",
  ];

  const unknowns = [
    "Real-time conversational pace and active listening.",
    ...analysisA.unknowns.slice(0, 2),
  ].slice(0, 3);

  return CandidateRankingSchema.parse({
    participantId: participantA.id,
    candidateId: candidate.id,
    candidateName: candidate.displayName,
    candidateRecordType: candidate.recordType,
    rank: 1,
    algorithmVersion: MATCH_ALGORITHM_VERSION,
    mode: "pre_date",
    status: finalScore !== null ? "scored" : "insufficient_evidence",
    score: finalScore,
    coveragePercent,
    confidence,
    factorScores,
    reasons,
    possibleFriction,
    unknowns,
    dateId: null,
    calculatedAt: new Date().toISOString(),
  });
}

/**
 * Calculates, ranks, and persists deterministic compatibility rankings for a participant.
 */
export async function calculateRankingsForParticipant(
  participantId: string
): Promise<CandidateRanking[]> {
  const participantA = await getParticipantById(participantId);
  if (!participantA) {
    throw new Error(`Participant not found: ${participantId}`);
  }

  const allActiveParticipants = await getParticipants(true);
  const candidates = allActiveParticipants.filter((p) => p.id !== participantId);
  const allDateSessions = await getDateSessions();

  const results: CandidateRanking[] = [];

  for (const candidate of candidates) {
    // Find the latest completed or existing date session between participantA and candidate
    const relevantDate = allDateSessions.find(
      (d) =>
        (d.participantAId === participantId && d.participantBId === candidate.id) ||
        (d.participantAId === candidate.id && d.participantBId === participantId)
    );

    const ranking = calculateCompatibility(participantA, candidate, relevantDate);
    results.push(ranking);
  }

  // Deterministic sorting according to docs/MATCHING-ALGORITHM.md:
  // 1. Scored candidates first
  // 2. Score descending
  // 3. CoveragePercent descending
  // 4. Stable candidate ID ascending
  const scored = results.filter((r) => r.status === "scored");
  const unScored = results.filter((r) => r.status !== "scored");

  scored.sort((a, b) => {
    // Primary: Score descending
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;

    // Secondary: Coverage percent descending
    const coverageDiff = b.coveragePercent - a.coveragePercent;
    if (coverageDiff !== 0) return coverageDiff;

    // Tertiary: Stable tie-breaker by ID
    return a.candidateId.localeCompare(b.candidateId);
  });

  // Assign 1-indexed ranks to scored candidates
  scored.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Assign ranks after scored to unScored
  unScored.forEach((item, index) => {
    item.rank = scored.length + index + 1;
  });

  const finalRankings = [...scored, ...unScored];

  // Persist to store
  await saveRankingsForParticipant(participantId, finalRankings);

  return finalRankings;
}
