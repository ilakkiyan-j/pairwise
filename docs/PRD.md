# Pairwise — Product Requirements Document (PRD)

> **Tagline:** Let your agents meet before you do.
>
> **Document status:** MVP specification  
> **Version:** 1.0  
> **Build constraint:** 3-hour prototype  
> **Product status:** Planned requirements; implementation status must be verified in the running application.

## 1. Product summary

Pairwise is an agentic matchmaking prototype where each consenting participant is represented by an AI agent. Pairwise uses permitted content associated with the participant's LinkedIn profile and public Instagram profile to create an evidence-backed profile. Two distinct agents then hold a simulated dating conversation on their participants' behalf. After the conversation, the product evaluates both sides and presents transparent compatibility rankings with explanations.

The MVP is successful when a reviewer can add a participant, inspect their analysis, watch two agents actually converse, and view explainable rankings in a working deployed website.

## 2. Problem statement

Traditional matchmaking tools often ask users to complete long questionnaires and provide limited visibility into why a suggested match appears. Pairwise explores a more inspectable workflow: create a structured profile from permitted source material, let independent agents explore compatibility through conversation, and show the evidence and trade-offs behind each recommendation.

## 3. Goals and success criteria

### Product goals

1. Make the complete path—from participant input to analysis, agent date, and rankings—work end to end.
2. Show useful profile insights with source provenance and uncertainty, not unsupported personality claims.
3. Demonstrate a genuine agent-to-agent interaction with alternating model-generated turns.
4. Give each participant an explainable ranking of eligible candidates.
5. Make the demo reproducible and the application usable after deployment.

### MVP success criteria

- A seeded demo contains at least 25 real, consenting participants, each with a LinkedIn URL, a public Instagram URL, and permitted source content. Synthetic profiles must be labeled and must not be counted toward this requirement.
- A reviewer can open a participant profile and see the generated analysis, evidence, and unknowns.
- A reviewer can initiate a date between two agents and watch their saved alternating conversation turns.
- A reviewer can open a participant's ranking page and inspect scores, match explanations, and links to profile analyses and date transcripts.
- Adding a participant, generating results, refreshing the page, and revisiting saved results works in the deployed application.
- The three-minute demonstration shows the actual deployed workflow and accurately identifies any precomputed demo results.

## 4. Target users

### Primary: participant

A person who explicitly opts in to create an AI-assisted matchmaking profile and wants to understand potential matches and the reasons behind them.

### Secondary: evaluator / demo reviewer

A reviewer who wants to explore the product, add permitted profile references, inspect analysis quality, watch agent interactions, and test rankings.

### Internal: demo operator

The project team member who seeds the sample dataset, checks source availability and consent, monitors model errors, and prepares the walkthrough.

## 5. Core user journey

1. Open Pairwise and view the seeded demo or choose **Add participant**.
2. Enter the participant's name, LinkedIn profile URL, public Instagram profile URL, and required consent confirmation.
3. Provide source content through a permitted method. Pairwise must not bypass access controls or rely on unauthorized scraping. The two official URLs are stored as source references.
4. Run profile analysis and open the resulting profile page.
5. Inspect interests, hobbies, lifestyle, explicitly stated goals and preferences, evidence, confidence, and unknowns.
6. Choose two eligible participants and run a simulated date between their separate agents.
7. Watch the alternating transcript and inspect the separate post-date evaluations.
8. Open a participant's rankings, compare candidates, inspect score factors, and follow a result back to its evidence and date transcript.
9. Reopen saved results after a refresh.

## 6. Functional requirements

Priority definitions: **P0** = essential to pass the demo; **P1** = important if time permits; **P2** = post-MVP.

### FR-1: Participant onboarding — P0

- The form must accept a participant display name, LinkedIn URL, public Instagram URL, source content or a permitted source-ingestion result, and explicit consent.
- Validate required fields and reject malformed URLs with an actionable error.
- Prevent accidental duplicate records using a reasonable URL-based duplicate check.
- Persist the two official URLs and source provenance alongside the participant record.
- Support adding a participant without editing code.
- If source content cannot be accessed, show a useful error or prompt for participant-provided content. Never invent content to complete an analysis.

**Acceptance criteria**
- Valid participant input can be saved and reopened.
- Invalid URLs, missing consent, and duplicate submissions produce clear validation feedback.
- A participant record retains both profile URLs.

