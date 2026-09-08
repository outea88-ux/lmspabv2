import Phaser from "phaser";
import { getTopikList } from "../data/contentLoader";
import { getTopikProgress, isTopikUnlocked, getTotalXp, getTotalStars } from "../systems/progress";
import { getProfile } from "../systems/student";
import type { Elemen, Kelas } from "../types/content";
import type { TopikEntry } from "../data/contentLoader";
import { ELEMEN_THEME } from "../systems/elemenTheme";
import { showOverlay } from "../systems/overlay";

interface TopikMapData {
  kelas: Kelas;
}

const KELAS_LABEL: Record<Kelas, string> = {
  X: "Kelas X",
  XI: "Kelas XI",
  XII: "Kelas XII",
};

const KELAS_FASE: Record<Kelas, string> = {
  X: "Fase E",
  XI: "Fase F",
  XII: "Fase F",
};

interface ElemenGroup {
  elemen: Elemen;
  topics: TopikEntry[];
}

function groupByElemen(topics: TopikEntry[]): ElemenGroup[] {
  const groups: ElemenGroup[] = [];
  for (const t of topics) {
    const elemen = (t.silabus?.elemen ?? t.materi.meta.elemen) as Elemen;
    let group = groups.find((g) => g.elemen === elemen);
    if (!group) {
      group = { elemen, topics: [] };
      groups.push(group);
    }
    group.topics.push(t);
  }
  return groups;
}

export class TopikMapScene extends Phaser.Scene {
  private kelas!: Kelas;

  constructor() {
    super("TopikMap");
  }

  init(data: TopikMapData): void {
    this.kelas = data.kelas;
  }

  create(): void {
    const topics = getTopikList(this.kelas);
    const groups = groupByElemen(topics);
    const profile = getProfile();
    const totalXp = getTotalXp();
    const totalStars = getTotalStars();
    const completedCount = topics.filter((t) => getTopikProgress(this.kelas, t.nomor)?.completed).length;
    const overallPct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

    const groupsHtml = groups.map((g) => this.renderGroup(g)).join("");

    const html = `
      <div class="map-page" style="display:flex; flex-direction:column; height:100%;">
        <div class="app-banner">
          <div class="app-banner-row">
            <button class="icon-btn" id="btn-back">← Menu</button>
            <div style="text-align:center;">
              <h1 class="app-banner-title">Peta Belajar — ${KELAS_LABEL[this.kelas]}</h1>
              <p class="app-banner-subtitle">${KELAS_FASE[this.kelas]} · Pendidikan Agama Buddha</p>
            </div>
            <div class="stat-pill">⭐ ${totalStars} · ✨ ${totalXp} XP</div>
          </div>
        </div>

        ${
          profile
            ? `<div class="info-bar">
                <div class="info-icon-circle" style="background:${profile.avatarBg};">${profile.avatar}</div>
                <div style="flex-shrink:0;">
                  <p class="info-label">Nama</p>
                  <p class="info-value">${escapeHtml(profile.nama)}</p>
                </div>
                <div class="info-divider"></div>
                <div style="flex-shrink:0;">
                  <p class="info-label">Sekolah</p>
                  <p class="info-value">${escapeHtml(profile.sekolah)}${profile.rombel ? ` · ${escapeHtml(profile.rombel)}` : ""}</p>
                </div>
                <div class="info-divider" style="margin-left:auto;"></div>
                <div style="flex:1; min-width:120px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span class="info-label">Progres</span>
                    <span class="info-label">${completedCount}/${topics.length}</span>
                  </div>
                  <div class="progress-track"><div class="progress-fill" style="width:${overallPct}%"></div></div>
                </div>
                <button class="btn btn-secondary" id="btn-edit-profile" style="padding:9px 16px; font-size:12.5px; flex-shrink:0;">✎ Ubah Profil</button>
              </div>`
            : ""
        }

        <div class="overlay-scroll" style="margin-top:6px;">
          ${groupsHtml}

          <div class="footer-stats" style="margin-bottom:0;">
            <div class="footer-stat">
              <div class="footer-stat-icon">✨</div>
              <p class="footer-stat-value">${totalXp}</p>
              <p class="footer-stat-label">Total XP</p>
            </div>
            <div class="footer-stat">
              <div class="footer-stat-icon">⭐</div>
              <p class="footer-stat-value">${totalStars}</p>
              <p class="footer-stat-label">Bintang</p>
            </div>
            <div class="footer-stat">
              <div class="footer-stat-icon">📘</div>
              <p class="footer-stat-value">${completedCount}/${topics.length}</p>
              <p class="footer-stat-label">Topik Selesai</p>
            </div>
          </div>

          <div class="bottom-banner">
            💡 Semangat belajar, raih kebijaksanaan untuk hidup yang lebih baik! ⭐
          </div>
          <div style="height:24px;"></div>
        </div>
      </div>
    `;

    showOverlay(html);

    document.getElementById("btn-back")?.addEventListener("click", () => {
      this.scene.start("MainMenu");
    });
    document.getElementById("btn-edit-profile")?.addEventListener("click", () => {
      this.scene.start("Biodata", { forceEdit: true });
    });

    document.querySelectorAll<HTMLElement>(".topik-row.clickable").forEach((row) => {
      row.addEventListener("click", () => {
        const nomor = Number(row.dataset.nomor);
        this.scene.start("Materi", { kelas: this.kelas, nomor });
      });
    });
  }

