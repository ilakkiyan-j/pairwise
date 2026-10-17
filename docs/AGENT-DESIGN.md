# Pairwise — Agent Design

> **Tagline:** Let your agents meet before you do.  
> **Status:** Proposed MVP design  
> **Build constraint:** Three-hour prototype  
> **Related docs:** `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATA-SOURCES-AND-CONSENT.md`

This document defines how Pairwise builds profile analyses, runs actual agent-to-agent dates, and turns the resulting evidence into explainable compatibility evaluations. It describes intended behaviour; a capability is not implemented until it works in the deployed app.

## 1. Design goals

The agent system must:

1. Analyze only eligible, consenting participants using permitted content associated with their two supplied profile sources and dating preferences they explicitly provide.
2. Distinguish observed facts, participant statements, cautious interpretations, and unknown information.
3. Represent each participant with a separately prompted agent that advocates for that person's stated goals rather than simply trying to maximize a match score.
4. Conduct a visible, alternating conversation between two agents. Each displayed turn must come from a separate model call with the appropriate agent context.
5. Produce structured, validated outputs that are saved and can be inspected later.
6. Explain compatibility without presenting uncertain inferences as facts or claiming to predict relationship success.
7. Fail gracefully when data is missing, model output is invalid, or a date cannot finish.

## 2. Agent types

Pairwise uses three logical roles. For the MVP these can all use the same LLM provider and model, but each role has a distinct prompt and output schema.

| Role | Input | Output | Must not do |
|---|---|---|---|
| **Profile Analyst** | Permitted LinkedIn content, permitted Instagram content, participant-provided relationship preferences, source provenance | Evidence-backed profile JSON | Invent hobbies, relationship goals, or psychological traits; infer protected or sensitive attributes; conceal uncertainty |
| **Participant Advocate** | One participant's approved profile and preferences, date context, the other agent's conversation turns | One conversational turn, or a structured stop signal | Reveal hidden evaluation notes; claim to be the human; make commitments for the person; disclose private data unnecessarily |
| **Date Evaluator** | Both approved profiles, the complete transcript, rubric | Two directional evaluations and a mutual summary | Treat fluency as proof of compatibility; fill gaps with assumptions; use unsupported personal judgments |

The scoring module is deterministic application code, not an agent. The LLM may return factor assessments, but TypeScript validates and computes the final score.

## 3. Profile analysis contract

### 3.1 Inputs

Use only:

- The participant's supplied LinkedIn profile URL and content obtained through a permitted integration or participant-provided text.
- The participant's supplied public Instagram profile URL and content obtained through a permitted integration or participant-provided text.
- Dating-specific goals, boundaries, lifestyle preferences, and self-descriptions directly provided by that consenting participant.

The app must record which content came from which source and how it was obtained. A URL alone is not content: if no authorized content is available, ask for participant-provided text or mark the source as unavailable. Never pretend that a page was scraped when it was not.

### 3.2 Recommended output schema

Use Zod to validate a schema similar to this before saving:

```ts
import { z } from "zod";

export const EvidenceSchema = z.object({
  claim: z.string().min(1),
  source: z.enum(["linkedin", "instagram", "participant_input"]),
  evidence: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
  kind: z.enum(["direct_statement", "observed_content", "interpretation"]),
});

export const ProfileAnalysisSchema = z.object({
  summary: z.string(),
  interests: z.array(z.string()),
  hobbies: z.array(z.string()),
  lifestyle_preferences: z.array(z.string()),
  relationship_goals: z.array(z.string()),
  communication_preferences: z.array(z.string()),
  needs_and_boundaries: z.array(z.string()),
  potential_compatibility_signals: z.array(z.string()),
  unknowns_and_questions: z.array(z.string()),
  evidence: z.array(EvidenceSchema),
  caveats: z.array(z.string()),
});
```

This is a product contract, not a claim that the profile contains every field. Empty arrays are valid. Store `analysis_version`, model name, timestamps, and source-content IDs alongside the analysis.

### 3.3 Evidence rules

