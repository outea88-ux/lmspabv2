import Phaser from "phaser";
import { getTopik } from "../data/contentLoader";
import type { Kelas, MateriBlock } from "../types/content";
import { formatText } from "../systems/textFormat";
import { showOverlay } from "../systems/overlay";
import { ELEMEN_THEME } from "../systems/elemenTheme";
import { initAutoHideHeader } from "../systems/autoHideHeader";

interface MateriData {
  kelas: Kelas;
  nomor: number;
}

function renderBlock(block: MateriBlock): string {
  switch (block.type) {
    case "paragraf":
      return `<p class="block-paragraf">${formatText(block.text)}</p>`;
    case "highlight":
      return `<div class="block-highlight"><p class="block-label">💡 ${formatText(block.label)}</p><p class="block-text">${formatText(block.text)}</p></div>`;
    case "fakta":
      return `<div class="block-fakta"><p class="block-label">📖 ${formatText(block.label)}</p><p class="block-text">${formatText(block.text)}</p></div>`;
    case "refleksi":
      return `<div class="block-refleksi"><p class="block-label">🧘 ${formatText(block.label)}</p><p class="block-text">${formatText(block.pertanyaan)}</p>${
        block.hint ? `<p class="block-hint">${formatText(block.hint)}</p>` : ""
      }</div>`;
    case "bullet_list":
      return `<ul class="block-bullet-list">${block.items
        .map((item) => `<li>${formatText(item)}</li>`)
        .join("")}</ul>`;
    case "tokoh_card":
      return `<div class="tokoh-card"><div class="tokoh-avatar">${block.avatar}</div><div><p class="tokoh-nama">${formatText(
        block.nama,
      )}</p><p class="tokoh-detail">${formatText(block.detail)}</p></div></div>`;
    default:
      return "";
  }
}

export class MateriScene extends Phaser.Scene {
  private kelas!: Kelas;
  private nomor!: number;

  constructor() {
    super("Materi");
  }

  init(data: MateriData): void {
    this.kelas = data.kelas;
    this.nomor = data.nomor;
  }

  create(): void {
    const entry = getTopik(this.kelas, this.nomor);
    if (!entry) {
      this.scene.start("TopikMap", { kelas: this.kelas });
      return;
    }
    const { meta, sections } = entry.materi;
    const { silabus } = entry;
    const theme = ELEMEN_THEME[meta.elemen as keyof typeof ELEMEN_THEME];

    const sectionsHtml = sections
      .map(
        (s) =>
          `<div class="section-block"><h2 class="section-title">${formatText(s.section_num ?? "")} ${formatText(
            s.judul,
          )}</h2>${s.blocks.map(renderBlock).join("")}</div>`,
      )
      .join("");

    const tujuanHtml = meta.tujuan_pembelajaran
      ? `<div class="block-highlight"><p class="block-label">🎯 Tujuan Pembelajaran</p><p class="block-text">${formatText(
          meta.tujuan_pembelajaran,
        )}</p></div>`
      : "";

    const konteksHtml = silabus?.catatanUrutan
      ? `<div class="block-fakta"><p class="block-label">🧭 Kenapa Topik Ini Sekarang?</p><p class="block-text">${formatText(
          silabus.catatanUrutan,
        )}</p></div>`
      : "";

    const html = `
      <div class="materi-header scene-banner-fixed">
        <p class="materi-breadcrumb">← ${formatText(meta.breadcrumb ?? "")}</p>
        <h1 class="materi-title">${formatText(meta.judul)}</h1>
        ${meta.subjudul ? `<p class="materi-subtitle">${formatText(meta.subjudul)}</p>` : ""}
        <div class="materi-meta-row">
          <span class="materi-chip">${theme?.emoji ?? "📚"} ${formatText(meta.elemen)}</span>
          ${silabus?.kodeCp ? `<span class="materi-chip">🧩 CP ${formatText(silabus.kodeCp)}</span>` : ""}
          ${silabus?.jp ? `<span class="materi-chip">📅 ${silabus.jp} JP</span>` : ""}
          <span class="materi-chip">⏱️ ${meta.estimasi_baca_menit ?? "?"} menit baca</span>
        </div>
      </div>
      <div class="overlay-scroll">
        <div class="overlay-inner">
          ${tujuanHtml}
          ${konteksHtml}
          ${sectionsHtml}
        </div>
      </div>
      <div class="overlay-footer">
        <button class="btn btn-primary" id="btn-back">← Peta</button>
        <div style="width:12px"></div>
        <button class="btn" id="btn-quiz">Lanjut ke Kuis →</button>
      </div>
    `;

    showOverlay(html);
    initAutoHideHeader(".materi-header", ".overlay-scroll");

    document.getElementById("btn-back")?.addEventListener("click", () => {
      this.scene.start("TopikMap", { kelas: this.kelas });
    });
    document.getElementById("btn-quiz")?.addEventListener("click", () => {
      this.scene.start("Quiz", { kelas: this.kelas, nomor: this.nomor });
    });
  }
}
