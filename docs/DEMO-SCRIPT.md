# Pairwise — Three-Minute Demo Script

> **Goal:** Demonstrate the complete working journey: source links and permitted content → profile analysis → a real agent-to-agent date → explainable rankings.
>
> **Maximum runtime:** 3:00. Record the deployed site, not a slide deck. Use the prepared demo dataset so the video shows results without waiting on slow model calls.

## Before Recording

- Deploy the current version and test the public URL in a private/incognito window.
- Prepare a dataset of **25 consenting participants**. Each participant record should contain their LinkedIn URL and public Instagram URL, plus source content obtained through a permitted method or supplied by the participant.
- Confirm that all 25 profile pages, date transcripts, and per-person rankings are persisted and reopen correctly.
- Pre-run a few dates to avoid latency, but keep one date action that can be triggered live. During recording, make it clear which transcript is newly generated and which results are precomputed.
- Use fictional names only for synthetic test records. Never present synthetic records as real people. Do not invent URLs or imply that a person consented when they did not.
- Hide API keys, database credentials, private contact information, browser autofill, and unrelated tabs.
- Have the landing page, one detailed profile, the agent date, and a ranking page ready to open.
- Use readable browser zoom (about 90–100%), close notifications, and make a local backup recording.

## Timed Walkthrough (180 seconds maximum)

### 0:00–0:20 — Product and 25-person demo

**On screen:** Open Pairwise's deployed landing page and show the populated participant grid/count.

**Narration:**

> “This is Pairwise: a matchmaking platform where each consenting participant is represented by an AI agent. We use two profile sources—LinkedIn and public Instagram—through permitted access or participant-provided content. Agents analyze the evidence, date one another, and produce explainable compatibility rankings.”

**Must be visible:** The live URL and the 25-person demo collection. Do not spend time on a long introduction.

### 0:20–0:45 — Add a person and analyze their profile

**On screen:** Open **Add Person**. Paste a participant's LinkedIn URL and public Instagram URL. Show the consent step and source-content input/authorized ingestion state, then submit. Open the resulting profile.

**Narration:**

> “Adding a person starts with both official profile links and consent. Pairwise processes only content it is permitted to access. The analyst produces a structured profile, with hobbies, interests, stated relationship goals, lifestyle preferences, needs, evidence, and uncertainty. We keep source evidence separate from model inferences.”

**Must be visible:** Both URL fields, the source/consent status, and a successfully generated profile page. Avoid suggesting that pasting a URL guarantees automated scraping.

### 0:45–1:50 — Show the profile and an actual agent date

**On screen:** Briefly point out the detailed profile analysis, then open a date between two participants' agents. Start the date or open a freshly generated date run. Show messages alternating between Agent A and Agent B.

**Narration:**

> “Each agent has its own context and represents one participant's stated goals. These are separate model calls, not one model writing both sides. Watch the agents ask follow-up questions, explore what each person wants, and surface a real difference rather than agreeing with everything. The transcript is saved, and each agent evaluates the potential match from its own participant's perspective.”

**Show at least:**

1. Agent A's opening question.
2. Agent B's answer.
3. At least one follow-up that responds to the previous answer.
4. A point of alignment and a possible trade-off or unresolved question.
5. Both agents' final evaluations or the date summary.

**Must be true:** The visible messages must be returned by the running model integration. Never fabricate a transcript and call it live. If the model call fails, show the persisted transcript honestly and label it as a previously completed run.

### 1:50–2:35 — Reveal the final rankings

**On screen:** Open one participant's rankings. Show the top three, their scores, the explanation for the top match, a lower-ranked comparison, and the link to the underlying date transcript. Briefly show that rankings can be opened for other participants too.

**Narration:**

> “Pairwise ranks candidates using explicit relationship goals, lifestyle and values, shared interests, communication preferences, and date quality. Both agents' evaluations contribute to the mutual score. Each result includes why the match may work, what may be difficult, how much evidence supports the score, and what remains unknown. The rankings are explainable estimates—not guarantees of relationship success.”

**Must be visible:** Scores and explanations, not just a sorted list of names. Do not claim every possible pair has completed a real date unless the system has actually run all those conversations.

### 2:35–3:00 — Close with the working product

**On screen:** Show the public repository, the deployed demo URL, and a quick view of setup/architecture if time allows.

**Narration:**

> “The complete journey is available in the live app: add permitted source links, inspect the person’s analysis, watch the agents date, and review the rankings. The repository documents the architecture, source handling, scoring, and setup so the demo can be tested and extended.”

End by leaving the live app visible. Keep the full recording at or below 180 seconds.

## Shot Checklist

- [ ] The public website opens successfully.
- [ ] The populated demo shows 25 participant records.
- [ ] Every demo record has LinkedIn and public Instagram source URLs.
- [ ] Profile analysis visibly includes interests, hobbies, relationship goals, needs, and evidence/uncertainty.
- [ ] The add-person path is shown using a permitted data-ingestion method.
- [ ] A real, separate-agent conversation is visible with alternating turns.
- [ ] The date result includes both agents' evaluations.
- [ ] A participant's ranked list shows scores and specific explanations.
- [ ] A ranking links to the profile and relevant date transcript.
- [ ] The live website and public repository are shown.
- [ ] No secrets or private personal data appear in the recording.
- [ ] The video runtime is no more than 3:00.

## Recording and Reliability Tips

- Prefer one continuous browser capture with clean, deliberate navigation. Edit only dead time; do not edit generated responses to make them appear to say something they did not say.
- Ensure the seed data, source content, analysis, conversation transcript, and ranking use consistent participant IDs.
- Use bounded agent conversations (for example, six alternating turns) and request structured outputs to control latency and cost.
- If a model or database request fails, surface an honest error state and retry. Never silently substitute mock output for a failed live call.
- If rankings are precomputed for the demo, say so when relevant and show that the website can still accept new participants and run the analysis workflow.

## Suggested Video Title and Description

**Title:** Pairwise — AI Agents That Date on Your Behalf | Hackathon Demo

**Description:**

Pairwise is an agentic matchmaking prototype. For consenting participants, it organizes permitted LinkedIn and public Instagram source content into evidence-backed profiles, runs separate AI agents through a simulated dating conversation, and presents explainable mutual compatibility rankings. The demo shows the end-to-end workflow and its current implementation limits.

## Final Honesty Check

Before publishing, verify that the video accurately distinguishes:

- source URLs from source content actually accessed;
- evidence-backed statements from model inferences;
- live-generated dates from previously saved date runs;
- completed pairwise dates from compatibility estimates calculated without a conversation;
- demo/test participants from real consenting participants.
