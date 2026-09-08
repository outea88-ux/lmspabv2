import Phaser from "phaser";
import { getKelasList, getTopikList } from "../data/contentLoader";
import { getTotalStars, getTotalXp } from "../systems/progress";
import { getProfile } from "../systems/student";
import type { Kelas } from "../types/content";
import { showOverlay } from "../systems/overlay";

const KELAS_LABEL: Record<Kelas, string> = {
  X: "Kelas X",
  XI: "Kelas XI",
  XII: "Kelas XII",
};

const KELAS_DESC: Record<Kelas, string> = {
  X: "Fase E · Sejarah, Meditasi & Etika Dasar",
  XI: "Fase F · Sejarah Lanjut & Ritual",
  XII: "Fase F · Etika & Filosofi Mendalam",
};

const KELAS_ICON: Record<Kelas, string> = {
  X: "📜",
  XI: "🧘",
  XII: "⚖️",
};

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create(): void {
    const profile = getProfile();
    const totalXp = getTotalXp();
    const totalStars = getTotalStars();
    const kelasList = getKelasList();

    const cardsHtml = kelasList
      .map((kelas) => this.renderKelasCard(kelas, kelas === profile?.kelas))
      .join("");

    const html = `
      <div class="menu-page" style="display:flex; flex-direction:column; height:100%;">
        <div class="app-banner">
          <div class="app-banner-row">
            ${
              profile
                ? `<button class="icon-btn" id="btn-profile">${profile.avatar} ${escapeHtml(profile.nama)} ✎</button>`
                : `<div></div>`
            }
            <div style="text-align:center;">
              <h1 class="app-banner-title" style="font-size:26px;">Jalan Dhamma</h1>
              <p class="app-banner-subtitle">Petualangan Belajar Pendidikan Agama Buddha</p>
            </div>
            <div class="stat-pill">⭐ ${totalStars} · ✨ ${totalXp} XP</div>
          </div>
        </div>

        <div class="overlay-scroll">
          <div class="kelas-card-row" style="margin-top:32px;">
            ${cardsHtml}
          </div>

          <div class="bottom-banner" style="margin-top:32px;">
            🪷 Dibuat untuk siswa SMA/SMK · Pendidikan Agama Buddha
          </div>
          <div style="height:24px;"></div>
        </div>
      </div>
    `;

    showOverlay(html);

    document.getElementById("btn-profile")?.addEventListener("click", () => {
      this.scene.start("Biodata", { forceEdit: true });
    });

    document.querySelectorAll<HTMLElement>(".kelas-card").forEach((card) => {
      card.addEventListener("click", () => {
        const kelas = card.dataset.kelas as Kelas;
        this.scene.start("TopikMap", { kelas });
      });
    });
  }

  private renderKelasCard(kelas: Kelas, isOwnKelas: boolean): string {
    const topics = getTopikList(kelas);
    return `
      <div class="kelas-card ${isOwnKelas ? "own" : ""}" data-kelas="${kelas}">
        ${isOwnKelas ? `<div class="kelas-card-badge">KELASMU</div>` : ""}
        <div class="kelas-card-icon">${KELAS_ICON[kelas]}</div>
        <h2 class="kelas-card-title">${KELAS_LABEL[kelas]}</h2>
        <p class="kelas-card-desc">${KELAS_DESC[kelas]}</p>
        <div class="kelas-card-count">${topics.length} Topik</div>
      </div>
    `;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
