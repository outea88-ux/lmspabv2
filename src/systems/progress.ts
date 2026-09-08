import type { Kelas } from "../types/content";

export interface TopikProgress {
  completed: boolean;
  bestScoreCorrect: number;
  bestScoreTotal: number;
  stars: number;
  xp: number;
  attempts: number;
}

interface ProgressState {
  topik: Record<string, TopikProgress>;
}

const STORAGE_KEY = "pab-progress-v1";

function topikKey(kelas: Kelas, nomor: number): string {
  return `${kelas}-${nomor}`;
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressState;
  } catch {
    // corrupted storage, fall through to fresh state
  }
  return { topik: {} };
}

function saveState(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — progress just won't persist
  }
}

let state = loadState();

export function getTopikProgress(kelas: Kelas, nomor: number): TopikProgress | undefined {
  return state.topik[topikKey(kelas, nomor)];
}

function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

export interface QuizResult {
  progress: TopikProgress;
  xpGained: number;
}

export function recordQuizResult(
  kelas: Kelas,
  nomor: number,
  correct: number,
  total: number,
): QuizResult {
  const key = topikKey(kelas, nomor);
  const existing = state.topik[key];
  const stars = starsFor(correct, total);
  const xpGained = correct * 10 + stars * 20;

  const updated: TopikProgress = {
    completed: stars >= 1 || existing?.completed === true,
    bestScoreCorrect: Math.max(existing?.bestScoreCorrect ?? 0, correct),
    bestScoreTotal: total,
    stars: Math.max(existing?.stars ?? 0, stars),
    xp: (existing?.xp ?? 0) + xpGained,
    attempts: (existing?.attempts ?? 0) + 1,
  };

  state.topik[key] = updated;
  saveState(state);
  return { progress: updated, xpGained };
}

export function isTopikUnlocked(kelas: Kelas, nomor: number): boolean {
  if (nomor <= 1) return true;
  const prev = getTopikProgress(kelas, nomor - 1);
  return prev?.completed === true;
}

export function getTotalXp(): number {
  return Object.values(state.topik).reduce((sum, t) => sum + t.xp, 0);
}

export function getTotalStars(): number {
  return Object.values(state.topik).reduce((sum, t) => sum + t.stars, 0);
}

export function resetProgress(): void {
  state = { topik: {} };
  saveState(state);
}
