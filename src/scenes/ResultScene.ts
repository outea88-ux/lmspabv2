import Phaser from "phaser";
import { getTopik, getTopikList } from "../data/contentLoader";
import { recordQuizResult } from "../systems/progress";
import type { Kelas } from "../types/content";
import { showOverlay } from "../systems/overlay";

interface ResultData {
  kelas: Kelas;
  nomor: number;
  correct: number;
  total: number;
}

const MESSAGES: Record<number, { title: string; note: string }> = {
  3: { title: "Luar Biasa! 🎉", note: "Pemahamanmu sangat mendalam." },
  2: { title: "Bagus Sekali! 👏", note: "Sedikit lagi menuju sempurna." },
  1: { title: "Lumayan! 🙂", note: "Coba baca ulang materinya, lalu ulangi kuis." },
  0: { title: "Ayo Coba Lagi 💪", note: "Baca ulang materinya dan jangan menyerah." },
};

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("Result");
  }

  create(data: ResultData): void {
    const { kelas, nomor, correct, total } = data;
    const { progress, xpGained } = recordQuizResult(kelas, nomor, correct, total);
    const topics = getTopikList(kelas);
    const isLast = nomor >= topics.length;
    const nextEntry = !isLast && progress.completed ? getTopik(kelas, nomor + 1) : undefined;
    const msg = MESSAGES[progress.stars];

    const html = `
      <div class="overlay-scroll">
        <div class="overlay-inner result-wrap">
          <div class="result-stars">${"⭐".repeat(progress.stars)}${"☆".repeat(3 - progress.stars)}</div>
          <h1 class="result-title">${msg.title}</h1>
          <p class="result-score">Skor: ${correct} dari ${total} benar</p>
          <p class="result-xp">+${xpGained} XP</p>
          <p class="result-score">${msg.note}</p>
          ${
            !isLast && !progress.completed
              ? `<p class="result-score">🔒 Jawab minimal separuh benar untuk membuka topik berikutnya.</p>`
              : ""
          }
          <div class="result-actions" style="margin-top:24px;">
            <button class="btn btn-secondary" id="btn-repeat">🔁 Ulangi Kuis</button>
            <button class="btn btn-primary" id="btn-map">🗺️ Peta Topik</button>
            ${nextEntry ? `<button class="btn" id="btn-next">Topik Berikutnya →</button>` : ""}
          </div>
        </div>
      </div>
    `;

    showOverlay(html);

    document.getElementById("btn-repeat")?.addEventListener("click", () => {
      this.scene.start("Quiz", { kelas, nomor });
    });
    document.getElementById("btn-map")?.addEventListener("click", () => {
      this.scene.start("TopikMap", { kelas });
    });
    document.getElementById("btn-next")?.addEventListener("click", () => {
      this.scene.start("Materi", { kelas, nomor: nomor + 1 });
    });
  }
}
