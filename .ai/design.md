# Pairwise — Product & UI Design Specification

> **Purpose:** Give implementation agents one consistent visual and interaction system for the three-hour MVP. Prioritize clarity, trust, and the live agent-dating experience. This document describes the intended design; verify each interaction against the running app before marking it complete.

## 1. Product feel

**Brand:** Pairwise  
**Tagline:** *Let your agents meet before you do.*

Pairwise should feel like a thoughtful, modern matchmaking lab—not a generic dating app, a chatbot toy, or a corporate analytics dashboard. The visual tone is warm, editorial, calm, intelligent, and transparent. The “magic” is the agents’ conversation; the interface should frame it clearly rather than compete with it.

### Design principles

1. **Conversation is the hero.** The live date transcript must be the most engaging part of the product.
2. **Evidence before certainty.** Distinguish stated facts, model interpretations, and unknowns. Never present an inference as a verified fact.
3. **One clear next action.** Every screen should make the next useful step obvious.
4. **Meaningful over decorative.** Motion, score colors, icons, and badges need to convey state or information.
5. **Functional beats flashy.** No visual effect may block the core journey: add participant → analyze profile → run date → view rankings.

## 2. Visual identity

### Color tokens

Use CSS variables or Tailwind theme tokens so the palette can be changed in one place.

| Token | Value | Use |
|---|---|---|
| `--background` | `#FAF8F5` | Warm off-white page background |
| `--surface` | `#FFFFFF` | Cards, forms, dialogs |
| `--surface-muted` | `#F2EEE9` | Secondary panels, grouped fields |
| `--foreground` | `#202124` | Main text |
| `--muted` | `#6F6A67` | Helper text, metadata |
| `--border` | `#E7E0D9` | Borders and dividers |
| `--primary` | `#B83267` | Primary CTA, selected states, brand accent |
| `--primary-hover` | `#982653` | Hover/pressed primary action |
| `--primary-soft` | `#FCE8F0` | Light accent backgrounds |
| `--secondary` | `#293C35` | Deep evergreen, secondary emphasis |
| `--secondary-soft` | `#E7F0EA` | Positive/grounded metadata |
| `--warning` | `#9A5B16` | Missing data, caution, partial evidence |
| `--warning-soft` | `#FFF0D8` | Warning background |
| `--danger` | `#B42318` | Destructive/error actions |
| `--danger-soft` | `#FEECEB` | Error background |
| `--focus` | `#5879D7` | Visible keyboard focus ring |

**Color rules:** Use the primary rose sparingly for meaningful actions and active states. Avoid coloring every card. Do not communicate compatibility score with color alone; always show its numeric score and label. Don't use green to imply a relationship is guaranteed to succeed.

### Typography

- **Preferred:** Geist or Inter for interface text; use one font family if time is limited.
- **Page title:** 30–36 px desktop, 26–30 px mobile, 650–750 weight, tight line height.
- **Section title:** 18–22 px, 600–700 weight.
- **Body:** 14–16 px, 400 weight, 1.5 line height.
- **Metadata/labels:** 12–13 px, medium weight, muted foreground.
- **Score:** 28–36 px, semibold, tabular numerals when available.
- Avoid thin text, tiny contrast-heavy captions, and long uppercase labels.

### Shape, spacing, and elevation

- Main content max width: approximately `1120px`; centered with `24px` desktop gutters and `16px` mobile gutters.
- Spacing system: multiples of 4 px; most card padding `20–24px`, mobile `16px`.
- Cards: white surface, 1px border, `14–18px` corner radius.
- Inputs/buttons: `10–12px` corner radius, minimum `44px` height for primary controls.
- Use subtle shadow only for popovers or important overlays. Prefer borders and whitespace for layout.
- Keep content density moderate; profile and ranking pages should be scannable.

## 3. App shell and navigation

### Header

Desktop header height around 68px, sticky only if it remains unobtrusive.

