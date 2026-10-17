# Pairwise

> **Let your agents meet before you do.**

Pairwise is an agentic matchmaking prototype where each consenting participant is represented by an AI agent. The agent builds an evidence-backed profile from the participant's permitted LinkedIn and public Instagram source material, meets other participants' agents in a simulated date, and helps produce explainable compatibility rankings.

**Status:** MVP in development. This README describes the intended MVP architecture; it does not claim that features are already implemented.

## What it does

1. **Add participants** — enter a participant's LinkedIn URL and public Instagram URL, confirm consent, and provide source content through a permitted access method.
2. **Analyze a profile** — extract stated interests, hobbies, lifestyle, communication preferences, relationship goals, needs, evidence, confidence, and unanswered questions.
3. **Run agent dates** — let two separately prompted agents hold an alternating, model-generated conversation on behalf of their respective participants.
4. **Rank compatibility** — combine profile-based compatibility with each agent's post-date evaluation, then display ranked candidates and understandable reasons.
5. **Inspect the evidence** — view the two source links, analyzed profile, conversation transcript, scoring breakdown, and uncertainties behind a match.

## Product principles

- **Consent first.** Dating profiles and romantic compatibility assessments are created only for participants who have opted in. Public visibility is not, by itself, consent to romantic profiling.
- **Two source references per participant.** The intended inputs are the participant's LinkedIn profile and public Instagram profile. Pairwise stores those official URLs and records the provenance of content used in analysis.
- **No unauthorized scraping.** A URL is not permission to bypass a site's access controls or terms. Use participant-provided profile text, authorized APIs/connectors, or another access method permitted by the relevant service. If source content is unavailable, show that limitation rather than inventing profile details.
- **Evidence over guesses.** Separate stated facts from model interpretations, attach supporting evidence where possible, and label unknown information as unknown.
- **Mutual, explainable matching.** Scores are estimates, not guarantees of relationship success. Show the factors that influenced a ranking and avoid treating missing information as a definite mismatch.
- **Real agent conversations.** The visible date transcript must come from alternating calls with two distinct agent contexts—not a single model response dressed up as a conversation.

## MVP tech stack

| Layer | Choice | Role |
|---|---|---|
| Web app | Next.js App Router + TypeScript | Pages and server-side routes |
| UI | Tailwind CSS + shadcn/ui | Responsive components and styling |
| Validation | Zod | Validate inputs and structured model outputs |
| Database | Supabase (PostgreSQL) | Participants, analyses, dates, messages, rankings |
| Model provider | OpenAI API behind a small provider interface | Profile analysis, agent turns, post-date evaluations |
| Hosting | Vercel | Public web demo |

Keep the model calls behind `lib/` modules so providers can be switched without rewriting the UI. For a three-hour MVP, prioritize the end-to-end workflow over a complex multi-agent framework.

## User flow

```text
Add consenting participant
        |
        v
Save LinkedIn + public Instagram URLs
and permitted source content
        |
        v
Analyze content --> Evidence-backed profile page
        |
        v
Run Agent A <--> Agent B simulated date
        |
        v
Evaluate both sides + calculate compatibility
        |
        v
Ranked candidates + reasons + transcript
```

## Suggested repository structure

```text
pairwise/
├── app/
│   ├── page.tsx
│   ├── people/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── dates/[id]/page.tsx
│   ├── rankings/[personId]/page.tsx
│   └── api/
│       ├── people/route.ts
│       ├── analyze/route.ts
│       ├── dates/route.ts
│       └── rankings/route.ts
├── components/
│   ├── profile-card.tsx
│   ├── evidence-panel.tsx
│   ├── date-transcript.tsx
│   └── ranking-table.tsx
├── lib/
│   ├── source-ingestion.ts
│   ├── profile-analysis.ts
│   ├── agent-runtime.ts
│   ├── compatibility.ts
│   ├── db.ts
│   └── schemas.ts
├── scripts/seed-demo.ts
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATA-SOURCES-AND-CONSENT.md
│   ├── AGENT-DESIGN.md
│   ├── MATCHING-ALGORITHM.md
│   └── DEMO-SCRIPT.md
├── .env.example
└── README.md
```

This is a suggested layout; adjust it to match the code actually present in the repository.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- An LLM API key for generating analyses and agent conversations
- A Supabase project for persistent storage (or a local development adapter while bootstrapping)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your own credentials:

```bash
cp .env.example .env.local
```

Suggested `.env.example` keys:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never commit `.env.local`, service-role keys, API keys, or other credentials. Only use a Supabase service-role key on the server, never in browser code. Add server-side input validation, rate limits, and sensible model-call limits before publishing the app.

### 3. Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

> The commands and environment variables above are the intended setup. Update this section if the implementation uses different scripts, providers, or persistence.

## Profile analysis contract

Each generated profile should use a predictable schema. Example shape:

