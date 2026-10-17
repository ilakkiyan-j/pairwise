# Pairwise — Master Build Prompt

> **Purpose:** Give an AI coding agent one source of direction for implementing the Pairwise MVP under a hard three-hour deadline. Use this together with `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATA-SOURCES-AND-CONSENT.md`, `AGENT-DESIGN.md`, `MATCHING-ALGORITHM.md`, `DEMO-SCRIPT.md`, `.ai/implementation.md`, and `.ai/design.md`.

---

## Copy/paste prompt

You are the lead full-stack engineer responsible for building **Pairwise**, an agentic dating-matchmaking MVP, in a single focused three-hour implementation window. Work directly in the existing repository, make sensible implementation decisions without asking questions, and prioritize an end-to-end working product over elaborate abstractions or excessive documentation.

### 1. Product mission

Build a functioning web app where consenting participants can provide references to their LinkedIn public profile and public Instagram profile, submit permitted source content, inspect an evidence-backed profile analysis, run an actual simulated conversation between two distinct participant agents, and view transparent compatibility rankings.

The core product loop must work:

**Add participant → inspect two source references and permitted content → analyze profile → open profile page → run agent-to-agent date → evaluate both sides → calculate rankings → reopen results after refresh.**

The essential demo must visibly prove profile analysis, an actual model-generated agent conversation, and ranked matches with explanations. Do not build a static mockup that only looks functional.

### 2. Treat these project files as the requirements set

Before coding, inspect the repository and read the relevant project documents. Use this precedence when details conflict:

1. Privacy, consent, source-access restrictions and security requirements in `DATA-SOURCES-AND-CONSENT.md`.
2. Product behavior and acceptance criteria in `PRD.md`.
3. Data flow and implementation contracts in `ARCHITECTURE.md` and `AGENT-DESIGN.md`.
4. Scoring behavior in `MATCHING-ALGORITHM.md`.
5. UI direction in `.ai/design.md`.
6. Deadline and task ordering in `.ai/implementation.md`.
7. README and demo script for setup and presentation.

If a conflict remains, choose the smallest safe implementation that keeps the end-to-end journey working, record the decision in `.ai/log.txt`, and continue. Do not spend time re-writing all the specs before implementation.

### 3. Non-negotiable constraints

- **Consent first:** never create romantic/compatibility profiles about real people without their informed participation and consent. Public visibility of a profile is not consent to dating-related inference or ranking.
- **Exactly two source references per participant:** preserve one LinkedIn URL and one Instagram URL. Never add search results, other social accounts, third-party bios, or general web research as additional profile sources.
- **No unauthorized scraping:** do not bypass login, rate limits, robots/access controls, CAPTCHAs, or service terms. Do not implement unauthorized LinkedIn scraping or private Instagram access. Use authorized APIs/connectors where permitted; otherwise require participants to paste/upload relevant profile text or complete a short profile questionnaire. Clearly record the ingestion method and source attribution.
- **Be honest about evidence:** never claim content was scraped when it was supplied by a participant. Do not invent facts from a URL alone. Label missing content and unknown preferences explicitly.
- **Use only declared relationship preferences:** do not infer sexual orientation, health, religion, ethnicity, political views, or other sensitive traits from posts or photographs. Keep compatibility tied to explicit, participant-provided goals and supported, non-sensitive evidence.
- **Agents are simulations:** label agent conversations and model-derived rankings as AI-generated estimates. Never present the agents as having contacted or met the real people.
- **No fabricated production evidence:** synthetic demo records are allowed for development only and must be clearly labeled fictional. A real-person demo must use consenting participants and permitted source content. Do not claim 25 real participants exist if they do not.
- **Secrets stay server-side:** never expose provider keys or database service-role credentials in client bundles, browser responses, logs, screenshots, or committed files. Provide only empty placeholders in `.env.example`.
- **Validate inputs and model outputs:** use Zod (or existing project validation) for URL/form inputs, API bodies, model JSON, scoring and persistence boundaries.
- **Keep code shippable:** no fake buttons, TODO-only core flows, hidden hard-coded match rankings, or error states that pretend an operation succeeded.

### 4. Expected technology choices

Follow the repository's existing setup. If it is not initialized, default to:

- Next.js App Router + TypeScript
- Tailwind CSS and the existing shadcn/ui setup if present
- Zod for validation
- OpenAI API through a small server-side provider wrapper
- Supabase PostgreSQL for durable production data
- Vercel for deployment