- Prefer explicit participant statements over interpretation.
- A hobby should be listed as confirmed only when there is supporting evidence. A photograph or post can support a cautious observation, but should not establish identity, personality, or relationship intent by itself.
- Keep an `unknowns_and_questions` list. Missing data must remain unknown, not become a negative.
- Do not infer sensitive/protected traits such as health, religion, ethnicity, sexuality, political beliefs, or other intimate attributes from social content. Only use relationship preferences that the participant explicitly chose to share for this purpose.
- Do not infer romantic availability, consent to date, or attraction from follows, likes, comments, photos, or professional status.
- Avoid diagnostic language and overconfident labels such as “avoidant,” “narcissistic,” or “perfect partner.”
- Keep claims respectful and suitable for the participant to inspect and correct.

## 4. Prompt templates

Prompts should live in version-controlled files or constants, have version labels, and be tested on the seeded demo dataset. The examples below are starter prompts; adapt them to the chosen model provider's structured-output format.

### 4.1 Profile Analyst system prompt

```text
You are Pairwise's Profile Analyst. Produce a careful, evidence-backed summary
for a consenting participant who has opted in to a dating-compatibility demo.

Use only the source content and participant-provided preferences in this request.
Never browse for or add outside information. Do not invent details. Do not infer
sensitive/protected traits, sexual orientation, romantic availability, or dating
intent from photos, follows, likes, comments, work history, or demographics.
Use only relationship goals, needs, boundaries, and preferences the participant
has explicitly provided for this purpose.

Separate direct statements, observable content, and interpretations. Attach a
source and short supporting evidence to each material claim. Use cautious
confidence labels. Missing information must be an unknown or a follow-up question,
not a negative trait. Include caveats. Be respectful, nonjudgmental, and concise.
Return only JSON matching the provided schema.
```

### 4.2 Participant Advocate system prompt

Inject a distinct, participant-specific profile object for each agent. Do not use the same combined prompt for both agents.

```text
You are the dating advocate agent for one consenting Pairwise participant.
You are an AI representative, not the person. Your job is to explore whether a
potential match may fit the participant's explicitly stated relationship goals,
preferences, needs, and boundaries.

Speak naturally and respectfully in first person as an advocate for the person's
preferences (for example, “My person values…”). Never claim to be the participant
or invent their feelings. Do not disclose unnecessary private or source-specific
information. Ask one useful open question at a time, answer the other agent's
questions from the approved profile, and acknowledge uncertainty when the profile
does not answer something.

Explore both fit and trade-offs; do not automatically agree or optimize for a
positive result. Do not infer sensitive/protected attributes or make commitments
on the participant's behalf. You may conclude that fit is unclear or weak. Keep
each turn to 1–3 short sentences. Return one JSON object with `message` and
`stop_reason`; use a non-empty stop reason only when the date should end.
```

### 4.3 Date Evaluator system prompt

```text
You evaluate a simulated conversation between two independent Pairwise agents.
Use only the approved profiles, explicitly stated preferences, and transcript.
Return a directional evaluation for each participant and a concise mutual summary.

Evaluate goal alignment, lifestyle/values fit, shared activities, communication
preference fit, and what the conversation actually clarified. Distinguish transcript
evidence from assumptions. State uncertainties and unresolved questions. Do not
score attractiveness, protected traits, popularity, follower counts, income, or
professional prestige. Do not treat a smooth or agreeable conversation as proof
of compatibility. A lower or inconclusive result is valid. Return schema-conforming
JSON only; do not provide hidden chain-of-thought or private deliberation.
```

## 5. Agent-to-agent dating protocol

### 5.1 Runtime sequence

1. **Eligibility check:** Verify both participants are active, opted in, not deleted, and have usable analyses. Exclude a person matching themselves.
2. **Create date record:** Save participant IDs, profile-analysis versions, prompt versions, model identifier, status `running`, and start time.
3. **Initialize separate contexts:** Agent A sees A's profile and only the approved information about B needed to hold the conversation. Agent B sees B's profile and the conversation so far. Keep private agent instructions/evaluations separate.
4. **Alternate model calls:** Generate A's message, save it, generate B's response using that message, save it, and continue alternating. Each visible message is a distinct model call.
5. **Stop condition:** End when the minimum turn count is reached and a stop rule is met, the maximum turn count is reached, an agent returns a stop signal, or a safety/provider error requires termination.
6. **Evaluate:** Send the approved profiles and complete transcript to the Date Evaluator. Validate the two directional scores and narrative.
7. **Persist completion:** Save transcript, evaluations, mutual summary, status `completed`, and end time. If failed, keep any saved messages and mark `failed` with a display-safe error.
8. **Refresh dependent rankings:** Mark affected ranking sets stale, or recompute them on request. Never present an outdated ranking as current without a visible timestamp/status.