- Left: Pairwise mark (simple linked circles or heart-link icon) + wordmark.
- Center/right navigation: `Explore`, `People`, `Agent Dates`, `Rankings`.
- Right side: environment badge (`DEMO` or `LIVE`) and a clear `+ Add person` button.
- On mobile, collapse links into a compact menu; keep the wordmark and main action accessible.

Use the exact route names already defined by the app architecture where they differ. Do not render navigation links to unfinished pages without a helpful disabled state or working destination.

### Global environment indicators

- **Demo seed:** use a quiet `DEMO DATA` label and explain when profiles or results are precomputed.
- **Participant-provided content:** label source provenance, not the content as scraped.
- **Live model result:** label only when a real model call generated it.
- **Processing:** show the current step honestly, e.g. `Analyzing provided source content…`.

Never show a fake percentage progress bar for indeterminate model work. Use a spinner or staged status message instead.

## 4. Page designs

### A. Home / Explore (`/`)

**Goal:** Explain the product and get users into the populated example or onboarding in one glance.

Layout:
1. Small label: `AGENTIC MATCHMAKING`.
2. Hero headline: **“Let your agents meet before you do.”**
3. One-sentence explanation that each consenting participant has an agent that analyzes provided profile information, meets other agents, and explains compatibility.
4. Primary CTA: `Explore demo`; secondary CTA: `Add a person`.
5. A small, credible summary panel: participant count, completed dates, and available rankings. Read these from persisted data; don't hard-code numbers that can become stale.
6. “How it works” strip with three steps: `Build a profile` → `Agents meet` → `Explore rankings`.
7. A recent agent date preview or top-ranked match if persisted results exist.

Empty state: If no participants exist, explain the three steps and make `Add a person` the dominant CTA. Do not show fake people or fake counts outside an explicitly labeled demo seed.

### B. People list / demo people

Show a responsive grid or compact table; prefer cards for the visual demo.

Each participant card:
- Display name and optional participant-provided avatar. Do not generate a realistic face to represent a real person without an approved source image.
- 2–4 interests as small plain chips.
- Analysis status: `Not analyzed`, `Ready`, `Needs attention`.
- Small provenance label: `Participant-provided`, `Authorized integration`, or `Demo seed`.
- Actions: `View profile`, `Analyze` when relevant.
- Show both official source links on the detail page, not necessarily on every card.

Support search by display name and basic status filtering only if time allows. On mobile, cards should be one column, readable, and tappable.

### C. Add person (`/people/new`)

**Goal:** Let the user create a participant record correctly and transparently.

Use a single-column form (maximum width around `680px`) with numbered sections:

**1 — Identity**
- Display name (required)
- LinkedIn public profile URL (required; `https://` URL validation)
- Public Instagram profile URL (required; `https://` URL validation)

**2 — Source content**
- A textarea or structured source-content form for relevant content the consenting participant has supplied, or content collected through an authorized method.
- Explain briefly: “Pairwise stores the two profile links as source references. It does not bypass platform access controls or scrape content without authorization.”
- Record provenance for each source/content block in the backend.

**3 — Consent**
- Required, unchecked consent checkbox using plain language: the participant agrees to AI analysis for this matchmaking demo and to having their profile analyzed for compatibility with other consenting participants.
- Link to the app's short data-handling explanation if available.
- Do not enable submit until required fields, valid URLs, and consent are present.

Actions:
- Primary: `Create participant`
- Secondary: `Cancel`

Validation must be inline next to the relevant field. Preserve valid input after an API error. Disable the submit button only during the actual in-flight request and restore it after failure.

Success: Navigate to the new profile page and show `Profile created` plus a clear next step (`Analyze profile`). Do not imply analysis has already run.

### D. Participant profile (`/people/[id]`)

**Goal:** Make the agent's understanding inspectable and evidence-backed.

Header panel:
- Display name, analysis status, source provenance, and `Analyze / Reanalyze` action.
- Two clear official source links: `Open LinkedIn profile` and `Open Instagram profile`.
- `Edit`/`Delete` actions only if the backend really supports them.

