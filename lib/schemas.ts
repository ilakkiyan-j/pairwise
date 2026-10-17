import { z } from "zod";

// --- Source and Consent Schemas ---
export const SourceTypeSchema = z.enum(["linkedin", "instagram", "participant_preferences"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const AccessMethodSchema = z.enum(["participant_provided", "authorized_api"]);
export type AccessMethod = z.infer<typeof AccessMethodSchema>;

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const EvidenceItemSchema = z.object({
  sourceType: SourceTypeSchema,
  claim: z.string().min(1),
  excerptOrBasis: z.string().min(1),
  confidence: ConfidenceSchema,
  classification: z.enum(["stated", "supported_interpretation"]),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// --- Profile Analysis Schemas ---
export const ProfileAnalysisSchema = z.object({
  summary: z.string().default(""),
  interests: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  lifestyle: z.array(z.string()).default([]),
  communicationPreferences: z.array(z.string()).default([]),
  relationshipGoals: z.array(z.string()).default([]),
  needs: z.array(z.string()).default([]),
  evidence: z.array(EvidenceItemSchema).default([]),
  unknowns: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
});
export type ProfileAnalysis = z.infer<typeof ProfileAnalysisSchema>;

// --- Participant Schemas ---
export const ParticipantRecordTypeSchema = z.enum(["participant", "demo", "synthetic"]);
export type ParticipantRecordType = z.infer<typeof ParticipantRecordTypeSchema>;

export const ParticipantStatusSchema = z.enum(["active", "deleted"]);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

export const CreateParticipantInputSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  linkedinUrl: z.string().trim().url("Must be a valid URL").regex(/^https:\/\/(www\.)?linkedin\.com\//i, "Must be a valid LinkedIn profile URL (https://linkedin.com/in/...)"),
  instagramUrl: z.string().trim().url("Must be a valid URL").regex(/^https:\/\/(www\.)?instagram\.com\//i, "Must be a valid Instagram profile URL (https://instagram.com/...)"),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must confirm explicit consent to create an agentic dating profile" }),
  }),
  sourceContentText: z.string().trim().optional(),
  recordType: ParticipantRecordTypeSchema.default("participant"),
});
export type CreateParticipantInput = z.infer<typeof CreateParticipantInputSchema>;

export const ParticipantSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  linkedinUrl: z.string(),
  instagramUrl: z.string(),
  consentGiven: z.boolean(),
  consentedAt: z.string().nullable(),
  recordType: ParticipantRecordTypeSchema,
  status: ParticipantStatusSchema,
  sourceContentText: z.string().optional(),
  sourceAccessMethod: AccessMethodSchema.optional(),
  analysis: ProfileAnalysisSchema.nullable().optional(),
  analysisStatus: z.enum(["none", "pending", "completed", "failed"]).default("none"),
  analysisUpdatedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

// --- Agent Dating & Messages Schemas ---
export const AgentTurnOutputSchema = z.object({
  message: z.string().trim().min(1).max(900),
  stopReason: z.enum(["continue", "insufficient_information", "conversation_complete"]).default("continue"),
});
export type AgentTurnOutput = z.infer<typeof AgentTurnOutputSchema>;

export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  dateId: z.string().uuid(),
  speaker: z.enum(["agent_a", "agent_b"]),
  speakerParticipantId: z.string().uuid(),
  speakerName: z.string(),
  turnIndex: z.number().int().nonnegative(),
  content: z.string(),
  createdAt: z.string(),
});
export type AgentMessage = z.infer<typeof AgentMessageSchema>;

export const FactorAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string().default(""),
  confidence: ConfidenceSchema.default("medium"),
});
export type FactorAssessment = z.infer<typeof FactorAssessmentSchema>;

export const DirectionalEvaluationSchema = z.object({
  evaluatorParticipantId: z.string().uuid(),
  evaluatedParticipantId: z.string().uuid(),
  factors: z.object({
    relationshipGoals: FactorAssessmentSchema,
    lifestyleValues: FactorAssessmentSchema,
    sharedInterests: FactorAssessmentSchema,
    communicationPreferences: FactorAssessmentSchema,
    dateConversation: FactorAssessmentSchema,
  }),
  positiveSignals: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  unresolvedQuestions: z.array(z.string()).default([]),
  summary: z.string().default(""),
});
export type DirectionalEvaluation = z.infer<typeof DirectionalEvaluationSchema>;

export const MutualSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  positiveHighlights: z.array(z.string()).default([]),
  potentialFriction: z.array(z.string()).default([]),
  keyQuestions: z.array(z.string()).default([]),
  narrativeSummary: z.string().default(""),
});
export type MutualSummary = z.infer<typeof MutualSummarySchema>;

export const DateSessionSchema = z.object({
  id: z.string().uuid(),
  participantAId: z.string().uuid(),
  participantBId: z.string().uuid(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  messages: z.array(AgentMessageSchema).default([]),
  evaluationA: DirectionalEvaluationSchema.nullable().optional(),
  evaluationB: DirectionalEvaluationSchema.nullable().optional(),
  mutualSummary: MutualSummarySchema.nullable().optional(),
  startedAt: z.string(),
  completedAt: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});
export type DateSession = z.infer<typeof DateSessionSchema>;

// --- Compatibility & Rankings Schemas ---
export const MATCH_ALGORITHM_VERSION = "pairwise-match-v1" as const;

export const MATCH_WEIGHTS = {
  relationshipGoals: 30,
  lifestyleValues: 25,
  sharedInterests: 20,
  communicationPreferences: 15,
  dateConversation: 10,
} as const;

export const FactorScoreDetailSchema = z.object({
  score: z.number().nullable(),
  configuredWeight: z.number(),
  status: z.enum(["assessed", "partial", "unknown", "conflicting"]),
  directionalA: z.number().nullable().optional(),
  directionalB: z.number().nullable().optional(),
  rationale: z.string().default(""),
  evidenceRefs: z.array(z.string()).default([]),
});
export type FactorScoreDetail = z.infer<typeof FactorScoreDetailSchema>;

export const CandidateRankingSchema = z.object({
  participantId: z.string().uuid(),
  candidateId: z.string().uuid(),
  candidateName: z.string(),
  candidateRecordType: ParticipantRecordTypeSchema,
  rank: z.number().int().positive(),
  algorithmVersion: z.literal(MATCH_ALGORITHM_VERSION),
  mode: z.enum(["pre_date", "completed_date"]),
  status: z.enum(["scored", "insufficient_evidence"]),
  score: z.number().nullable(),
  coveragePercent: z.number().min(0).max(100),
  confidence: ConfidenceSchema,
  factorScores: z.record(FactorScoreDetailSchema),
  reasons: z.array(z.string()).default([]),
  possibleFriction: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
  dateId: z.string().uuid().nullable().optional(),
  calculatedAt: z.string(),
});
export type CandidateRanking = z.infer<typeof CandidateRankingSchema>;
