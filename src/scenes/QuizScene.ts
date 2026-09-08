import Phaser from "phaser";
import { getTopik } from "../data/contentLoader";
import type { Kelas, OpsiKey, SoalItem } from "../types/content";
import { formatText } from "../systems/textFormat";
import { shuffle } from "../systems/shuffle";
import { showOverlay } from "../systems/overlay";

interface QuizData {
  kelas: Kelas;
  nomor: number;
}

const OPT_KEYS: OpsiKey[] = ["a", "b", "c", "d"];

export class QuizScene extends Phaser.Scene {
  private kelas!: Kelas;
  private nomor!: number;
  private questions: SoalItem[] = [];
  private index = 0;
  private correct = 0;
  private judul = "";

  constructor() {
    super("Quiz");
  }

  init(data: QuizData): void {
    this.kelas = data.kelas;
    this.nomor = data.nomor;
    this.index = 0;
    this.correct = 0;
  }

  create(): void {
    const entry = getTopik(this.kelas, this.nomor);
    if (!entry) {
      this.scene.start("TopikMap", { kelas: this.kelas });
      return;
    }
    const { soal } = entry;
    this.judul = entry.materi.meta.judul;
    const count = Math.min(soal.jumlah_tampil_per_attempt || 10, soal.bank.length);
    this.questions = shuffle(soal.bank).slice(0, count);
    this.renderQuestion();
  }

  private renderQuestion(): void {
    const q = this.questions[this.index];
    const total = this.questions.length;
    const pct = Math.round((this.index / total) * 100);

    const optionsHtml = OPT_KEYS.filter((k) => q.opsi[k] !== undefined)
      .map(
        (k) =>
          `<button class="quiz-option" data-key="${k}"><span class="opt-letter">${k.toUpperCase()}</span>${formatText(
            q.opsi[k],
          )}</button>`,
      )
      .join("");

    const html = `
      <div class="quiz-topbar">
        <button class="btn btn-secondary" id="btn-exit" style="padding:8px 16px;font-size:13px;">✕ Keluar</button>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        <span class="quiz-counter">${this.index + 1} / ${total}</span>
      </div>
      <div class="overlay-scroll">
        <div class="overlay-inner">
          <p style="font-size:12px;color:#a89b86;margin:16px 0 0;font-weight:700;text-transform:uppercase;">${formatText(
            this.judul,
          )}</p>
          ${q.pemantik ? `<p class="quiz-pemantik">${formatText(q.pemantik)}</p>` : ""}
          <p class="quiz-question">${formatText(q.pertanyaan)}</p>
          <div id="options">${optionsHtml}</div>
          <div id="feedback"></div>
          <div id="next-wrap" style="margin-top:18px;display:none;">
            <button class="btn btn-primary" id="btn-next">Lanjut →</button>
          </div>
        </div>
      </div>
    `;

    showOverlay(html);

    document.getElementById("btn-exit")?.addEventListener("click", () => {
      this.scene.start("TopikMap", { kelas: this.kelas });
    });

    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".quiz-option"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.handleAnswer(btn.dataset.key as OpsiKey, buttons));
    });
  }

  private handleAnswer(chosen: OpsiKey, buttons: HTMLButtonElement[]): void {
    const q = this.questions[this.index];
    const isCorrect = chosen === q.jawaban_benar;
    if (isCorrect) this.correct++;

    buttons.forEach((btn) => {
      btn.disabled = true;
      const key = btn.dataset.key as OpsiKey;
      if (key === q.jawaban_benar) btn.classList.add("correct");
      else if (key === chosen) btn.classList.add("wrong");
    });

    const feedbackEl = document.getElementById("feedback");
    if (feedbackEl) {
      const reason = q.alasan_pengecoh?.[chosen];
      feedbackEl.innerHTML = isCorrect
        ? `<div class="quiz-feedback correct">✅ Benar! ${reason ? formatText(reason) : "Kerja bagus."}</div>`
        : `<div class="quiz-feedback wrong">❌ Kurang tepat. ${
            reason ? formatText(reason) : `Jawaban yang benar: ${q.jawaban_benar.toUpperCase()}.`
          }</div>`;
    }

    const nextWrap = document.getElementById("next-wrap");
    if (nextWrap) nextWrap.style.display = "block";
    document.getElementById("btn-next")?.addEventListener("click", () => this.goNext());
  }

  private goNext(): void {
    this.index++;
    if (this.index >= this.questions.length) {
      this.scene.start("Result", {
        kelas: this.kelas,
        nomor: this.nomor,
        correct: this.correct,
        total: this.questions.length,
      });
      return;
    }
    this.renderQuestion();
  }
}
