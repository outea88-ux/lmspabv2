import Phaser from "phaser";
import { getProfile, saveProfile, hasProfile } from "../systems/student";
import { AVATAR_OPTIONS, AVATAR_BG_COLORS, DEFAULT_AVATAR_ICON, DEFAULT_AVATAR_BG } from "../systems/avatar";
import { renderLogoSvg } from "../systems/logo";
import type { Kelas } from "../types/content";
import { showOverlay } from "../systems/overlay";

const KELAS_OPTIONS: Kelas[] = ["X", "XI", "XII"];

interface BiodataData {
  forceEdit?: boolean;
}

export class BiodataScene extends Phaser.Scene {
  private selectedKelas: Kelas | null = null;
  private selectedAvatar = DEFAULT_AVATAR_ICON;
  private selectedAvatarBg = DEFAULT_AVATAR_BG;
  private isEdit = false;

  constructor() {
    super("Biodata");
  }

  create(data: BiodataData): void {
    if (!data?.forceEdit && hasProfile()) {
      this.scene.start("MainMenu");
      return;
    }

    const existing = getProfile();
    this.isEdit = existing !== null;
    this.selectedKelas = existing?.kelas ?? null;
    this.selectedAvatar = existing?.avatar ?? DEFAULT_AVATAR_ICON;
    this.selectedAvatarBg = existing?.avatarBg ?? DEFAULT_AVATAR_BG;

    this.render(existing?.nama ?? "", existing?.sekolah ?? "", existing?.rombel ?? "");
  }

  private render(nama: string, sekolah: string, rombel: string): void {
    const avatarButtons = AVATAR_OPTIONS.map(
      (a) =>
        `<button type="button" class="avatar-opt${a.icon === this.selectedAvatar ? " selected" : ""}" data-avatar="${a.icon}" title="${a.label}">${a.icon}</button>`,
    ).join("");

    const bgSwatches = AVATAR_BG_COLORS.map(
      (color) =>
        `<button type="button" class="avatar-bg-opt${color === this.selectedAvatarBg ? " selected" : ""}" data-color="${color}" style="background:${color};"></button>`,
    ).join("");

    const kelasButtons = KELAS_OPTIONS.map(
      (k) =>
        `<button type="button" class="kelas-opt${k === this.selectedKelas ? " selected" : ""}" data-kelas="${k}">Kelas ${k}</button>`,
    ).join("");

    const html = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div class="app-banner" style="text-align:center;">
          <div style="margin-bottom:12px;">${renderLogoSvg(64)}</div>
          <h1 class="app-banner-title" style="font-size:24px;">${this.isEdit ? "Ubah Profil" : "Selamat Datang di LMS PAB 🙏"}</h1>
          <p class="app-banner-subtitle" style="max-width:480px; margin-left:auto; margin-right:auto; font-weight:400;">${
            this.isEdit
              ? "Perbarui data belajarmu di bawah ini."
              : "Isi data singkat ini dulu ya, sebelum mulai petualangan belajarmu. Data ini hanya tersimpan di perangkatmu sendiri, tidak dikirim ke mana pun."
          }</p>
        </div>

        <div class="overlay-scroll">
        <div class="overlay-inner biodata-wrap" style="padding-top:26px;">
          <label class="field-label">Nama Lengkap</label>
          <input type="text" id="inp-nama" class="field-input" placeholder="Nama kamu" value="${escapeAttr(nama)}" />

          <label class="field-label">Kelas</label>
          <div class="kelas-opt-row">${kelasButtons}</div>

          <label class="field-label">Nama Sekolah</label>
          <input type="text" id="inp-sekolah" class="field-input" placeholder="Contoh: SMA Negeri 1 ..." value="${escapeAttr(sekolah)}" />

          <label class="field-label">Kelas / Rombel <span class="field-optional">(opsional)</span></label>
          <input type="text" id="inp-rombel" class="field-input" placeholder="Contoh: X IPA 2" value="${escapeAttr(rombel)}" />

          <label class="field-label">Pilih Avatar</label>
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:4px;">
            <div class="biodata-avatar-preview" id="avatar-preview" style="width:64px; height:64px; font-size:34px; line-height:64px; flex-shrink:0; background:${this.selectedAvatarBg};">${this.selectedAvatar}</div>
            <div class="avatar-row" style="flex:1;">${avatarButtons}</div>
          </div>

          <label class="field-label">Warna Latar Avatar</label>
          <div class="avatar-bg-row">${bgSwatches}</div>

          <p class="field-error" id="form-error" style="display:none;"></p>

          <div class="result-actions" style="margin-top:22px;">
            <button class="btn btn-primary" id="btn-submit">${this.isEdit ? "Simpan Perubahan" : "Mulai Belajar →"}</button>
            ${this.isEdit ? `<button class="btn btn-secondary" id="btn-cancel">Batal</button>` : ""}
          </div>
        </div>
        </div>
      </div>
    `;

    showOverlay(html);
    this.bindEvents();
  }

  private bindEvents(): void {
    document.querySelectorAll<HTMLButtonElement>(".kelas-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedKelas = btn.dataset.kelas as Kelas;
        this.render(
          (document.getElementById("inp-nama") as HTMLInputElement).value,
          (document.getElementById("inp-sekolah") as HTMLInputElement).value,
          (document.getElementById("inp-rombel") as HTMLInputElement).value,
        );
      });
    });

    document.querySelectorAll<HTMLButtonElement>(".avatar-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedAvatar = btn.dataset.avatar ?? DEFAULT_AVATAR_ICON;
        const preview = document.getElementById("avatar-preview");
        if (preview) preview.textContent = this.selectedAvatar;
        document.querySelectorAll(".avatar-opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

    document.querySelectorAll<HTMLButtonElement>(".avatar-bg-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedAvatarBg = btn.dataset.color ?? DEFAULT_AVATAR_BG;
        const preview = document.getElementById("avatar-preview");
        if (preview) preview.style.background = this.selectedAvatarBg;
        document.querySelectorAll(".avatar-bg-opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

    document.getElementById("btn-submit")?.addEventListener("click", () => {
      const namaVal = (document.getElementById("inp-nama") as HTMLInputElement).value.trim();
      const sekolahVal = (document.getElementById("inp-sekolah") as HTMLInputElement).value.trim();
      const rombelVal = (document.getElementById("inp-rombel") as HTMLInputElement).value.trim();
      const errorEl = document.getElementById("form-error");

      if (!namaVal || !this.selectedKelas || !sekolahVal) {
        if (errorEl) {
          errorEl.textContent = "Nama, Kelas, dan Nama Sekolah wajib diisi ya.";
          errorEl.style.display = "block";
        }
        return;
      }

      saveProfile({
        nama: namaVal,
        kelas: this.selectedKelas,
        sekolah: sekolahVal,
        rombel: rombelVal || undefined,
        avatar: this.selectedAvatar,
        avatarBg: this.selectedAvatarBg,
      });

      this.scene.start("MainMenu");
    });

    document.getElementById("btn-cancel")?.addEventListener("click", () => {
      this.scene.start("MainMenu");
    });
  }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