```json
{
  "interests": ["Example interest"],
  "hobbies": ["Example hobby"],
  "lifestyle": ["Prefers planned activities"],
  "communicationPreferences": ["Values direct communication"],
  "relationshipGoals": ["Not stated"],
  "needs": ["Unknown until participant confirms"],
  "evidence": [
    {
      "source": "linkedin",
      "claim": "Example professional interest",
      "excerpt": "Short supporting excerpt",
      "confidence": "medium"
    }
  ],
  "unknowns": ["Relationship goals were not stated in available sources"]
}
```

This is a schema example, not a real person's profile. Do not infer sensitive traits, relationship status, sexuality, or romantic intent from unrelated public content. Ask participants to provide dating-specific preferences directly when those details are needed.

## Agent dating protocol

Each date should persist:

- Two separate agent identities and their permitted profile context.
- The sequence of alternating messages, with speaker and timestamp/order.
- The conversation completion status and any model errors.
- A private evaluation for each side, separate from the public transcript.
- A final mutual score, factor breakdown, reasons, possible friction points, and unanswered questions.

A typical date should include an opening, questions about interests and expectations, exploration of differences, a possible shared activity, and a concise close. Both agents should be allowed to express uncertainty or identify a poor fit; the system must not force a positive match.

## Compatibility scoring

Use a transparent weighted baseline and make the weights configurable:

| Dimension | Starting weight |
|---|---:|
| Stated relationship goals and expectations | 30% |
| Lifestyle and explicitly stated values | 25% |
| Shared interests and activities | 20% |
| Communication preferences | 15% |
| Simulated-date evaluation | 10% |

For participants A and B, a mutual score can be calculated as:

```text
mutual_score(A, B) = 0.5 * score(A evaluating B)
                   + 0.5 * score(B evaluating A)
```

Apply the dimension weights inside each directional score. Normalize for missing evidence instead of silently counting unknowns as incompatibilities. Document any normalization used and show a breakdown in the UI. Do not use protected or sensitive attributes as compatibility factors.

## Demo dataset

The demo should include at least 25 **real, consenting participants**, with two official source links per participant and permitted source content sufficient to produce an analysis. Provide a seed script so the same demo can be restored reliably.

- Mark demo records clearly and keep them separate from real user submissions.
- Do not invent identities, links, consent, profile evidence, agent conversations, or model results and present them as real.
- If a record uses synthetic data for development, label it as synthetic and do not count it as one of the 25 real participants.
- Precompute analyses and match results for the presentation if needed, but keep the date transcript traceable to an actual model run and visibly distinguish saved demo results from a newly generated run.

## Three-minute video outline

1. **0:00–0:25 — Profiles:** show the populated set of 25 participants, both source links, and one complete evidence-backed analysis.
2. **0:25–0:45 — Add a participant:** paste the LinkedIn and public Instagram URLs, provide permitted source content, and run analysis.
3. **0:45–1:50 — Agent date:** run a conversation between two distinct agents and show the real alternating turns, an explored difference, and their evaluations.
4. **1:50–2:35 — Rankings:** show a participant's ranked candidates, score breakdown, match explanations, and a link back to the date transcript.
5. **2:35–3:00 — Working product:** show persistence, the live demo URL, and the public repository.

Record the actual deployed app. Do not imply that automated source access is implemented if the demo uses participant-provided content or a manual ingestion path.

## Acceptance checklist

- [ ] Each demo participant has a LinkedIn URL, public Instagram URL, and documented consent.
- [ ] The participant form validates URLs and handles duplicate submissions.
- [ ] Profile analysis is generated from the permitted source content and can be reopened.
- [ ] Findings display evidence and clearly label uncertainty.
- [ ] Two separate agent contexts generate an alternating conversation.
- [ ] A post-date evaluation is saved for each side.
- [ ] Each participant has ranked candidates with scores, explanations, and a transcript link.
- [ ] Data persists after refresh and the primary workflow works on the deployed website.
- [ ] `.env.example` and setup instructions are current; secrets are not committed.
- [ ] The demo video is three minutes or less.

## Deployment

1. Push the code to a **public GitHub repository**.
2. Import the repository into Vercel.
3. Add required server and database environment variables in Vercel project settings.
4. Deploy and test the public URL in a private/incognito browser session.
5. Seed the demo dataset and verify profiles, agent dates, rankings, error handling, and refresh persistence on the deployed instance.
6. Put the direct demo URL, YouTube video URL, and any setup requirements near the top of this README once they exist.

## Project explanation (under 200 characters)

> Pairwise uses consented LinkedIn and public Instagram sources to build personal agents that date, compare compatibility, and rank matches with evidence-backed explanations.

## Important limitations

Pairwise is an experimental decision-support prototype. Public-profile information can be incomplete, outdated, or misleading, and language models can make mistakes. Participants should review their profiles, be able to correct or delete their data, and decide whether to engage with a suggested match. A score must never be presented as a guarantee of personal or romantic compatibility.