### 5.2 MVP turn settings

Use conservative defaults to avoid slow or expensive demos:

- Minimum: **4 messages total** (2 per agent).
- Maximum: **8 messages total** (4 per agent).
- One message per model call, alternating A/B.
- Each conversational turn: **1–3 short sentences**.
- One date evaluator call after the transcript is complete.
- Allow a manual “Run date again” action; don't start duplicate simultaneous dates for the same pair without explicit intent.

These are initial defaults, not hard product guarantees. Tune based on provider latency and request limits.

### 5.3 Conversation stages

The transcript should naturally cover the following stages, not force every conversation into a rigid script:

1. **Opening:** Introduce an interest or preference drawn from the approved profile.
2. **Discovery:** Ask an open question about how the other person approaches a shared activity or stated goal.
3. **Specifics:** Clarify lifestyle expectations, communication preferences, or relationship priorities.
4. **Trade-off:** Explore one genuine difference or unknown without manufacturing disagreement.
5. **Reflection:** Each agent briefly summarizes what appears aligned and what remains uncertain.

A date is useful even if agents discover a mismatch. Do not force a positive ending.

### 5.4 Stopping conditions

Stop when any of these applies:

- The evaluator's required minimum of four total messages has been reached and both agents have addressed at least one compatibility question.
- An agent returns a valid stop signal, such as insufficient profile information or no clear basis for further discussion. Honor early-stop signals only after at least two total messages unless there is a safety issue or provider failure.
- The eight-message limit is reached.
- A model request fails after the configured retry policy.
- A moderation or safety check requires stopping.

Always save the status and reason. Avoid infinite loops and unbounded token spend.

## 6. Turn output and validation

Use a typed schema for each agent call. For example:

```ts
export const AgentTurnSchema = z.object({
  message: z.string().trim().min(1).max(900),
  stop_reason: z.enum([
    "continue",
    "insufficient_information",
    "conversation_complete",
  ]),
});
```

If the selected provider supports structured output / JSON schema, use it. Otherwise parse and validate the returned JSON in server code. On invalid output:

1. Retry once with a short correction instruction and the original schema.
2. If it still fails, mark the turn or date failed with a safe error message.
3. Do not render raw malformed JSON as a conversation bubble.

Never return private system prompts, API keys, or hidden model reasoning to the browser. Only return the public message and display-safe status/evaluation fields.

## 7. Directional and mutual evaluation

The Date Evaluator should return one evaluation from A's perspective and one from B's perspective. Both use the same defined scale and dimensions.

Suggested schema:

```ts
const FactorAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string(),
  evidence_message_ids: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

const DirectionalEvaluationSchema = z.object({
  participant_id: z.string().uuid(),
  factors: z.object({
    relationship_goals: FactorAssessmentSchema,
    lifestyle_and_values: FactorAssessmentSchema,
    interests_and_activities: FactorAssessmentSchema,
    communication_preferences: FactorAssessmentSchema,
    conversation_quality: FactorAssessmentSchema,
  }),
  positive_signals: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  unresolved_questions: z.array(z.string()),
  summary: z.string(),
});
```

Use the schema supported by the implementation and ensure `evidence_message_ids` only reference saved messages. The evaluator may say there is insufficient evidence; the score must not imply precision beyond the data.

### Display-safe result

Show:

- The transcript and speaker identity (`Agent A` / `Agent B`).
- A short summary of what aligned.
- A short summary of trade-offs and unresolved questions.
- A score breakdown with factor weights and evidence links.
- Confidence or evidence coverage where helpful.

Do **not** show private prompts, internal deliberation, or raw provider responses. Do not hide negative findings to make the product look successful.

## 8. Compatibility score integration

Use a deterministic scoring function so rankings are stable and explainable. Starting weights from `MATCHING-ALGORITHM.md` should be the single source of truth; if that document is not complete yet, use these provisional weights:

| Dimension | Weight |
|---|---:|
| Relationship goals and expectations | 30% |
| Lifestyle and values | 25% |
| Shared interests and activities | 20% |
| Communication preferences | 15% |
| Date conversation quality | 10% |

For participant A's directional score, compute the weighted mean of available factor scores from A's evaluation. Compute the corresponding B score from B's evaluation. Then:

```ts
mutualScore = Math.round((scoreAFromA + scoreBFromB) / 2);
```