### FR-2: Source provenance and consent — P0

- The app must clearly state why consent is requested and what analysis will be generated.
- Only analyze people who have opted in to dating-oriented profiling.
- Use only participant-provided text, authorized APIs/connectors, or another access method permitted by the relevant service.
- Do not bypass authentication, access controls, rate limits, or platform restrictions.
- Store source type and relevant provenance for every evidence item.
- Offer a way for the operator to remove a participant and their generated results during the MVP, even if implemented as a documented admin/development action.

**Acceptance criteria**
- There is a visible consent confirmation at onboarding.
- Findings can be traced to permitted source content.
- The interface distinguishes source URLs from content that has actually been retrieved or supplied.

### FR-3: Profile analysis — P0

The analysis must be generated from the available, permitted content and returned in a validated structured format. It should include:

- Interests and hobbies.
- Lifestyle and activity preferences explicitly supported by evidence.
- Communication preferences when evidenced or directly provided.
- Relationship goals and dating preferences only when explicitly supplied for that purpose.
- Potential needs or preferences, clearly labeled as participant-stated, evidence-supported interpretation, or unknown.
- Evidence items that identify the source, short supporting excerpt or factual basis, and confidence.
- Unknowns and follow-up questions that cannot be answered from the available sources.

**Guardrails**

- Do not infer sexuality, relationship status, health, religion, political views, or other sensitive traits from unrelated content.
- Do not assume that professional interests imply relationship intent.
- Separate observable/stated information from model interpretation.
- Avoid presenting inferred needs as verified facts.

**Acceptance criteria**
- A successful analysis is saved and visible on the participant profile page.
- Each substantive finding has supporting provenance or is explicitly labeled as a low-confidence interpretation.
- Missing information is shown as unknown rather than silently guessed.
- Invalid model output produces a recoverable error rather than a broken profile.

### FR-4: Participant profile page — P0

Each profile page must show:

- Participant name and analysis status.
- Links to the LinkedIn and public Instagram profiles.
- Interests, hobbies, lifestyle, preferences, and goals available from permitted evidence.
- Evidence/provenance details and confidence labels.
- Unknowns and questions needing participant confirmation.
- Actions to re-run analysis, start a date with another eligible participant, and open rankings.

**Acceptance criteria**
- A reviewer can navigate from the participant directory to a profile and back.
- The page distinguishes analyzed content from unknown information.
- A loading state and a useful failure state are visible during analysis.

### FR-5: Agent-to-agent dating — P0

- Each participant must have a distinct agent context grounded in that participant's saved profile and stated preferences.
- Agent A and Agent B must be called separately and take turns. One model response must not simulate both sides of the conversation.
- Both agents must represent their participant's interests, ask relevant questions, explore possible compatibility and differences, and be permitted to conclude that the match may be weak or uncertain.
- The conversation should explore shared interests, lifestyle, expectations, communication, and at least one possible point of friction where relevant.
- Persist every message with the date ID, agent/speaker ID, turn order, content, and status.
- Save separate post-date evaluations for each side, followed by a mutual evaluation.
- Clearly label the interaction as an AI-simulated conversation, not a real human date.

**Minimum demo behaviour**
- Show at least four alternating, model-generated turns; six to eight is preferred if latency allows.
- Show a visible progress/loading state and recover gracefully if a model request fails.
- Persist the transcript so the reviewer can open it after the date completes.

**Acceptance criteria**
- A live run creates alternating turns from two separate agent contexts.
- The transcript is saved and re-openable.
- Both directional evaluations and the combined result are saved.
- The system does not force every date to end in a high compatibility score.

### FR-6: Compatibility scoring and rankings — P0

- Each eligible participant receives a ranked list of other eligible participants.
- A ranking result includes rank, mutual compatibility score, score-factor breakdown, reasons, possible friction points, unresolved questions, and links to relevant profiles and date results when available.
- Combine directional evaluations from both agents so a match is not scored from only one person's perspective.
- Do not use sensitive traits as scoring factors.
- Missing data must be excluded or handled transparently; it must not automatically count as incompatibility.
- The UI must describe scores as estimates based on limited evidence, not guarantees of relationship success.

Initial configurable scoring weights:

| Dimension | Starting weight |
|---|---:|
| Stated relationship goals and expectations | 30% |
| Lifestyle and explicitly stated values | 25% |
| Shared interests and activities | 20% |
| Communication preferences | 15% |
| Simulated-date evaluation | 10% |

