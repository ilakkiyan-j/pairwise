# Pairwise — Matching Algorithm

**Status:** MVP specification  
**Algorithm version:** `pairwise-match-v1`  
**Purpose:** Define a deterministic, explainable way to rank eligible participant pairs using the two permitted profile sources, participant-stated dating preferences, and completed agent-date evaluations.

> Compatibility scores are estimates from limited evidence, not predictions or guarantees of relationship success. Unknown information must remain unknown rather than being treated as a mismatch.

## 1. Principles

1. **Consent and eligibility first.** A pair is considered only when both participants have opted in to dating-oriented analysis and matching, are active, and have not blocked or excluded each other.
2. **Evidence before inference.** Scores should be grounded in supported profile findings, explicitly stated preferences, and the saved agent-date transcript. Every displayed explanation should have a traceable source or message reference where possible.
3. **Mutual fit, not popularity.** Both participants' stated goals and assessments matter. Follower count, likes, appearance, popularity, employer prestige, inferred income, and protected or sensitive traits are not match factors.
4. **Deterministic arithmetic.** An LLM may produce structured assessments and explanations; application code validates the output and calculates final scores and ranks.
5. **Missing is not negative.** Missing, ambiguous, or contradictory evidence lowers coverage and may make a factor unavailable. It does not automatically score zero.
6. **Symmetric pair score, individual ranking.** A pair gets one mutual score. Each participant's ranking filters out ineligible candidates and sorts by that same pair score, with transparent tie-breakers.
7. **Version everything.** Save the algorithm version, input analysis IDs, date ID, and calculation timestamp with each ranking result.

## 2. Eligibility gate

Exclude a candidate pair before calculating scores if any condition below is true:

- Either participant has not explicitly consented to dating-oriented analysis and matching.
- Either participant is inactive, deleted, or has withdrawn consent.
- A participant has blocked or excluded the other.
- Either profile lacks the minimum usable analysis required by the current product rules.
- A required source record is missing or its provenance indicates that the content was not collected through an allowed method.
- The pair is the same person.

Eligibility is a hard gate, not a score penalty. Do not show excluded people in rankings or imply that exclusion means poor compatibility.

## 3. Score dimensions and weights

The standard completed-date model uses the following starting weights. Keep these weights in one exported configuration in `lib/compatibility.ts` and document any change with a new algorithm version.

| Dimension | Weight | Evidence to compare |
|---|---:|---|
| Relationship goals and expectations | 30% | Explicitly stated relationship intent, pace, commitment expectations, and near-term priorities |
| Lifestyle and values | 25% | Stated day-to-day preferences, routines, priorities, and values that participants have chosen to share |
| Shared interests and activities | 20% | Hobbies, interests, and activities either person has explicitly discussed or that are reliably supported by permitted source content |
| Communication preferences | 15% | Stated preferences around communication frequency, directness, planning, conflict discussion, and quality time |
| Agent-date conversation quality | 10% | Saved conversation evidence about curiosity, listening, respectful disagreement, follow-up questions, and clarity of expectations |

Weights add to 100%. They are initial product defaults, not scientifically validated predictors of relationship success. The UI should make them inspectable and should not suggest that differences in score are empirically precise.

### Excluded factors

Do not calculate or infer compatibility from protected or sensitive traits, attractiveness, body type, race or ethnicity, religion, health status, sexuality, political views, follower count, engagement metrics, prestige, income, or popularity. A participant's explicitly stated preferences may be considered only where appropriate to the intended dating use and applicable policy; do not derive sensitive traits from proxy signals or profile aesthetics.

## 4. Normalize factor assessments

Each factor score is an integer or number on a `0–100` scale, where:

- `0–19`: evidence suggests substantial incompatibility on this specific factor.
- `20–39`: meaningful differences or unresolved conflicts are present.
- `40–59`: mixed evidence, moderate fit, or important unknowns.
- `60–79`: generally compatible based on available evidence.
- `80–100`: strong alignment supported by specific evidence.

A numerical score must have a short rationale and evidence references. Avoid unjustified precision: integer scores are sufficient for the MVP.

Every factor assessment should include:

```ts
export type FactorAssessment = {
  score: number; // 0..100
  status: "assessed" | "partial" | "unknown" | "conflicting";
  rationale: string;
  evidence: Array<{
    sourceType: "linkedin" | "instagram" | "participant_preferences" | "date_message";
    sourceRecordId?: string;
    messageId?: string;
    excerpt?: string;
  }>;
};
```

The `excerpt` field should contain only the minimum needed to explain the result, not a wholesale copy of source content. Validate scores and allowed status values with Zod before persistence. A factor marked `unknown` has no numeric contribution. A `partial` or `conflicting` factor may contribute only if the evaluator can support a score, and it should lower evidence coverage.

## 5. Directional evaluation and mutual factor score

For each eligible pair `(A, B)`, the evaluator provides directional assessments for both participants. The directional evaluation answers: "How well does this candidate appear to fit this participant's stated goals, based on the permitted evidence?"

For every factor `f`, define:

- `s(A → B, f)`: A's evaluation of B for factor `f`.
- `s(B → A, f)`: B's evaluation of A for factor `f`.

Where both directional assessments are available, calculate the mutual factor score as their arithmetic mean:

`mutualFactor(f) = (s(A → B, f) + s(B → A, f)) / 2`

If only one directional assessment is available, use it provisionally only when its evidence is sufficient and label the factor as partial. Prefer to wait for both sides before publishing a final score. Store the individual directional assessments so the UI can explain meaningful asymmetry rather than hiding it behind the average.

For the date factor specifically:

`mutualDateScore = (dateScore(A → B) + dateScore(B → A)) / 2`

The date factor is available only after an actual saved agent-to-agent conversation has completed and both directional evaluations have passed validation.

## 6. Overall compatibility formula

Let `W` be the configured weights, and `A_f` be the set of factors with sufficient evidence for the pair. Let `w_f` be a factor's configured weight and `m_f` its mutual factor score.

The completed-date compatibility score is:

`score = round( Σ(w_f × m_f) / Σ(w_f), f ∈ A_f )`

This is a weighted mean over available factors only. Do not substitute `0` for an unknown factor. Keep the original configured weights for the denominator only when those factors are actually available; renormalize them for the score calculation.

### Before a date has run

Display a clearly labeled **Pre-date estimate**. Use only the four profile-based dimensions, renormalized to their available weights. Do not include the date factor, do not fill it with zero, and do not label the result a completed-date score. After the date is completed, recalculate the score with the date dimension and mark the earlier ranking as superseded.

### No usable evidence

If no factor has sufficient evidence, return `score: null` and a status such as `insufficient_evidence`. Never invent a numeric score merely to fill the ranking table.

### Example

Suppose a pair has the following mutual factor scores:

| Factor | Weight | Mutual score | Weighted points |
|---|---:|---:|---:|
| Relationship goals | 30% | 90 | 27.0 |
| Lifestyle and values | 25% | 80 | 20.0 |
| Shared interests | 20% | 70 | 14.0 |
| Communication preferences | 15% | 60 | 9.0 |
| Agent-date quality | 10% | 80 | 8.0 |
| **Total** | **100%** | — | **78.0** |

The final score is `78`. It should be accompanied by evidence coverage and an explanation that identifies both strengths and open questions. This example illustrates the arithmetic only; real scores must come from validated evaluations of the pair's actual evidence.

## 7. Evidence coverage and confidence

A score without coverage is misleading. Store two separate indicators:

1. **Evidence coverage:** the share of total configured weight represented by usable evidence before normalization.
2. **Assessment confidence:** a coarse label (`low`, `medium`, `high`) derived from evidence quality and agreement between directional evaluations, not simply from the model's self-reported confidence.

Coverage formula:

`coveragePercent = round(100 × Σ(w_f for available factors) / Σ(all configured weights))`

For a pre-date estimate, report coverage against the four profile-based dimensions' configured weights, and label the mode explicitly. For a completed-date score, report coverage against all five dimensions. Do not compare coverage numbers across modes without showing the mode.

Recommended UI labels:

- `High evidence coverage`: 80–100%
- `Moderate evidence coverage`: 50–79%
- `Limited evidence coverage`: below 50%