Main layout on desktop: two columns, roughly 2:1. On mobile: one column, with profile summary first.

Suggested sections:
1. **Profile at a glance:** concise summary in 2–3 sentences.
2. **What matters to them:** explicitly stated goals, needs, relationship expectations, and preferences—only to the extent the source content supports them.
3. **Interests & hobbies:** chips, plus evidence on click/expand.
4. **Lifestyle & communication:** observable/stated preferences with source labels and confidence.
5. **Evidence:** short paraphrases or small permitted excerpts with source attribution and an explanation of why the evidence supports the finding.
6. **Unknown / ask next:** items the model cannot responsibly determine and questions that could clarify them.
7. **Agent behavior preview:** a short explanation of what the advocate agent is instructed to prioritize, not a claim about hidden psychological truths.

Evidence display:
- Every material analysis claim should link to one of the two source labels or be labeled `Participant-provided answer`.
- Separate `Observed/stated` from `Interpretation` visually.
- Use confidence labels such as `High evidence`, `Some evidence`, and `Unknown`; avoid false numerical precision.
- Never infer sensitive attributes, sexual orientation, or romantic intent from professional or lifestyle clues alone. Use explicit participant-provided goals and preferences for matchmaking.

Loading state: skeleton sections or a compact spinner with current status.  
No-analysis state: show the two sources and a clear `Analyze profile` CTA.  
Error state: retain the existing profile and show retry; do not blank the page.

### E. Agent dates (`/dates/[id]` and date launch surface)

**Goal:** This is the signature screen and the visual center of the 3-minute video.

Date setup / launch:
- Select two different eligible, consenting participants.
- Show small profile summaries before launch.
- Explain that the upcoming date is a **simulated conversation between two AI agents**, not an actual meeting between the people.
- Main CTA: `Start agent date`.
- Prevent starting a date if either profile has no usable analysis; explain what needs to happen first.

Date room layout:
- Header with both participant names and agent identifiers (`Agent A` / `Agent B`).
- Center conversation transcript as chat bubbles with visibly different, accessible styles for the two agents.
- Small avatar treatment may use icon/initials; the agents are representatives, not the real people.
- Every message shows the speaker and optional turn number. Avoid fake typing indicators when no generation is happening.
- Show live status: `Agent A is considering…`, `Agent B is responding…`, `Evaluating the date…`. Only show a status when the backend supports it.
- Below/alongside transcript, show the date stages: `Opening` → `Goals & lifestyle` → `Explore differences` → `Evaluation`.
- At completion, show two separate directional evaluations and the mutual summary: positive signals, trade-offs, unresolved questions, score and evidence coverage.
- Actions: `View rankings`, `Run another date` (if supported), `Retry failed date` (if supported).

Conversation quality expectations:
- At least 4 alternating turns for the minimum credible live demo; target 6–8 turns if reliable.
- Agents should ask and answer concrete questions, explore differences and avoid automatic agreement.
- Do not render a static sample transcript as if it were live. Seeded transcript content must carry a `Demo example` badge.
- Persist each turn or safely preserve partial progress so a single generation failure does not erase a date.

Failure states:
- Distinguish `Date failed before starting` from `Date incomplete`.
- Preserve already-saved turns; provide a retry/resume action only if implemented.
- Never display a completed score before the evaluation exists.

### F. Rankings (`/rankings/[personId]`)

**Goal:** Deliver a personalized, explainable, stable ordering—not a black-box leaderboard.

Page header:
- `Best potential matches for [Name]`
- Compact explanation: ranking estimates are based on available profile evidence and a simulated date; they are not guarantees.
- Button to return to profile and optionally refresh rankings if the backend supports it.

