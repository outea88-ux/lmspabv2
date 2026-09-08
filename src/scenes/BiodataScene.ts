import Phaser from "phaser";
import { getProfile, saveProfile, hasProfile } from "../systems/student";
import type { Kelas } from "../types/content";
import { showOverlay } from "../systems/overlay";

const AVATARS = ["🪷", "🧘", "📿", "🙏", "✨", "🌸", "🕊️", "⭐"];
const KELAS_OPTIONS: Kelas[] = ["X", "XI", "XII"];

interface BiodataData {
  forceEdit?: boolean;
}

export class BiodataScene extends Phaser.Scene {
  private selectedKelas: Kelas | null = null;
  private selectedAvatar = AVATARS[0];
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
    this.selectedAvatar = existing?.avatar ?? AVATARS[0];

    this.render(existing?.nama ?? "", existing?.sekolah ?? "", existing?.rombel ?? "");
  }

  private render(nama: string, sekolah: string, rombel: string): void {
    const avatarButtons = AVATARS.map(
      (a) =>
        `<button type="button" class="avatar-opt${a === this.selectedAvatar ? " selected" : ""}" data-avatar="${a}">${a}</button>`,
    ).join("");

    const kelasButtons = KELAS_OPTIONS.map(
      (k) =>
        `<button type="button" class="kelas-opt${k === this.selectedKelas ? " selected" : ""}" data-kelas="${k}">Kelas ${k}</button>`,
    ).join("");

    const html = `
      <div class="overlay-scroll">
        <div class="overlay-inner biodata-wrap">
          <div class="biodata-hero">
            <div class="biodata-avatar-preview" id="avatar-preview">${this.selectedAvatar}</div>
            <h1 class="materi-title" style="color:#7a1f2b;">${this.isEdit ? "Ubah Profil" : "Selamat Datang! 🙏"}</h1>
            <p class="quiz-pemantik" style="margin-top:4px;">${
              this.isEdit
                ? "Perbarui data belajarmu di bawah ini."
                : "Isi data singkat ini dulu ya, sebelum mulai petualangan belajarmu. Data ini hanya tersimpan di perangkatmu sendiri, tidak dikirim ke mana pun."
            }</p>
          </div>

          <label class="field-label">Nama Lengkap</label>
          <input type="text" id="inp-nama" class="field-input" placeholder="Nama kamu" value="${escapeAttr(nama)}" />

          <label class="field-label">Kelas</label>
          <div class="kelas-opt-row">${kelasButtons}</div>

          <label class="field-label">Nama Sekolah</label>
          <input type="text" id="inp-sekolah" class="field-input" placeholder="Contoh: SMA Negeri 1 ..." value="${escapeAttr(sekolah)}" />

          <label class="field-label">Kelas / Rombel <span class="field-optional">(opsional)</span></label>
          <input type="text" id="inp-rombel" class="field-input" placeholder="Contoh: X IPA 2" value="${escapeAttr(rombel)}" />

          <label class="field-label">Pilih Avatar</label>
          <div class="avatar-row">${avatarButtons}</div>

          <p class="field-error" id="form-error" style="display:none;"></p>

          <div class="result-actions" style="margin-top:22px;">
            <button class="btn btn-primary" id="btn-submit">${this.isEdit ? "Simpan Perubahan" : "Mulai Belajar →"}</button>
            ${this.isEdit ? `<button class="btn btn-secondary" id="btn-cancel">Batal</button>` : ""}
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
        this.selectedAvatar = btn.dataset.avatar ?? AVATARS[0];
        const preview = document.getElementById("avatar-preview");
        if (preview) preview.textContent = this.selectedAvatar;
        document.querySelectorAll(".avatar-opt").forEach((b) => b.classList.remove("selected"));
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