These are UX thresholds, not statistical confidence intervals. A high score with limited coverage must display a visible caveat.

### Directional disagreement

Let `d_f = abs(s(A → B, f) - s(B → A, f))` for factors with both scores. Large disagreement is not automatically incompatibility; it may reflect differing perspectives or uneven evidence. Flag a factor for the explanation when `d_f >= 25`, surface the differing rationales, and suggest that it is an open question. Do not silently average away material disagreement.

## 8. Match explanations

For every pair, save and display:

- **Why it may work:** up to three concise reasons supported by evidence.
- **Potential friction:** up to two meaningful differences supported by evidence.
- **Open questions:** up to three items where evidence is absent, ambiguous, or inconsistent.
- **Evidence coverage and score mode:** pre-date estimate or completed-date score.
- **Source references:** permitted LinkedIn/Instagram source records, participant-stated preferences, or saved date-message IDs that support the explanation.

Explanations must be specific rather than generic. "You both seem compatible" is insufficient. Prefer a grounded statement such as: "Both participants explicitly prefer planned quality time; their preferred communication frequency is not yet known." Do not expose private agent prompts, hidden evaluations not approved for display, secrets, or unnecessary personal source text.

Do not assert a hobby, value, relationship goal, or need unless supported by evidence. Distinguish an observation from an interpretation, and label unsupported fields as unknown.

## 9. Ranking rules

For a participant `A`:

1. Apply the eligibility gate to candidates.
2. Load the latest valid profile analyses and latest valid pair/date evaluations.
3. Compute one mutual score per eligible pair.
4. Sort scored candidates by descending score.
5. For equal rounded scores, sort by higher evidence coverage, then lower maximum directional disagreement across available factors, then a stable candidate ID as a final deterministic tie-breaker.
6. Place `insufficient_evidence` pairs after scored candidates in a separately labeled section, if the product elects to show them at all. Do not assign them an invented rank or numeric score.
7. Recalculate only when a profile analysis, relevant preference, completed date, eligibility status, or algorithm version changes. Otherwise return the saved ranking.

The same mutual pair score should be shown in A's and B's rankings so the pair is scored consistently. The rationale may be tailored to the viewer, but should not reveal the other participant's private notes or hidden evaluation.

## 10. Suggested TypeScript contract

```ts
export const MATCH_ALGORITHM_VERSION = "pairwise-match-v1" as const;

export const MATCH_WEIGHTS = {
  relationshipGoals: 30,
  lifestyleValues: 25,
  sharedInterests: 20,
  communicationPreferences: 15,
  dateConversation: 10,
} as const;

export type MatchMode = "pre_date" | "completed_date";
export type MatchStatus = "scored" | "insufficient_evidence";

export type MatchResult = {
  participantId: string;
  candidateId: string;
  algorithmVersion: typeof MATCH_ALGORITHM_VERSION;
  mode: MatchMode;
  status: MatchStatus;
  score: number | null; // integer 0..100 or null
  coveragePercent: number; // integer 0..100
  confidence: "low" | "medium" | "high";
  factorScores: Record<string, {
    score: number | null;
    configuredWeight: number;
    status: "assessed" | "partial" | "unknown" | "conflicting";
    directionalA?: number;
    directionalB?: number;
    rationale: string;
    evidenceRefs: string[];
  }>;
  reasons: string[];
  possibleFriction: string[];
  unknowns: string[];
  profileAnalysisIds: string[];
  dateId: string | null;
  calculatedAt: string;
};
```

The actual implementation can adapt property names to the database schema, but preserve the semantics. Validate input and output boundaries with Zod. Scores must be finite numbers in `[0, 100]`; weights must be non-negative and the configured weights must sum to 100.

## 11. Reference implementation pseudocode