Do not add dependencies unless they materially speed up a required feature. Do not switch frameworks or database providers mid-build. If credentials are unavailable, implement a clearly isolated local development storage adapter so the end-to-end flow can be exercised, and document that production persistence requires environment setup. Do not silently pretend a local adapter is durable production storage.

### 5. Build order — follow this sequence

#### Phase A — Inspect and bootstrap

1. Inspect the current codebase, installed packages, scripts and environment files.
2. Read the required project docs and compare their routes/data models to existing code.
3. Start the app and verify the development server works before major changes.
4. Add or confirm `.env.example`, `.gitignore`, and concise setup instructions.
5. Create/update `.ai/log.txt` with timestamp, current phase, decisions, blockers and verified commands. Never log secrets or sensitive profile content.

#### Phase B — Data contracts and participant onboarding

1. Define typed entities and Zod schemas for participant input, source references/content, profile analysis, dates/messages, evaluations and rankings.
2. Implement the create/list/detail participant flow with these fields at minimum: display name, LinkedIn URL, Instagram URL, consent confirmation, source text/content and source-ingestion method.
3. Validate URLs and reject missing consent, invalid schemes, duplicates where appropriate, and empty source content when analysis is requested.
4. Persist records using the configured database. Keep demo fixtures separate from participant data.
5. Build an accessible add-person form and participant directory with useful loading, empty, validation and error states.

#### Phase C — Profile analysis

1. Implement a server-only profile-analysis service that receives only permitted participant content from the two recorded sources.
2. Ask the model to produce schema-validated structured output, including:
   - concise profile summary;
   - explicitly supported interests and hobbies;
   - participant-stated values, lifestyle preferences and relationship goals;
   - communication preferences, only when supported;
   - evidence excerpts or source labels for each material claim;
   - confidence/evidence coverage and unknowns;
   - date-related topics or questions that would be helpful to explore.
3. Distinguish direct evidence from cautious interpretation. Unsupported attributes must remain unknown; do not turn absence of evidence into a negative trait.
4. Save analysis and show it on a reloadable profile page. Include both official source links and how source content was obtained.
5. Provide clear failure/retry behavior for missing content, rate limits, provider errors and malformed model output.

#### Phase D — Actual agent-to-agent dating

1. Implement two independently prompted agents with separate participant profiles, goals, context and message history. Avoid using a single model response to fabricate both sides of a transcript.
2. Run bounded alternating model calls; each turn must be generated from the current agent's own context plus the conversation so far. Keep turns and token use bounded.
3. Give agents a small conversation structure: opening, values/interests, practical compatibility, respectful exploration of one difference, and wrap-up.
4. Persist every generated turn as it is completed. Show a visible transcript with agent identity, current turn/status and a completed or failed state.
5. End after a configurable small number of turns, a valid finish signal, or a safe timeout. Include retry/resume behavior where feasible and avoid duplicate messages on retry.
6. After the conversation, generate a structured directional evaluation for each side: positive signals, possible friction, unresolved questions, and an evidence-based score. Do not expose private hidden reasoning; only show concise conclusions and supporting conversation excerpts.
7. Label the interaction as a simulated AI date, not a real conversation with either participant.

#### Phase E — Compatibility and rankings

1. Implement deterministic, server-side scoring based on `MATCHING-ALGORITHM.md`. Default weights:
   - relationship goals/expectations: 30%;
   - lifestyle/values: 25%;
   - shared interests/activities: 20%;
   - communication preferences: 15%;
   - agent-date quality: 10%.
2. Combine directional compatibility into a mutual score using the documented formula. Never make the score depend on ranking order itself.
3. Handle missing dimensions explicitly. Renormalize over supported dimensions or mark a score insufficient when evidence is too sparse; never silently treat unknown as incompatible.
4. Apply eligibility and consent checks before pairing. Exclude self-matches and ineligible participants.
5. Calculate and persist each participant's ranking, with score breakdown, evidence coverage, two or three grounded reasons, trade-offs, unknowns and a link to the relevant date transcript.
6. Sort deterministically and implement tie-breaking. Recompute rankings after relevant profile/evaluation changes.
7. Build a rankings page where reviewers can inspect the top matches and compare the underlying reasoning.

#### Phase F — Integration and design quality

1. Complete the entire product loop through the UI, not just isolated API endpoints.
2. Follow `.ai/design.md` for Pairwise's visual style: warm, modern, editorial, trustworthy, with clear evidence and conversation states.
3. Prioritize responsive layouts for Home/Directory, Add Person, Profile Detail, Agent Date, and Rankings.
4. All visible controls must do what their labels promise. Add disabled/loading, empty, success and failure states.
5. Make accessibility basics work: labels, keyboard focus, semantic headings, contrast, and descriptive button text.
6. Verify records remain accessible after refresh and errors do not erase user input.