  private renderGroup(group: ElemenGroup): string {
    const theme = ELEMEN_THEME[group.elemen];
    const kodeCp = group.topics[0]?.silabus?.kodeCp;
    const totalJp = group.topics.reduce((sum, t) => sum + (t.silabus?.jp ?? 0), 0);
    const doneCount = group.topics.filter((t) => getTopikProgress(this.kelas, t.nomor)?.completed).length;

    const rowsHtml = group.topics.map((t) => this.renderTopikRow(t)).join("");

    return `
      <div class="elemen-card">
        <div class="elemen-tab">
          <div class="elemen-tab-icon">${theme.emoji}</div>
          <div class="elemen-tab-label">${theme.label}</div>
        </div>
        <div class="elemen-body">
          <div class="elemen-body-head">
            <div>
              <h2 style="margin:0; font-family:var(--font-head); font-weight:700; font-size:16px; color:var(--navy);">${theme.label}</h2>
              <p class="elemen-meta">${kodeCp ? `CP ${kodeCp} · ` : ""}${totalJp} JP · ${group.topics.length} topik</p>
            </div>
            <div class="elemen-progress-badge">${doneCount} / ${group.topics.length} selesai</div>
          </div>
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  private renderTopikRow(t: TopikEntry): string {
    const unlocked = isTopikUnlocked(this.kelas, t.nomor);
    const progress = getTopikProgress(this.kelas, t.nomor);
    const done = progress?.completed ?? false;

    const iconState = done ? "state-done" : unlocked ? "state-open" : "state-locked";
    const iconContent = done ? "✓" : unlocked ? String(t.nomor) : "🔒";

    const statusHtml = done
      ? `<span style="color:var(--orange-dark); font-weight:700;">${"★".repeat(progress?.stars ?? 0)}${"☆".repeat(3 - (progress?.stars ?? 0))}</span>`
      : unlocked
        ? `<span style="color:var(--navy); font-weight:700;">Mulai →</span>`
        : `<span style="color:var(--ink-soft);">Terkunci</span>`;

    return `
      <div class="topik-row ${unlocked ? "clickable" : ""}" ${unlocked ? `data-nomor="${t.nomor}"` : ""}>
        <div class="topik-icon-box ${iconState}">${iconContent}</div>
        <div class="topik-info">
          <p class="topik-title ${unlocked ? "" : "locked"}">${escapeHtml(t.materi.meta.judul)}</p>
          <div class="topik-badges">
            ${t.silabus?.kodeTopik ? `<span class="topik-badge code">${t.silabus.kodeTopik}</span>` : ""}
            ${t.silabus?.jp ? `<span class="topik-badge">${t.silabus.jp} JP</span>` : ""}
          </div>
        </div>
        <div class="topik-status">${statusHtml}</div>
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
