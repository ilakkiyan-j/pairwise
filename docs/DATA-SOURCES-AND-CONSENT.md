# Pairwise — Data Sources and Consent

> **Status:** MVP implementation policy  
> **Purpose:** Define what Pairwise may collect, how profile evidence is handled, and how participants remain in control of their data.

## 1. Core rule

Pairwise represents people who have knowingly opted into the experience. A profile URL being publicly viewable is **not, by itself, consent** to create a dating profile, infer romantic preferences, or rank someone as a potential partner.

For each participant, the profile keeps exactly two source references:

1. Their LinkedIn public-profile URL.
2. Their public Instagram profile URL.

The application must not quietly add other websites, data brokers, search results, private accounts, or hidden enrichment sources. Participant-provided text or answers may be used only as a clearly labelled, consented input to help analyze the two referenced profiles; do not represent supplied text as independently verified scraped data.

## 2. Supported ingestion for the three-hour MVP

### Accept

- A valid LinkedIn profile URL supplied by the participant.
- A valid public Instagram profile URL supplied by the participant.
- Explicit participant consent to create and analyze their Pairwise profile.
- Profile text or a short questionnaire supplied by the participant when automated access is unavailable or not permitted.
- Content retrieved through an official API or another documented method that is authorized for the specific use.

### Do not implement

- Login/session-cookie scraping, credential collection, or automated access to private profiles.
- Circumventing rate limits, CAPTCHAs, access controls, or platform restrictions.
- Browser automation that imitates a logged-in user to collect profile content without authorization.
- Guessing an account belongs to a person based only on a name or photo.
- Inferring sensitive traits, sexual orientation, health, religion, ethnicity, political views, or other sensitive personal attributes.
- Scraping non-consenting people to fill the demo dataset.

**MVP fallback:** Save both source URLs, then request participant-provided excerpts or answers. Clearly show the ingestion status (for example, `URL saved`, `content supplied by participant`, or `authorized source connected`). Never claim a URL was scraped when it was not.

## 3. Consent flow

Before analyzing a person, require them (or an authorized administrator acting with documented permission) to confirm that:

- They understand that Pairwise will analyze the supplied profile content for matchmaking-related attributes.
- They agree to the creation of an AI-generated profile and simulated agent-to-agent dating conversations on their behalf.
- Their profile may be included in compatibility comparisons with other consenting participants.
- The analysis is an estimate, can be wrong, and is not a statement of fact about their personality or romantic suitability.
- They can review, correct, export where supported, or request deletion of their Pairwise data.

Store a timestamped consent record and the consent-policy version. Do not treat a checked box by someone adding another person's URLs as proof that the other person consented.

Suggested consent text for the onboarding UI:

> I consent to Pairwise processing the two profile sources and any content I provide to generate an AI-assisted profile, simulate agent-to-agent dating conversations, and calculate compatibility rankings among consenting participants. I understand the results may be inaccurate and can request correction or deletion.

This text is a product draft, not legal advice. Have the final consent and privacy language reviewed for the jurisdictions in which the app will operate.

## 4. Data minimization and allowed analysis

Only extract details relevant to the declared matchmaking purpose and supported by the source content.

| Field | Handling rule |
|---|---|
| Name and profile URLs | Store only what is necessary to identify and open the participant's supplied profiles. |
| Hobbies and interests | Include when directly stated or supported by clear source evidence. |
| Lifestyle preferences | Record only when the content supports the finding; otherwise mark `unknown`. |
| Communication preferences | Use explicit statements or cautiously labelled observations; do not present speculation as fact. |
| Relationship goals and needs | Prefer participant-provided answers. Do not infer private romantic preferences from professional or social activity. |
| Evidence | Retain a short excerpt or content reference, source URL, and an explanation for each material finding where permitted. |
| Confidence | Use a simple confidence label and explain missing or ambiguous evidence. |
| Sensitive attributes | Do not infer or store them for matching. |

Distinguish **observed evidence**, **participant-stated preferences**, and **model interpretation** in the profile UI. For each field, allow `unknown` rather than making up a value.

## 5. Source provenance

For each analyzed source, keep the minimum provenance needed to explain how the content was obtained:

- `source_type`: `linkedin` or `instagram`.
- `source_url`: the official profile URL entered by the participant.
- `ingestion_method`: `participant_text`, `participant_questionnaire`, or a named authorized integration.
- `retrieved_at` or `provided_at`: timestamp, when applicable.
- `content_status`: `url_only`, `content_supplied`, `authorized_content_available`, or `error`.
- `consent_record_id`: reference to the current consent record.

Never label participant-supplied excerpts as scraped content. Keep profile evidence linked to its source so a participant can inspect or correct it.

## 6. Retention, access, and deletion

- Collect only the data needed for the active demo and its stated functions.
- Do not store passwords, access tokens, session cookies, or unnecessary full-page copies.
- Keep API credentials on the server in environment variables; never expose them to browser code or commit them to Git.
- Restrict profile data and date transcripts to the app's intended use. Avoid public exposure of participant-level results by default.
- Provide a delete flow (or a clearly documented administrator-assisted deletion process for the MVP) that removes the participant, source content, analyses, associated date transcripts, evaluations, and rankings.
- When a participant is deleted, invalidate or recompute other participants' rankings that depended on them.
- Define retention periods before production. Do not retain raw source text indefinitely merely because storage is inexpensive.

## 7. Demo dataset policy

The demo requires at least 25 participants. Populate it with people who have explicitly consented to participate and whose LinkedIn and public Instagram URLs are supplied or verified by them. Keep a consent record for every participant.

If 25 consenting real participants cannot be assembled in the time available:

- Use clearly labelled synthetic profiles for development and automated tests; **never present them as real people**.
- Do not fabricate LinkedIn or Instagram links.
- Do not use real non-consenting people as placeholders in rankings or dating transcripts.
- State honestly in the demo and README which records are real consenting participants versus synthetic test data.

Precompute analyses and rankings only from data that was lawfully obtained and consented to. The live website must still support entering new URLs and completing the permitted onboarding flow.

## 8. Source access and platform terms

Before connecting any automated LinkedIn or Instagram ingestion, verify the current official platform terms, API policies, permissions, rate limits, and permitted use for the intended implementation. Public visibility does not automatically grant permission for automated collection or repurposing.

Use official, documented integrations where available and approved for the intended use. If access is unavailable, blocked, or uncertain, stop automated collection and fall back to participant-provided content. Do not attempt to evade restrictions.

## 9. Acceptance criteria

- [ ] A participant cannot be analyzed until consent is recorded.
- [ ] Each participant has exactly two source-reference slots: LinkedIn and Instagram.
- [ ] Both URLs are validated and retained as references even when no content is retrieved.
- [ ] The app accurately labels how each source's content was obtained.
- [ ] Profiles differentiate evidence, stated preferences, interpretation, and unknown information.
- [ ] The model is instructed not to infer or store sensitive personal attributes.
- [ ] No unauthorized scraping, private-account access, or access-control bypass is present.
- [ ] A participant's profile and derived records can be deleted, with dependent rankings invalidated or recomputed.
- [ ] Demo records are consented real participants or visibly labelled synthetic records; no fabricated real-person data is shown.
- [ ] API keys and private source content are not committed to the public repository.

## 10. Build notes

For the MVP, implement consent and provenance first, then the source-content input form. Keep ingestion behind a small adapter so an approved integration can be added later without rewriting profile analysis, agent conversations, or ranking logic.

**Implementation principle:** be transparent about what Pairwise knows, where it came from, what is inferred, and what remains unknown.