For a pair A and B, calculate mutual compatibility as:

```text
mutual_score(A, B) = 0.5 * score(A evaluating B)
                   + 0.5 * score(B evaluating A)
```

The weighted dimensions are used inside each directional score. The implementation must document the treatment of missing factors and normalize the score consistently.

**Acceptance criteria**
- A ranking page displays results in descending score order with ties handled deterministically.
- Every displayed match has an understandable rationale and score breakdown.
- A user can open the relevant profile and any available date transcript from the ranking result.
- Recalculating rankings updates the stored results consistently.

### FR-7: Demo dataset and seeded state — P0

- Provide a repeatable seed/import method for the 25-person demo.
- Every person counted as real must be a consenting participant with both official URLs and permitted source content.
- Clearly label synthetic development fixtures and exclude them from claims about the real-person requirement.
- Demo records must not silently overwrite real participant data.
- Precomputed analysis or rankings may be used to make the walkthrough reliable, but the UI or demo narration must not falsely present them as a newly executed model run.
- At least one demonstrable agent date must have a transcript traceable to an actual model run.

**Acceptance criteria**
- The demo can be restored from documented seed data.
- Records have an explicit status such as `demo`, `synthetic`, or `participant` where needed.
- A reviewer can identify a seeded result versus a newly generated result.

### FR-8: Persistence and error handling — P0

- Persist participant records, source references, analyses, date transcripts, evaluations, and rankings.
- Refreshing the browser must not discard completed results.
- Display loading, success, empty, and error states for the primary workflow.
- Provide a retry path for transient model or database errors.
- Do not expose provider API keys in client-side code or commit secrets to the repository.

**Acceptance criteria**
- A participant, analysis, completed date, and ranking survive a refresh.
- API failures return clear, non-sensitive errors.
- The app remains navigable if an analysis or date fails.

### FR-9: Deployment and repository — P0

- Deploy the working website to a public demo URL.
- Maintain a public GitHub repository with source code, setup instructions, `.env.example`, and a clear statement of what is and is not implemented.
- Ensure the demo opens into a usable seeded state without requiring the evaluator to assemble the initial dataset manually.
- Keep private credentials in server-side environment variables.

**Acceptance criteria**
- A fresh clone can be configured using documented steps.
- The public demo supports the core user journey.
- The code repository contains no live API secrets.

## 7. Non-functional requirements

### Reliability

- One failed model call must not corrupt previously saved data.
- Model output must be schema-validated before it is stored or rendered as structured data.
- Long-running actions need an explicit in-progress state and a clear failure state.

### Performance

- Load existing profile, date, and ranking pages without making new model calls.
- Avoid unnecessary re-analysis and repeat scoring during ordinary navigation.
- For the demo, prioritize predictable interaction over parallel calls that make the agent transcript hard to follow.

### Usability and accessibility

- Use responsive layouts for common desktop and mobile widths.
- Use readable contrast, clear labels, keyboard-accessible controls, and descriptive button text.
- Make empty, loading, and error states understandable without inspecting developer tools.

### Privacy and security

- Store only the information required for the MVP and its declared purposes.
- Restrict service-role keys and model-provider credentials to server-side code.
- Validate and bound incoming text and URLs; apply reasonable limits to model-call length and frequency.
- Provide a practical deletion mechanism for participant records and their generated outputs.
- Do not expose private agent notes to another participant. The date transcript and summary intended for display must be separated from private directional evaluations as appropriate.

## 8. Explicit non-goals for the three-hour MVP

- Unauthorized scraping or bypassing LinkedIn/Instagram access restrictions.
- Inferring romantic intent or creating dating evaluations for people who have not opted in.
- Human-to-human messaging, scheduling real dates, payments, subscriptions, or notifications.
- Complex authentication, social login, production moderation workflows, or a distributed agent orchestration platform.
- Training a custom model, building a vector database, or implementing long-term agent memory.
- Claiming that a simulated date predicts real-world relationship success.

## 9. Required pages and interfaces

