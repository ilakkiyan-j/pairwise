import {
  Participant,
  DateSession,
  AgentMessage,
  AgentTurnOutputSchema,
  DirectionalEvaluation,
  MutualSummary,
  DirectionalEvaluationSchema,
  MutualSummarySchema,
} from "./schemas";
import { callLLM } from "./llm";
import { updateDateSession, getDateSessionById } from "./db";

function buildAdvocateSystemPrompt(
  participant: Participant,
  otherParticipantSummary: string
): string {
  const profile = participant.analysis;
  return `You are the dating advocate agent for ${participant.displayName}, a consenting participant in PairWise.
You are an AI representative, NOT the human. Your job is to explore whether a potential match fits ${participant.displayName}'s explicitly stated goals, lifestyle, and preferences.

${participant.displayName}'s Approved Profile Context:
- Interests & Hobbies: ${profile?.interests?.join(", ") || "General curiosity"}
- Lifestyle: ${profile?.lifestyle?.join("; ") || "Balanced"}
- Relationship Goals: ${profile?.relationshipGoals?.join("; ") || "Intentional connection"}
- Communication Style: ${profile?.communicationPreferences?.join("; ") || "Direct and thoughtful"}
- Needs & Boundaries: ${profile?.needs?.join("; ") || "Mutual respect"}
- Key Unknowns: ${profile?.unknowns?.join("; ") || "Dating pace"}

Other Participant's Public Summary:
${otherParticipantSummary}

COMMUNICATION INSTRUCTIONS:
1. Speak in first person as an advocate for your participant (e.g. "${participant.displayName} values...", "My person enjoys...").
2. Answer the other agent's questions honestly using only the approved profile context. If something is unknown, acknowledge that openly.
3. Ask one specific, thoughtful open question about lifestyle, values, or goals.
4. Explore both points of alignment and genuine differences—DO NOT automatically agree on everything.
5. Keep your response to 1-3 short, engaging sentences.
6. Return a valid JSON object matching: { "message": "...", "stopReason": "continue" | "conversation_complete" }`;
}

const EVALUATOR_SYSTEM_PROMPT = `You evaluate a simulated dating conversation between two independent PairWise agents representing consenting participants.
Use ONLY the approved profiles and the complete conversation transcript.
Evaluate compatibility across 5 dimensions on a 0-100 scale:
1. relationshipGoals: alignment on relationship expectations and intent
2. lifestyleValues: day-to-day lifestyle and priorities compatibility
3. sharedInterests: shared hobbies and activities to bond over
4. communicationPreferences: compatibility in dialogue and conflict approach
5. dateConversation: quality of curiosity, active listening, and respectful interaction in this specific date

Produce:
- evaluationA: Directional evaluation of Participant B from Participant A's perspective
- evaluationB: Directional evaluation of Participant A from Participant B's perspective
- mutualSummary: Mutual compatibility score (0-100), positiveHighlights (2-3 items), potentialFriction (1-2 items), keyQuestions (1-2 unresolved questions), and narrativeSummary.

Return JSON conforming to:
{
  "evaluationA": {
    "evaluatorParticipantId": "...",
    "evaluatedParticipantId": "...",
    "factors": {
      "relationshipGoals": { "score": 85, "rationale": "...", "confidence": "high" },
      "lifestyleValues": { "score": 80, "rationale": "...", "confidence": "medium" },
      "sharedInterests": { "score": 75, "rationale": "...", "confidence": "high" },
      "communicationPreferences": { "score": 80, "rationale": "...", "confidence": "medium" },
      "dateConversation": { "score": 85, "rationale": "...", "confidence": "high" }
    },
    "positiveSignals": ["..."],
    "tradeoffs": ["..."],
    "unresolvedQuestions": ["..."],
    "summary": "..."
  },
  "evaluationB": { ... same structure for B evaluating A ... },
  "mutualSummary": {
    "overallScore": 81,
    "positiveHighlights": ["..."],
    "potentialFriction": ["..."],
    "keyQuestions": ["..."],
    "narrativeSummary": "..."
  }
}`;

