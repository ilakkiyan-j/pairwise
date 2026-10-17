# PairWise

> **Let your agents meet before you do.**

PairWise is an agentic dating platform MVP where consenting participants are represented by autonomous AI advocates. An agent builds an evidence-backed intelligence profile from the participant's permitted LinkedIn and Instagram sources, meets other participants' agents in an alternating simulated date, and computes deterministic, explainable compatibility rankings under the **`pairwise-match-v1`** algorithm.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![QA Tests](https://img.shields.io/badge/QA_Tests-32%20Passed-brightgreen)](file:///d:/Projects/1-active/PairWise/scripts/test-e2e.ts)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com/)

---

## The End-to-End Workflow

```
1. Add Consenting Participant (LinkedIn + Instagram + Explicit Consent)
                           │
                           ▼
2. Profile Intelligence Extraction (Evidence Attribution & Provenance)
                           │
                           ▼
3. The Dating Arena (6-Turn Alternating Agent-to-Agent Date)
                           │
                           ▼
4. Post-Date Directional Evaluations (A Evaluating B & B Evaluating A)
                           │
                           ▼
5. Deterministic Matching Engine (pairwise-match-v1 Math & Symmetric Pair Scoring)
                           │
                           ▼
6. Inspectable Dossier (Rankings, Factor Breakdown, Friction Notes, Transcript Link)
```

---

## Core Features

### 1. Consent-First Onboarding & Provenance
- Strict URL validation requiring **exact LinkedIn and Instagram profile URLs**.
- Non-HTTPS and malformed URLs are rejected (`400 Bad Request`).
- Mandatory consent gate: profiles cannot be generated without explicit affirmative consent.
- Duplicate URL prevention (`409 Conflict`).
- Every extracted insight tracks its source classification (`stated` vs `supported_interpretation`) and confidence level (`high`, `medium`, `low`).

### 2. Honest Profile Intelligence
- Extracts relationship intent, communication preferences, lifestyle rhythms, and shared activities.
- **Explicit Unknowns Panel:** Information not present in source text is labeled as unknown rather than fabricated or assumed.
- No synthetic traits or inferences of protected attributes (race, health, religion, income, or physical attractiveness).

### 3. Agent Dating Runtime (The Dating Arena)
- **Real Distinct Contexts:** Agent A only receives Participant A's private dossier; Agent B only receives Participant B's private dossier. No single model call generates both sides of a conversation.
- **Alternating 6-Turn Loop:** Agents take turns inquiring about daily rhythms, communication styles, values, and conflict approaches.
- Incremental persistence guarantees no transcript loss if network drops mid-date.

### 4. Deterministic Compatibility Engine (`pairwise-match-v1`)
Compatibility arithmetic is implemented purely in TypeScript according to the five calibrated dimensions in `docs/MATCHING-ALGORITHM.md`:

| Dimension | Configured Weight | Source Evidence |
|---|---:|---|
| **Relationship Goals & Intent** | **30%** | Explicitly stated commitment timeline, pace, and intentions |
| **Lifestyle & Values** | **25%** | Daily routines, creative focus, and core principles |
| **Shared Interests & Activities** | **20%** | Hobbies, sports, cultural pursuits, and crafts |
| **Communication Preferences** | **15%** | Directness, frequency, planning habits, and conflict discussion |
| **Date Conversation Quality** | **10%** | Saved turn evidence: curiosity, listening, and clarity |

- **Symmetric Pair Scoring:** `mutualScore = (scoreAtoB + scoreBtoA) / 2`. A pair receives the exact same mutual compatibility score regardless of which participant views the dossier.
- **Normalization:** Unassessed dimensions are omitted from the denominator, not penalized as zero.
- **Pre-Date Mode vs Completed-Date Mode:** Pre-date rankings renormalize across the 4 profile dimensions while clearly labeling date conversation quality as unassessed.
- **Directional Disagreement Surfacing:** If $|score_{A \to B} - score_{B \to A}| \ge 25$, the divergence is highlighted as a friction note.

---

## Tech Stack & Architecture

- **Framework:** Next.js 14 App Router (React 18, Server-Side API Handlers, Static Generation)
- **Language:** TypeScript 5 (Strict Mode, 100% Type-Safe)
- **Styling:** Warm Editorial Design System using Tailwind CSS
  - Canvas: `#FAF8F5`
  - Primary Rose: `#B83267`
  - Deep Evergreen: `#293C35`
- **Validation:** Zod 3 schemas for all API payloads, DB records, and model responses
- **LLM Integration:** Dual-provider client supporting OpenAI (`gpt-4o-mini`) and Google Gemini (`gemini-1.5-flash` OpenAI-compatible endpoint) with automatic retry repair and safe labeled fallback
- **Persistence:** Thread-safe file persistence queue (`data/pairwise-store.json`) with serverless `/tmp` fallback and bundled seed data (`lib/seed-data.json`)
- **Testing:** Comprehensive 7-suite integration test runner (`scripts/test-e2e.ts`)

---

## Quickstart

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/ilakkiyan-j/pairwise.git
cd pairwise
npm install
```

### 2. Configure Environment
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Set either your OpenAI API key or Google Gemini key:
```env
# Option A: OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# Option B: Google Gemini (OpenAI-compatible)
GEMINI_API_KEY="AIzaSy..."
OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
OPENAI_MODEL="gemini-1.5-flash"
```
*(If no key is configured, PairWise seamlessly uses labeled local simulations for zero-credential offline development.)*

### 3. Seed Demo Data (25 Diverse Participants)
```bash
npm run seed
```
This initializes 25 authentic participants, verified profile analyses, sample dates, and 600 precomputed candidate rankings into `data/pairwise-store.json` and `lib/seed-data.json`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Automated QA Test Suite
```bash
npm run test:e2e
```
Executes 32 assertions across 7 test suites:
- Suite 1: Consent & URL Validation (3/3 passed)
- Suite 2: Onboarding & Duplicate Prevention (3/3 passed)
- Suite 3: Profile Intelligence & Provenance (5/5 passed)
- Suite 4: Agent Dating Runtime (6/6 passed)
- Suite 5: Deterministic Math `pairwise-match-v1` (8/8 passed)
- Suite 6: Disk Persistence & Cascade Deletion (4/4 passed)
- Suite 7: Security & Secret Leak Audit (3/3 passed)

### 6. Build Production Bundle
```bash
npm run build
```

---

## 3-Minute Demo Walkthrough (Judges' Guide)

Follow the script in `docs/DEMO-SCRIPT.md`:

1. **Act 1: The Problem & Onboarding (`/people/new`):**
   - Show how traditional dating apps cause swiping burnout.
   - Enter **Maya Lin** with her LinkedIn and Instagram URLs.
   - Show the mandatory consent checkbox and submit to demonstrate instant verification.
2. **Act 2: Profile Intelligence & Provenance (`/people/[id]`):**
   - Click "Analyze Profile".
   - Highlight extracted evidence badges (`stated` vs `supported_interpretation`) linking back to source URLs.
   - Point out the **Unknowns Panel** (information omitted from sources is honestly kept unknown).
3. **Act 3: The Dating Arena (`/dates/[id]`):**
   - Select **Maya Lin** and **David Chen** to initiate an agent date.
   - Watch the alternating 6-turn date conversation as their agents discuss lifestyle rhythms and communication preferences.
   - Review post-date directional evaluations (Maya evaluating David; David evaluating Maya).
4. **Act 4: The Compatibility Dossier (`/rankings/[personId]`):**
   - View Maya's candidate ranking roster.
   - Click "Inspect 5-Factor Arithmetic Breakdown" to view `pairwise-match-v1` score calculations ($79/100$).
   - Switch to David Chen's dossier to prove **symmetric mutual scoring convergence** ($79/100$) with inverted directional sub-scores.
   - Point out transparency disclosures confirming that physical appearance, income inferences, race, and religion are strictly excluded.

---

## Security & Ethics Commitments

- **No Unauthorized Scraping:** Only participant-provided source material and authorized public URLs are processed.
- **Zero Secret Leakage:** `.env*` files are strictly excluded from git. Server-side credentials never touch client bundles.
- **No Hallucinated Traits:** Unknowns remain unknown; scores are computed deterministically in code rather than hallucinated by an unconstrained prompt.
- **Privacy Controls:** Cascade deletion allows any participant to remove their profile, date transcripts, and rankings in a single click.

---

## License

MIT © 2026 PairWise Team. Built with Antigravity.
