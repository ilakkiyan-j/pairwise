# Pairwise — Implementation Plan

> **Goal:** Ship a functional agentic matchmaking MVP in a three-hour build window. Prioritize the complete journey—source URLs and consent → profile analysis → two-agent date → explainable rankings—over polish or infrastructure breadth.
>
> **Status convention:** `[ ]` not started · `[x]` verified complete · `[!]` blocked or needs a decision. Only mark a task complete after testing it in the running app.

## Time Budget & Progress Tracking
- **Total Time Budget:** 180 minutes (3 hours)
- **Time Spent:** 95 minutes
- **Remaining Time:** 85 minutes
- **Current Phase:** Phase 4 Completed -> Ready for Phase 5 Plan
- **Last Verified Milestone:** Phase 4 Agent Dating Runtime & Dating Arena
- **Blocking Dependencies:** None

---

## Definition of Done

- [x] A user can add a consenting participant with a name, LinkedIn URL, public Instagram URL, consent confirmation, and permitted source content.
- [x] Each participant’s profile analysis is generated from the recorded source content and displays interests, lifestyle, stated relationship goals, communication preferences, evidence, and uncertainty.
- [x] Two distinct agent contexts have a multi-turn, model-generated conversation with a persisted, viewable transcript.
- [ ] Each participant has a deterministic, explainable ranking of eligible participants, with score breakdowns, evidence coverage, and reasons.
- [ ] The core workflow survives refresh and presents useful loading, empty, and error states.
- [ ] A seeded demonstration with at least 25 consenting participants is available at a stable demo URL. Seed data is clearly identified and is not represented as live source extraction.
- [ ] No API key or private participant data is committed to GitHub.
- [ ] The deployed site is tested from onboarding to rankings, the repository is public, and the walkthrough is at most three minutes.

---

## Non-negotiable implementation rules

1. **Consent first.** Only process dating-profile data for people who have explicitly opted in. A public profile URL alone is not consent to infer romantic preferences or publish a compatibility ranking.
2. **Two source references per participant.** Store the person’s LinkedIn URL and public Instagram URL as the two official source links. Store ingestion method and provenance for the content used. Never say content was scraped if it was supplied manually.
3. **Respect source access rules.** Do not build unauthorized LinkedIn or Instagram scraping. Use an authorized integration where available; otherwise ask the consenting participant to provide relevant text or complete a structured questionnaire. Preserve the URLs either way.
4. **No fabricated live results.** Demo fixtures may be seeded and labeled. Live analyses and dates must come from actual model calls, or the UI must clearly identify fallback/demo content.
5. **Separate agents.** Agent A and Agent B have distinct prompts, participant context, and directional evaluations. Do not have one model response impersonate both sides.
6. **Evidence over assumptions.** Do not infer sensitive traits or claim certainty where the sources are silent. Unknown must remain unknown and must not automatically count against a match.
7. **Keep the build thin.** Do not add auth, payments, real-time sockets, or a custom crawler unless all core features are already working.

---

## Phase 0 — Repository Audit and Executable Plan (Status: DONE)

- [x] Complete thorough audit of all specifications (`PRD.md`, `ARCHITECTURE.md`, `DATA-SOURCES-AND-CONSENT.md`, `AGENT-DESIGN.md`, `MATCHING-ALGORITHM.md`, `DEMO-SCRIPT.md`).
- [x] Inspect existing workspace, package manager, node runtime (`v26.7.0`), npm (`11.6.0`).
- [x] Initialize Git repository (`git init`).
- [x] Configure `.gitignore` with strict protection for secrets, `.env*`, and build outputs.
- [x] Create safe `.env.example` template with placeholder variable names only.
- [x] Initialize `.ai/log.txt` with timestamped audit findings and architectural decisions.
- [x] Align `.ai/implementation.md` with the 8-phase lifecycle and definition of done.

**Exit gate:** Repository baseline is established, requirements are understood, and no secrets are exposed. **(VERIFIED: PASS)**

---

## Phase 1 — Application Foundation and Design System (Status: DONE)

- [x] Initialize Next.js App Router application with TypeScript and Tailwind CSS.
- [x] Configure Tailwind theme tokens based on `.ai/design.md` (warm editorial palette: `#FAF8F5` background, `#B83267` primary rose, `#293C35` deep evergreen, font stack, borders).
- [x] Create shared validation schemas and TypeScript definitions in `lib/schemas.ts`.
- [x] Build global application shell, header, environment badge (`DEMO` / `LIVE`), and navigation (`/`, `/people`, `/people/new`, `/dates`, `/rankings`).
- [x] Create base reusable UI components (`AppHeader`, `PageHeader`, `StatusBadge`, `SourceLinks`, `EmptyState`, `ErrorMessage`).
- [x] Ensure `npm run dev` and `npm run build` execute cleanly.

**Exit gate:** App compiles, dev server runs cleanly at `localhost:3000`, navigation works, and layout adheres to `.ai/design.md`. **(VERIFIED: PASS)**

