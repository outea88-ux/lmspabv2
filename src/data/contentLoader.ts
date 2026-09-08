import type { Kelas, Materi, SilabusEntry, SoalBank } from "../types/content";
import silabusData from "./silabus.json";

const silabusByKode = silabusData as unknown as Record<string, SilabusEntry>;

const materiModules = import.meta.glob<Materi>("./content/*/materi_*.json", {
  eager: true,
  import: "default",
});
const soalModules = import.meta.glob<SoalBank>("./content/*/soal_*.json", {
  eager: true,
  import: "default",
});

function parsePath(path: string): { kelas: Kelas; nomor: number } | null {
  const match = path.match(/kelas(X|XI|XII)_topik(\d+)\.json$/);
  if (!match) return null;
  return { kelas: match[1] as Kelas, nomor: Number(match[2]) };
}

interface TopikEntry {
  kelas: Kelas;
  nomor: number;
  materi: Materi;
  soal: SoalBank;
  silabus?: SilabusEntry;
}

const registry: Record<Kelas, TopikEntry[]> = { X: [], XI: [], XII: [] };

for (const [path, materi] of Object.entries(materiModules)) {
  const parsed = parsePath(path);
  if (!parsed) continue;
  const soalPath = path.replace("materi_", "soal_");
  const soal = soalModules[soalPath];
  if (!soal) {
    console.warn(`Soal tidak ditemukan untuk ${path}`);
    continue;
  }
  const silabus = silabusByKode[materi.meta.topik_id];
  registry[parsed.kelas].push({ ...parsed, materi, soal, silabus });
}

for (const kelas of Object.keys(registry) as Kelas[]) {
  registry[kelas].sort((a, b) => a.nomor - b.nomor);
}

export function getTopikList(kelas: Kelas): TopikEntry[] {
  return registry[kelas];
}

export function getTopik(kelas: Kelas, nomor: number): TopikEntry | undefined {
  return registry[kelas].find((t) => t.nomor === nomor);
}

export function getKelasList(): Kelas[] {
  return (["X", "XI", "XII"] as Kelas[]).filter((k) => registry[k].length > 0);
}

export type { TopikEntry };