| Page / component | Required behaviour |
|---|---|
| Home / demo dashboard | Explain the product, show seeded participants, and provide actions to add a person, view rankings, or launch a demo date. |
| Add participant | Capture required fields, source URLs, consent, and permitted source content or ingestion status. |
| Participant directory | Search or browse saved people and see analysis status. |
| Participant profile | Show source links, structured analysis, provenance, unknowns, and next actions. |
| Date view | Start or reopen an agent date, show alternating live/saved messages, progress, errors, and the evaluation summary. |
| Rankings view | Show ordered candidates, mutual scores, score breakdowns, rationale, uncertainty, and links to profiles/dates. |

## 10. Minimum data model

Exact columns can follow the database implementation, but the following entities and relationships are required:

- **Participant:** ID, display name, LinkedIn URL, public Instagram URL, consent status/time, record type/status, creation/update times.
- **Source content:** participant ID, source type, access/provision method, content or permitted excerpt, provenance metadata, retrieval/provision time.
- **Profile analysis:** participant ID, structured analysis JSON, evidence items, unknowns, model/version metadata, status, creation time.
- **Agent date:** participant A ID, participant B ID, run status, start/completion times, public transcript, error state.
- **Date message:** date ID, agent ID, turn order, message content, creation time.
- **Agent evaluation:** date ID, evaluated participant, directional score, factor scores, reasons, friction points, unknowns.
- **Ranking result:** participant ID, candidate ID, score, rank, factor breakdown, rationale, date/analysis references, calculation version/time.

Avoid duplicating the full source text across unrelated records. Use IDs to connect records and preserve clear provenance.

## 11. API surface (suggested)

Route names may change to match implementation, but equivalent functions must exist:

| Route | Method | Purpose |
|---|---|---|
| `/api/people` | `GET` | List eligible participants. |
| `/api/people` | `POST` | Validate and create a participant. |
| `/api/analyze` | `POST` | Analyze permitted source content and save the profile. |
| `/api/dates` | `POST` | Create and run an agent-to-agent date. |
| `/api/dates/:id` | `GET` | Retrieve the saved transcript and evaluations. |
| `/api/rankings/:personId` | `GET` | Retrieve the participant's ranked candidates. |
| `/api/rankings` | `POST` | Recalculate and save rankings. |

All endpoints must validate inputs, handle model/provider errors, and avoid returning credentials or private evaluation details that are not intended for the requester.

## 12. Three-minute demo requirements

The final walkthrough must be no longer than three minutes and use the actual deployed app.

1. **0:00–0:25 — Profiles:** show the 25-person seeded demo, both source links for a participant, and one complete profile analysis with evidence and unknowns.
2. **0:25–0:45 — Onboarding:** enter a LinkedIn URL and public Instagram URL, supply permitted source content, submit, and show the resulting analysis flow.
3. **0:45–1:50 — Agent date:** run two separate agents, show alternating generated turns, a follow-up question, a difference or trade-off, and the saved evaluations.
4. **1:50–2:35 — Rankings:** open one participant's list, explain the top score and one lower-ranked comparison, and open the corresponding profile/date evidence.
5. **2:35–3:00 — Delivery:** show the deployed URL and public repository and briefly explain the source-access method.

The video must not portray synthetic people as real, fabricated output as model-generated, saved results as a fresh run, or a simulated agent conversation as a human date.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Source pages cannot be accessed within the time limit | Use participant-provided text or a permitted source integration; communicate the actual ingestion method in the UI and demo. |
| LLM latency makes the live date too slow | Keep turns short, cap turn count, cache completed analyses, and use a seeded completed run as a clearly labeled fallback. |
| Model output is inconsistent | Validate structured JSON with Zod and retry a limited number of times. |
| Rankings look arbitrary | Show weighted factors, evidence, uncertainty, and both directional evaluations. |
| Demo data fails or gets overwritten | Use a reproducible seed script and keep demo fixtures separate from participant submissions. |
| Reviewers discover broken navigation or refresh loss | Reserve dedicated time for deployed end-to-end testing and persistence checks. |
| Privacy or consent is unclear | Require opt-in, support record deletion, minimize retained data, and do not profile non-consenting people for dating compatibility. |

## 14. Release gate

The MVP is ready to submit only when the following flow works on the deployed site:

**Add consenting participant → preserve both URLs and permitted source content → generate and reopen analysis → run two distinct agents → save and reopen the transcript and evaluations → compute and inspect rankings → refresh without losing results.**

If any step is not implemented, document it honestly in the README and avoid claiming that it works in the video. The core priority is a real, repeatable end-to-end demonstration—not the number of screens or the visual polish alone.