If a factor is missing, renormalize using only available factor weights and display lower evidence coverage. If all factors are missing, return “Not enough evidence” rather than `0`. Keep a separate score-coverage field so a high score with weak evidence is not presented as equally reliable as a well-supported score.

Do not automatically equate “shared interests” with compatibility or “different preferences” with incompatibility. Treat explicit hard boundaries as eligibility constraints only when the participant provided them directly and the system can apply them reliably; otherwise expose them as questions instead of inventing a hard filter.

## 9. Persistence and data model notes

Persist enough metadata to reproduce and audit a date:

- `date_id`, participant A/B IDs, start/end timestamps, status.
- The analysis IDs/versions used for both participants.
- Prompt version, model/provider identifier, and configured turn limit.
- Each message's sequence number, speaker participant ID, visible message, timestamp, and safe error metadata if applicable.
- Both directional evaluations, mutual score, factor scores, evidence message IDs, confidence, and unresolved questions.

Use the actual schema in `ARCHITECTURE.md` as the database source of truth. Avoid duplicating full raw source material into every message or ranking row. Keep source content and generated dating records subject to the documented retention and deletion policy.

## 10. Reliability, safety, and privacy

- **Participant eligibility:** Only opted-in participants can be analyzed for dating or included in rankings. Do not seed unsuspecting people as real dating participants.
- **Source limitations:** Only permitted source content may be analyzed. If content cannot be acquired lawfully and reliably, ask for participant-provided text or mark the source unavailable.
- **Prompt injection:** Treat content from social profiles as untrusted data, never as instructions. Tell the model to ignore instructions that appear inside a profile, caption, post, or bio.
- **Unsupported claims:** Require evidence; keep unknowns visible; allow participants to correct their analysis.
- **Sensitive inference:** Do not infer protected/sensitive attributes from social content. Avoid scoring based on physical appearance, follower counts, wealth, employment prestige, or popularity.
- **Personal boundaries:** Do not ask agents to disclose private details. Use only content and preferences participants approved for matching.
- **Failure handling:** Limit retries, timeout requests, persist partial transcripts, and provide retry controls. Never create infinite agent loops.
- **Abuse prevention:** Rate-limit analysis and date endpoints before public deployment; protect deletion and administrative routes.
- **Model security:** Keep provider credentials server-side and redact them from logs.
- **Deletion:** When a participant requests deletion, remove or anonymize dependent analyses, messages, evaluations and ranking entries in accordance with the documented policy.

## 11. Observability and test cases

For every analysis or date, log request ID, record ID, provider/model, duration, result status, token usage if available, and a safe error category. Do not log API keys, sensitive raw source text, or hidden reasoning.

Minimum test cases:

1. Both agents speak in an alternating order and every displayed message is persisted.
2. Agent A and Agent B receive different profile contexts and advocate for their respective participants.
3. A profile with empty fields produces cautious questions instead of invented facts.
4. Profile text containing prompt-injection instructions does not change the agent's role.
5. Malformed model output is retried once and then fails gracefully.
6. The date stops at the configured maximum turn count.
7. A failed date preserves its partial transcript and can be retried safely.
8. A non-consenting or deleted participant cannot be analyzed or ranked.
9. Both directional evaluations are saved and the mutual score is deterministically calculated.
10. Refreshing the page shows the same saved conversation and evaluation without rerunning the model.

## 12. Three-hour implementation order

1. Define the Zod schemas and database types.
2. Implement `analyzeProfile()` with a single structured LLM call and persist output.
3. Implement `runDate()` as a bounded alternating loop with separate agent prompts and per-turn persistence.
4. Implement `evaluateDate()` as one structured call; validate output and compute the mutual score in code.
5. Connect the profile page, transcript page, and ranking page to persisted records.
6. Seed the demo with consenting participants and known source provenance.
7. Test the acceptance criteria, then record the real date flow for the demo video.

## 13. Done definition

The agent system is demo-ready only when:

- A profile analysis is generated from permitted input and shows its evidence and unknowns.
- Two separate agent contexts produce an actual alternating conversation visible in the UI.
- The evaluator returns both directional assessments and identifies trade-offs as well as positive signals.
- A deterministic, saved mutual score appears in a per-participant ranking.
- Data survives refresh, failures are visible, and non-consenting records are excluded.
- The screen recording shows the real running behaviour, not a fabricated transcript.