Ranking list row/card:
- Rank number.
- Other participant name + `View profile` link.
- Compatibility score out of 100 with textual label such as `Strong potential`, `Worth exploring`, or `Limited evidence` (labels must reflect configured thresholds).
- Evidence coverage indicator with a textual value; distinguish coverage from compatibility.
- Two top positive reasons, one potential trade-off, and an `Open date transcript` action if a date exists.
- Small score breakdown for the five factors, expandable on demand.

Do not imply that a top score means a person is “the one.” Do not use ranking labels such as `soulmate` or medical/psychological diagnostic terms. If evidence coverage is low, show that warning beside the score.

Sorting and states:
- Default order: mutual compatibility score descending, with stable tie-breakers from the matching algorithm doc.
- If rankings are outdated, show `Profile changed — refresh rankings` rather than silently presenting stale scores.
- Empty state: explain that analysis/date data is needed and link to the next available action.
- Error state: retain the page and provide retry.

## 5. Reusable components

Build only what is reused or improves the main demo path.

- `AppHeader` — wordmark, navigation, environment badge, add-person CTA.
- `PageHeader` — title, description, main action.
- `ParticipantCard` — name, interests, status, provenance.
- `SourceLinks` — the two official URLs, open in a new tab with safe link attributes.
- `StatusBadge` — analysis/date state with text and icon, not color alone.
- `EvidenceItem` — claim, source label, evidence strength, interpretation/stated marker.
- `InterestChips` — list of profile topics.
- `ScoreDisplay` — score, label, and evidence coverage kept distinct.
- `ScoreBreakdown` — five factors and weights with a simple horizontal meter and values.
- `AgentMessage` — speaker, message, turn metadata.
- `AgentDateTimeline` — honest current/completed stage states.
- `EmptyState` — brief explanation plus one useful action.
- `ErrorMessage` — human-readable issue and an actionable retry/corrective step.
- `ConfirmDialog` — required only for destructive actions if those actions exist.

Avoid creating a large component system, visual charting dependency, or generic design framework during the three-hour build.

## 6. Interaction patterns

- All primary actions require clear loading, success, and error states.
- Use optimistic UI only for reversible, low-risk changes. For analysis, dates, and rankings, reflect server-confirmed state.
- Make refresh/reopen safe: pages should be driven by persisted state, not only in-memory client state.
- Confirm deletion if deletion is implemented. Make destructive actions visually distinct from primary actions.
- Keep forms keyboard accessible; validation errors should identify the field and be readable by assistive technology.
- Use native links for URLs and buttons for actions. Do not make a card appear clickable if it has no action.
- Use `target="_blank"` with `rel="noopener noreferrer"` for external profile links.
- Avoid hidden hover-only controls; key actions must remain visible on touch screens.

## 7. Accessibility and responsive behavior

- Meet practical WCAG AA contrast for body text and interactive controls.
- Ensure full keyboard navigation and a clearly visible focus ring.
- Use semantic heading levels and form labels; all icon-only buttons need accessible labels.
- Don't rely on color alone for score, date stage, errors, or data provenance.
- Respect reduced-motion preferences. Motion is optional; avoid complex transitions if time is limited.
- Mobile: single-column cards, stacked profile sections, transcript bubbles constrained to viewport width, horizontally scroll-free forms, and sticky controls only if they do not cover content.
- Desktop: use whitespace and controlled column widths; don't stretch prose to the full display width.

## 8. Motion and micro-interactions

Motion should be restrained and informative:
- Small fade/slide for a newly completed profile section or incoming message.
- Gentle progress-state transition when the date advances to its next stage.
- Subtle score count-up only when a result first appears; disable for reduced motion.
- Button hover/press states with clear contrast changes.

Do not animate every card, use confetti for match scores, or delay content to finish an animation. The transcript must feel alive because the agents are exchanging real turns—not because the UI fakes activity.

## 9. Content and microcopy

Preferred terminology:
- `Participant` for a person in the dataset.
- `Profile analysis` for generated findings.
- `Agent date` for the simulated conversation.
- `Compatibility score` for the estimate.
- `Evidence coverage` for how much of the score has usable support.
- `Unknown` / `Not enough evidence` when the sources are silent.
- `Demo seed` for the populated sample data.