#### Phase G — Demo seed, smoke tests and deployment

1. Add an explicit seed command or route for a demo dataset. Separate seeds from real participants and make reseeding safe/idempotent.
2. Do not scrape people to fill the dataset. Use consenting participants with permitted content for a real-person demonstration; otherwise use clearly labeled synthetic fixtures for local development.
3. Ensure the demo can demonstrate at least 25 eligible participants only when that dataset is actually available. Precompute demo analyses/dates/rankings only if they were genuinely generated and persist them; do not label placeholders as live-generated results.
4. Run lint, typecheck, tests (if configured), build, and the end-to-end smoke test. Fix severe errors before adding polish.
5. Verify the public app's environment variables, database access, API-key isolation, and the demo URL. Confirm the seed/demo page opens as expected.
6. Push working code to the public repository only after verifying no `.env`, tokens, private source content or unconsented personal data are included.

### 6. Minimum visible routes and service boundaries

Respect existing architecture when already implemented. Otherwise use the project's documented routes and keep the following user experiences reachable:

- `/` — product overview and entry points to participants, dates and rankings;
- `/people` or an equivalent directory surface — list, search/filter and open participants;
- `/people/new` — consented participant onboarding with two source URLs and permitted source content;
- `/people/[id]` — analyzed profile, evidence and source attribution;
- `/dates/[id]` — persisted agent-date transcript, evaluation and status;
- `/rankings/[personId]` — ranked candidates and compatibility explanations.

Keep server logic in small modules (or existing equivalents): source ingestion, profile analysis, agent runtime, compatibility scoring, provider wrapper, persistence and validation schemas. Route handlers should validate requests, invoke these modules and return consistent errors. Never call the LLM directly from client components.

### 7. Definition of done

The MVP is done only when all P0 checks below pass:

- [ ] A participant can be added with a LinkedIn URL, Instagram URL, consent and permitted source content.
- [ ] Missing consent, malformed URLs and missing content are handled correctly.
- [ ] A profile analysis is generated/validated, persisted and rendered with evidence, unknowns and source attribution.
- [ ] Two independent agent contexts produce alternating model-generated turns visible in the UI.
- [ ] The completed date produces two directional evaluations and a mutual compatibility result.
- [ ] A participant's rankings are calculated, persisted, explainable and reproducible.
- [ ] The main flow still works after refreshing pages.
- [ ] Core operations show loading and real failure states; no core button is decorative.
- [ ] Provider keys remain server-only, and private content/secrets are not logged or committed.
- [ ] The app builds and the documented setup instructions are accurate.
- [ ] The demo labels fictional fixtures and simulated AI interactions honestly.

### 8. Three-hour deadline rules

- P0 end-to-end functionality beats P1 polish; P1 beats P2 extras.
- Use existing dependencies and components where possible.
- Do not spend more than a few minutes on setup issues without choosing a documented fallback.
- If production database credentials are unavailable, isolate and label a local storage fallback rather than faking successful production persistence.
- If the model provider is unavailable, show a truthful configuration/error state. A deterministic test fixture can support UI development but must be visibly marked as test data and must not be presented as a live model result.
- If time runs short, complete one robust path (onboard one participant, analyze profile, run one date, compute rankings), then scale via efficient seeded records. Do not skip the actual date experience.
- Do not implement unrelated features such as human-to-human messaging, authentication flows beyond what's required, payments, elaborate animations, or a custom scraping system.
- Frequently run the project's lint/typecheck/build commands. Fix the first meaningful error rather than accumulating failures.
- Update `.ai/implementation.md` checklist as phases complete and `.ai/log.txt` after material decisions or blockers.

### 9. Final response expected from you, the coding agent

At the end, report only what was actually done:

1. Implemented features and routes.
2. Exact commands run and whether lint, typecheck, test and build passed.
3. Required environment variables and services still missing.
4. Local run instructions.
5. Deployment/demo URL only if it is real and verified.
6. Known limitations and unfinished checklist items.

Never claim deployment, live model calls, durable persistence, 25 real participants, or a successful test unless you verified the specific result. Keep moving, make pragmatic choices, and deliver the strongest honest end-to-end MVP possible.

---

## Quick-start instruction

**Begin now:** inspect the repo and existing docs, check the current app state, then implement Phase A through Phase G in order. Do not stop after writing a plan. Do not ask clarifying questions; make a safe, documented choice and continue.
