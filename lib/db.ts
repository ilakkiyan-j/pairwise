import fs from "fs/promises";
import path from "path";
import {
  Participant,
  DateSession,
  CandidateRanking,
  ProfileAnalysis,
} from "./schemas";

interface DatabaseStore {
  participants: Participant[];
  dateSessions: DateSession[];
  rankings: CandidateRanking[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "pairwise-store.json");

const INITIAL_STORE: DatabaseStore = {
  participants: [],
  dateSessions: [],
  rankings: [],
};

let memoryStore: DatabaseStore | null = null;
let writeQueue = Promise.resolve();

async function ensureDataFile(): Promise<DatabaseStore> {
  if (memoryStore) return memoryStore;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(STORE_PATH, "utf-8");
    memoryStore = JSON.parse(content);
    return memoryStore!;
  } catch (error) {
    // If file doesn't exist, create it with initial store
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(INITIAL_STORE, null, 2), "utf-8");
    memoryStore = { ...INITIAL_STORE };
    return memoryStore;
  }
}

async function persistStore(): Promise<void> {
  if (!memoryStore) return;
  // Queue writes sequentially to prevent file corruption
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tempPath = `${STORE_PATH}.tmp.${Date.now()}`;
      await fs.writeFile(tempPath, JSON.stringify(memoryStore, null, 2), "utf-8");
      await fs.rename(tempPath, STORE_PATH);
    } catch (err) {
      console.error("[Database] Failed to persist store to disk:", err);
    }
  });
  await writeQueue;
}

// --- Participant Operations ---
export async function getParticipants(filterActive = true): Promise<Participant[]> {
  const store = await ensureDataFile();
  if (filterActive) {
    return store.participants.filter((p) => p.status === "active");
  }
  return store.participants;
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const store = await ensureDataFile();
  const participant = store.participants.find((p) => p.id === id);
  return participant || null;
}

export async function findParticipantByUrls(
  linkedinUrl: string,
  instagramUrl: string
): Promise<Participant | null> {
  const store = await ensureDataFile();
  const normalize = (u: string) =>
    u.trim().toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, "");

  const normLinkedIn = normalize(linkedinUrl);
  const normInstagram = normalize(instagramUrl);

  const found = store.participants.find(
    (p) =>
      p.status === "active" &&
      (normalize(p.linkedinUrl) === normLinkedIn || normalize(p.instagramUrl) === normInstagram)
  );

  return found || null;
}

export async function createParticipant(
  data: Omit<Participant, "id" | "createdAt" | "updatedAt">
): Promise<Participant> {
  const store = await ensureDataFile();
  const now = new Date().toISOString();
  const newParticipant: Participant = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  store.participants.unshift(newParticipant);
  await persistStore();
  return newParticipant;
}

export async function updateParticipant(
  id: string,
  updates: Partial<Omit<Participant, "id" | "createdAt">>
): Promise<Participant | null> {
  const store = await ensureDataFile();
  const index = store.participants.findIndex((p) => p.id === id);
  if (index === -1) return null;

  store.participants[index] = {
    ...store.participants[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await persistStore();
  return store.participants[index];
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const store = await ensureDataFile();
  const index = store.participants.findIndex((p) => p.id === id);
  if (index === -1) return false;

  // Soft delete or remove participant
  store.participants[index].status = "deleted";
  store.participants[index].updatedAt = new Date().toISOString();

  // Invalidate dependent rankings and dates per data deletion policy
  store.rankings = store.rankings.filter(
    (r) => r.participantId !== id && r.candidateId !== id
  );

  await persistStore();
  return true;
}

// --- Date Session Operations ---
export async function getDateSessions(): Promise<DateSession[]> {
  const store = await ensureDataFile();
  return store.dateSessions;
}

export async function getDateSessionById(id: string): Promise<DateSession | null> {
  const store = await ensureDataFile();
  return store.dateSessions.find((d) => d.id === id) || null;
}

export async function createDateSession(
  participantAId: string,
  participantBId: string
): Promise<DateSession> {
  const store = await ensureDataFile();
  const newSession: DateSession = {
    id: crypto.randomUUID(),
    participantAId,
    participantBId,
    status: "running",
    messages: [],
    startedAt: new Date().toISOString(),
  };

  store.dateSessions.unshift(newSession);
  await persistStore();
  return newSession;
}

export async function updateDateSession(
  id: string,
  updates: Partial<Omit<DateSession, "id" | "participantAId" | "participantBId">>
): Promise<DateSession | null> {
  const store = await ensureDataFile();
  const index = store.dateSessions.findIndex((d) => d.id === id);
  if (index === -1) return null;

  store.dateSessions[index] = {
    ...store.dateSessions[index],
    ...updates,
  };

  await persistStore();
  return store.dateSessions[index];
}

// --- Rankings Operations ---
export async function getRankingsForParticipant(participantId: string): Promise<CandidateRanking[]> {
  const store = await ensureDataFile();
  return store.rankings.filter((r) => r.participantId === participantId);
}

export async function saveRankingsForParticipant(
  participantId: string,
  rankings: CandidateRanking[]
): Promise<void> {
  const store = await ensureDataFile();
  // Remove existing rankings for this participant
  store.rankings = store.rankings.filter((r) => r.participantId !== participantId);
  // Add new rankings
  store.rankings.push(...rankings);
  await persistStore();
}

// Reset store for tests or seed reload
export async function resetDatabase(newStore?: DatabaseStore): Promise<void> {
  memoryStore = newStore || { ...INITIAL_STORE };
  await persistStore();
}