Avoid claims such as `we know who they really are`, `perfect match`, `soulmate`, or `scraped from Instagram` unless the actual access method and wording are accurate. Do not imply that an agent has contacted a person, made a real-world date booking, or sent a message to another person.

Suggested helper text for profile analysis:
> Pairwise summarizes supported signals from the provided profile content. Interpretations are labeled, and missing information stays unknown rather than being guessed.

Suggested helper text for agent dates:
> These agents are simulating a conversation on behalf of consenting participants. No message is sent to either participant, and this is not a real-world date.

Suggested helper text for rankings:
> Scores summarize current evidence and simulated conversation quality. They are exploratory estimates, not a prediction of relationship success.

## 10. Demo mode vs. live mode

The visual system must communicate the difference clearly and consistently.

**Demo mode**
- Shows seeded, consenting demo participants and stored/precomputed results.
- Displays a persistent but quiet `DEMO DATA` badge.
- Labels precomputed analyses and transcripts accurately.
- Allows visitors to inspect profiles, dates, and rankings without running expensive model calls.

**Live mode**
- Processes newly submitted participant links and permitted content.
- Indicates when analysis, conversation, or evaluation is generated by a real model call.
- Shows error/retry states for real API failures.
- Never silently falls back to a static fixture while claiming a live result succeeded.

Keep this distinction in data fields as well as UI labels (`dataMode`, `sourceProvenance`, `generatedAt`, `modelProvider` where applicable). Never include secrets in client-side data.

## 11. Implementation priorities

### P0 — Must exist for the demo

- Consistent shell and navigation.
- Add-person form with two official URLs, source-content input/provenance, and consent gate.
- Inspectable profile page with source links and evidence/unknowns.
- Real alternating agent-date transcript and two separate evaluations.
- Ranking list with scores, explanations and transcript/profile navigation.
- Empty, loading, success and error states on core paths.
- Clear demo/live and precomputed/live-result labels.

### P1 — Only after P0 works

- Search/filter people list.
- Expandable score breakdowns.
- Date stage timeline and subtle motion.
- Reanalysis and ranking refresh controls.
- Responsive refinement beyond core usability.

### P2 — Defer

- Complex animation system.
- Advanced charts, dashboards or filtering.
- Human-to-human chat, notifications, payments or social features.
- Avatar generation, elaborate profile illustrations, dark mode or theme switcher.

## 12. Visual QA checklist

- [ ] The first screen tells a new user what Pairwise does and offers a working next action.
- [ ] Primary/secondary buttons are visually distinct and consistently styled.
- [ ] Add-person errors are understandable and don't erase user input.
- [ ] Profile pages separate supported statements from interpretations and unknowns.
- [ ] Both official source links are easy to find and open safely.
- [ ] Agent A and Agent B are visually distinguishable without relying on color alone.
- [ ] Transcript turns are readable and their speaker labels are always visible.
- [ ] A demo transcript or precomputed ranking is labeled as such.
- [ ] Ranking score and evidence coverage are displayed as different measurements.
- [ ] Low evidence is not presented as a confident compatibility claim.
- [ ] Loading/error/empty states exist for onboarding, analysis, dates, and rankings.
- [ ] Main flow works with keyboard and on a narrow mobile viewport.
- [ ] No visible button or link is a dead end.
- [ ] The deployed UI agrees with the repository's actual implemented behavior.

## 13. Design decision record

- **Chosen direction:** warm editorial base, rose primary accent, deep evergreen secondary, evidence-led cards, transcript-first date room.
- **Why:** distinctive enough for a hackathon demo while fast to implement with standard Tailwind/shadcn components.
- **Trade-off:** prioritize hierarchy and clarity over an elaborate visual identity; avoid spending the three-hour window on custom graphics.
- **Revisit only if:** the current palette fails contrast checks or an existing app scaffold already has a consistent working design system.