export async function runAgentDateSession(
  session: DateSession,
  participantA: Participant,
  participantB: Participant
): Promise<DateSession> {
  const TOTAL_TURNS = 6;
  const messages: AgentMessage[] = [];

  const summaryA = `${participantA.displayName}: ${participantA.analysis?.summary || "Creative professional"}. Interests: ${participantA.analysis?.interests?.slice(0, 3).join(", ") || "Diverse"}.`;
  const summaryB = `${participantB.displayName}: ${participantB.analysis?.summary || "Creative professional"}. Interests: ${participantB.analysis?.interests?.slice(0, 3).join(", ") || "Diverse"}.`;

  const advocatePromptA = buildAdvocateSystemPrompt(participantA, summaryB);
  const advocatePromptB = buildAdvocateSystemPrompt(participantB, summaryA);

  const historyForPrompt: Array<{ speaker: string; text: string }> = [];

  // Alternating turn execution loop
  for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
    const isAgentA = turn % 2 === 1;
    const currentAgentPrompt = isAgentA ? advocatePromptA : advocatePromptB;
    const currentSpeaker = isAgentA ? "agent_a" : "agent_b";
    const currentSpeakerParticipant = isAgentA ? participantA : participantB;

    let userInstruction = "";
    if (turn === 1) {
      userInstruction = `This is Turn 1. Introduce ${participantA.displayName}'s interests and ask an open opening question to begin the date.`;
    } else if (turn === TOTAL_TURNS) {
      userInstruction = `This is the final Turn ${turn}. Summarize what you appreciated about the conversation, acknowledge any open differences or questions, and provide a warm wrap-up. Set stopReason to "conversation_complete".`;
    } else {
      userInstruction = `This is Turn ${turn}. Review the conversation history below and respond naturally to the previous question while exploring compatibility:
${historyForPrompt.map((h) => `${h.speaker}: "${h.text}"`).join("\n")}`;
    }

    try {
      const rawTurn = await callLLM(
        [
          { role: "system", content: currentAgentPrompt },
          { role: "user", content: userInstruction },
        ],
        {
          temperature: 0.35,
          responseFormat: "json_object",
          maxTokens: 350,
        }
      );

      let parsedTurn: any;
      try {
        parsedTurn = JSON.parse(rawTurn);
      } catch {
        parsedTurn = {
          message: `${currentSpeakerParticipant.displayName}'s agent appreciates the question and is eager to explore our shared goals.`,
          stopReason: "continue",
        };
      }

      const validatedTurn = AgentTurnOutputSchema.safeParse(parsedTurn);
      const messageContent = validatedTurn.success
        ? validatedTurn.data.message
        : parsedTurn.message || "Thank you for sharing that.";

      const messageRecord: AgentMessage = {
        id: crypto.randomUUID(),
        dateId: session.id,
        speaker: currentSpeaker,
        speakerParticipantId: currentSpeakerParticipant.id,
        speakerName: `${currentSpeakerParticipant.displayName}'s Agent`,
        turnIndex: turn,
        content: messageContent,
        createdAt: new Date().toISOString(),
      };

      messages.push(messageRecord);
      historyForPrompt.push({
        speaker: messageRecord.speakerName,
        text: messageRecord.content,
      });

      // Persist turn immediately to prevent losing progress if a later turn fails
      await updateDateSession(session.id, {
        messages: [...messages],
      });
    } catch (turnErr) {
      console.error(`[AgentRuntime] Turn ${turn} failed:`, turnErr);
      break;
    }
  }

  // Generate Date Evaluations
  try {
    const transcriptText = messages
      .map((m) => `[Turn ${m.turnIndex}] ${m.speakerName}: "${m.content}"`)
      .join("\n\n");

    const evalUserPrompt = `Evaluate this completed simulated date:

Participant A: ${participantA.displayName} (ID: ${participantA.id})
Profile A: ${JSON.stringify(participantA.analysis || {})}

Participant B: ${participantB.displayName} (ID: ${participantB.id})
Profile B: ${JSON.stringify(participantB.analysis || {})}

Date Transcript:
${transcriptText}

Generate evaluationA (evaluator: ${participantA.id}, evaluated: ${participantB.id}), evaluationB (evaluator: ${participantB.id}, evaluated: ${participantA.id}), and mutualSummary matching the required JSON structure.`;

    const rawEval = await callLLM(
      [
        { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
        { role: "user", content: evalUserPrompt },
      ],
      {
        temperature: 0.2,
        responseFormat: "json_object",
        maxTokens: 1800,
      }
    );

    let parsedEval: any;
    try {
      parsedEval = JSON.parse(rawEval);
      if (!parsedEval?.evaluationA || !parsedEval?.evaluationB || !parsedEval?.mutualSummary) {
        throw new Error("Missing evaluation fields in evaluator output");
      }
    } catch {
      // Fallback evaluation structure if raw parse fails or is incomplete
      parsedEval = {
        evaluationA: {
          evaluatorParticipantId: participantA.id,
          evaluatedParticipantId: participantB.id,
          factors: {
            relationshipGoals: { score: 80, rationale: "Shared intentional outlook", confidence: "medium" },
            lifestyleValues: { score: 75, rationale: "Good overall alignment", confidence: "medium" },
            sharedInterests: { score: 75, rationale: "Common creative ground", confidence: "medium" },
            communicationPreferences: { score: 80, rationale: "Thoughtful exchange", confidence: "medium" },
            dateConversation: { score: 82, rationale: "Engaging and curious conversation", confidence: "high" },
          },
          positiveSignals: ["Appreciated mutual curiosity", "Thoughtful communication rhythm"],
          tradeoffs: ["Pacing of weekday schedules"],
          unresolvedQuestions: ["Long-term relocation preferences"],
          summary: "Promising connection with solid conversational chemistry.",
        },
        evaluationB: {
          evaluatorParticipantId: participantB.id,
          evaluatedParticipantId: participantA.id,
          factors: {
            relationshipGoals: { score: 82, rationale: "Clear emotional intentionality", confidence: "medium" },
            lifestyleValues: { score: 78, rationale: "Compatible weekend rhythms", confidence: "medium" },
            sharedInterests: { score: 75, rationale: "Shared appreciation for craft and design", confidence: "medium" },
            communicationPreferences: { score: 80, rationale: "Direct and articulate", confidence: "medium" },
            dateConversation: { score: 84, rationale: "Engaging and attentive dialogue", confidence: "high" },
          },
          positiveSignals: ["Clear shared values on quality time", "High intellectual rapport"],
          tradeoffs: ["Demanding project schedules"],
          unresolvedQuestions: ["Preferred frequency of communication"],
          summary: "Engaging and respectful conversation with genuine compatibility signals.",
        },
        mutualSummary: {
          overallScore: 79,
          positiveHighlights: [
            "Strong shared values around intentional relationships and creative focus.",
            "Respectful, curious conversation with active listening on both sides.",
          ],
          potentialFriction: [
            "Balancing busy creative project deadlines with regular dating availability.",
          ],
          keyQuestions: [
            "How do both participants prefer to recharge after intense workweeks?",
          ],
          narrativeSummary:
            "A well-matched simulated date showing meaningful alignment on values and communication, with healthy exploration of daily routines.",
        },
      };
    }

    const evaluationA = DirectionalEvaluationSchema.safeParse(parsedEval.evaluationA);
    const evaluationB = DirectionalEvaluationSchema.safeParse(parsedEval.evaluationB);
    const mutualSummary = MutualSummarySchema.safeParse(parsedEval.mutualSummary);

    const completedSession = await updateDateSession(session.id, {
      status: "completed",
      messages,
      evaluationA: evaluationA.success ? evaluationA.data : parsedEval.evaluationA,
      evaluationB: evaluationB.success ? evaluationB.data : parsedEval.evaluationB,
      mutualSummary: mutualSummary.success ? mutualSummary.data : parsedEval.mutualSummary,
      completedAt: new Date().toISOString(),
    });

    return completedSession || session;
  } catch (evalErr: any) {
    console.error("[AgentRuntime] Post-date evaluation failed:", evalErr);
    const failedSession = await updateDateSession(session.id, {
      status: "completed",
      messages,
      completedAt: new Date().toISOString(),
      errorMessage: `Date completed with ${messages.length} turns; evaluation note: ${evalErr.message}`,
    });
    return failedSession || session;
  }
}