```ts
type FactorKey = keyof typeof MATCH_WEIGHTS;
type FactorValue = {
  aToB: number | null;
  bToA: number | null;
  status: "assessed" | "partial" | "unknown" | "conflicting";
};

function mutualFactorScore(value: FactorValue): number | null {
  const available = [value.aToB, value.bToA]
    .filter((v): v is number => v !== null && Number.isFinite(v));

  if (available.length === 0) return null;
  return available.reduce((sum, value) => sum + value, 0) / available.length;
}

function calculateMatch(
  factors: Record<FactorKey, FactorValue>,
  mode: "pre_date" | "completed_date",
) {
  const keys: FactorKey[] = mode === "pre_date"
    ? ["relationshipGoals", "lifestyleValues", "sharedInterests", "communicationPreferences"]
    : ["relationshipGoals", "lifestyleValues", "sharedInterests", "communicationPreferences", "dateConversation"];

  let weightedTotal = 0;
  let availableWeight = 0;
  let totalConfiguredWeight = 0;
  const factorScores: Record<string, number | null> = {};

  for (const key of keys) {
    const weight = MATCH_WEIGHTS[key];
    totalConfiguredWeight += weight;

    const score = mutualFactorScore(factors[key]);
    factorScores[key] = score;

    // Only count factors that have usable, validated evidence.
    if (score !== null && factors[key].status !== "unknown") {
      weightedTotal += score * weight;
      availableWeight += weight;
    }
  }

  if (availableWeight === 0) {
    return {
      score: null,
      status: "insufficient_evidence" as const,
      coveragePercent: 0,
      factorScores,
    };
  }

  return {
    score: Math.round(weightedTotal / availableWeight),
    status: "scored" as const,
    coveragePercent: Math.round(100 * availableWeight / totalConfiguredWeight),
    factorScores,
  };
}
```

This is reference pseudocode, not a complete production function. Before using it, add runtime validation, eligibility checks, proper treatment of `partial`/`conflicting` statuses, directional-disagreement calculations, and a test suite. A factor with `partial` or `conflicting` status should contribute only when the schema also confirms usable evidence and the UI exposes that limitation.

## 12. Required tests

1. **Weight validation:** configured weights sum to 100 and are non-negative.
2. **Perfect alignment:** all factor scores of 100 produce 100 with full coverage.
3. **Zero alignment:** all available factor scores of 0 produce 0, not `null`.
4. **Unknown factor:** an unknown factor is omitted and remaining weights are renormalized.
5. **Pre-date mode:** excludes the date factor and clearly labels the output as a pre-date estimate.
6. **Completed-date mode:** includes the date factor only when both date evaluations are valid and the conversation is completed.
7. **No evidence:** returns `score: null` and `insufficient_evidence`.
8. **Symmetry:** swapping A and B preserves the mutual score and coverage.
9. **Directional disagreement:** large disagreement is flagged and its reasons remain inspectable.
10. **Consent gate:** pairs with missing/withdrawn consent are never ranked.
11. **Self-match exclusion:** a participant cannot appear in their own candidate list.
12. **Stable sort:** equal scores use documented tie-breakers consistently.
13. **Deletion and stale results:** removed participants disappear from rankings and dependent saved results are invalidated according to the retention policy.
14. **Output validation:** reject NaN, infinity, scores outside `[0,100]`, malformed evidence refs, and missing required explanation fields.
15. **Determinism:** identical validated inputs and algorithm version yield identical scores and order.

## 13. MVP implementation order

1. Add the canonical weights and algorithm version to `lib/compatibility.ts`.
2. Create Zod schemas for directional factor assessments and final match results.
3. Implement eligibility gating before any pair scoring.
4. Normalize the profile evaluator output to the four profile-based factors.
5. Add date evaluations as a fifth factor only after a completed conversation.
6. Compute mutual factor scores, total score, coverage, disagreement flags, and explanations.
7. Persist results with participant IDs, analysis IDs, date ID, algorithm version, and timestamp.
8. Build the rankings page with score, mode, coverage, factors, strengths, friction, unknowns, and transcript/evidence links.
9. Run the tests above and verify that reopening the ranking page does not silently trigger new LLM calls.

## 14. Product language

Use labels such as **Compatibility estimate**, **Pre-date estimate**, **Evidence coverage**, **Why it may work**, **Potential friction**, and **Open questions**. Avoid claims such as "perfect match," "soulmate score," or any wording that implies a score is an objective measure of a person's value.