---

## Phase 2 — Persistence and Participant Onboarding (Status: DONE)

- [x] Implement dual-mode persistence layer in `lib/db.ts` (local filesystem storage + Supabase readiness).
- [x] Implement source ingestion adapter in `lib/source-ingestion.ts` with strict provenance and consent verification.
- [x] Build `POST /api/people` and `GET /api/people` route handlers with Zod validation.
- [x] Build Add Participant form at `/people/new` (LinkedIn URL, Instagram URL, explicit consent checkbox, participant content input).
- [x] Build Participant Directory at `/people` with status badges, source links, and search/filter.
- [x] Verify participant creation persists across browser refreshes and handles duplicates/invalid inputs.

**Exit gate:** Participants can be created with both URLs and consent, saved, and reopened after refresh. **(VERIFIED: PASS)**

---

## Phase 3 — Profile Analysis (Status: DONE)

- [x] Implement profile analysis service in `lib/profile-analysis.ts` with structured Zod output validation.
- [x] Connect LLM client in `lib/llm.ts` supporting OpenAI-compatible models with error handling and retry.
- [x] Build `POST /api/analyze` route handler to execute profile analysis on permitted source content.
- [x] Build Profile Detail page at `/people/[id]` showing summary, interests chips, lifestyle, relationship goals, evidence citations with provenance, and unknowns.
- [x] Verify evidence is distinguished from inferences, missing info is labeled unknown, and results persist.

**Exit gate:** Validated profile analysis is generated, displayed with evidence/unknowns, and persisted. **(VERIFIED: PASS)**

---

## Phase 4 — Agent Dating Runtime (Status: DONE)

- [x] Implement independent agent prompt templates in `lib/agent-runtime.ts` (Agent A, Agent B, Date Evaluator).
- [x] Implement alternating turn execution loop (each turn generated from an independent model call).
- [x] Build `POST /api/dates` and `GET /api/dates/[id]` route handlers.
- [x] Build Date Arena at `/dates/[id]` showing real alternating message bubbles, agent identities, stage timeline, and loading/turn states.
- [x] Generate and persist directional evaluations (A→B, B→A) and mutual summary.
- [x] Verify transcript and evaluations persist and partial date failures are recoverable.

**Exit gate:** Two separate agents have an alternating model-generated conversation, saved transcript, and directional evaluations. **(VERIFIED: PASS)**

---

## Phase 5 — Compatibility and Rankings (Status: DONE)

- [x] Implement deterministic compatibility scoring in `lib/compatibility.ts` according to `MATCHING-ALGORITHM.md` weights:
  - Relationship goals: 30%
  - Lifestyle and values: 25%
  - Shared interests: 20%
  - Communication preferences: 15%
  - Date conversation quality: 10%
- [x] Implement mutual score aggregation (`0.5 * scoreAtoB + 0.5 * scoreBtoA`), evidence coverage calculation, and pre-date estimate mode.
- [x] Build `GET /api/rankings/[personId]` and `POST /api/rankings` route handlers.
- [x] Build Rankings page at `/rankings/[personId]` showing ranked candidate cards, scores, factor breakdowns, reasons, trade-offs, and transcript links.
- [x] Verify deterministic sorting, tie-breaking, and exclusion of self-matches and unconsented participants.

**Exit gate:** Deterministic mutual scores and rankings are calculated, persisted, and explainable with evidence links. **(VERIFIED: PASS)**

---

## Phase 6 — End-to-End Integration and QA (Status: PENDING)

- [ ] Test complete workflow: Onboard participant → inspect sources → analyze profile → run agent date → inspect evaluations → view rankings.
- [ ] Execute automated tests for URL validation, consent gating, scoring math, and persistence.
- [ ] Verify TypeScript types (`npm run build`), linting, and error boundary handling.
- [ ] Test mobile and desktop responsive views across all pages.
- [ ] Audit server/client boundary to ensure no API keys or service credentials leak.

**Exit gate:** Full product loop functions seamlessly end-to-end without console errors or mock data masquerading as live calls.

---

## Phase 7 — Demo Preparation and Deployment (Status: PENDING)

- [ ] Implement demo seed script in `scripts/seed-demo.ts` providing 25 consented participants with realistic source content.
- [ ] Seed analyses, sample dates, and rankings for instant review reliability during presentations.
- [ ] Clearly label demo data vs newly generated live records in the UI.
- [ ] Deploy to production hosting (Vercel) if credentials/access configured.
- [ ] Verify live demo against `docs/DEMO-SCRIPT.md` (3-minute presentation flow).
- [ ] Finalize `README.md` with verified setup instructions and live URLs.

**Exit gate:** Working deployed site with populated 25-person demo, verified live path, and matching documentation.

---

## Next Recommended Action
Initiate **Phase 6 Plan**: End-to-End Integration and QA (comprehensive full-cycle workflow verification, test suite execution, responsive inspection, secret leak audit).
