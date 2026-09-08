import type { Kelas } from "../types/content";

export interface StudentProfile {
  nama: string;
  kelas: Kelas;
  sekolah: string;
  rombel?: string;
  avatar: string;
}

const STORAGE_KEY = "pab-profile-v1";

export function getProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable (private mode, quota) — profile just won't persist
  }
}

export function hasProfile(): boolean {
  return getProfile() !== null;
}
