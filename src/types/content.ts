export interface MateriMeta {
  topik_id: string;
  kode_topik_lms: string;
  jenjang: string;
  fase: string;
  elemen: string;
  kode_cp: string;
  judul: string;
  subjudul?: string;
  breadcrumb?: string;
  estimasi_baca_menit?: number;
  sumber_kanon?: string[];
  tujuan_pembelajaran?: string;
  referensi_historis?: string;
  catatan_editorial?: string;
}

export type MateriBlock =
  | { type: "paragraf"; text: string }
  | { type: "highlight"; label: string; text: string }
  | { type: "fakta"; label: string; text: string }
  | { type: "refleksi"; label: string; pertanyaan: string; hint?: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "tokoh_card"; avatar: string; nama: string; detail: string };

export interface MateriSection {
  id: string;
  nav_label?: string;
  section_num?: string;
  judul: string;
  blocks: MateriBlock[];
}

export interface Materi {
  meta: MateriMeta;
  sections: MateriSection[];
}

export type OpsiKey = "a" | "b" | "c" | "d";

export interface SoalItem {
  id: string;
  pertanyaan: string;
  pemantik?: string;
  opsi: Record<OpsiKey, string>;
  jawaban_benar: OpsiKey;
  level_bloom: string;
  level_soal?: string;
  alasan_pengecoh?: Partial<Record<OpsiKey, string>>;
}

export interface SoalBank {
  topik_id: string;
  kode_topik_lms: string;
  instruksi: string;
  ukuran_bank: number;
  jumlah_tampil_per_attempt: number;
  catatan_desain?: string;
  bank: SoalItem[];
}

export type Kelas = "X" | "XI" | "XII";

export interface TopikRef {
  kelas: Kelas;
  nomor: number;
  kodeLms: string;
}

export type Elemen = "Sejarah" | "Ritual" | "Etika";

export interface SilabusEntry {
  kelas: string;
  semester: number;
  minggu: string;
  kodeTopik: string;
  judulSilabus: string;
  elemen: Elemen;
  kodeCp: string;
  jp: number;
  jmlPertemuan: number;
  levelBloom: string;
  spiralKonsep: string;
  catatanUrutan: string;
}
