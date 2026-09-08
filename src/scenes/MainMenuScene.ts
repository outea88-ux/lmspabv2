import Phaser from "phaser";
import { getKelasList, getTopikList } from "../data/contentLoader";
import { getTotalStars, getTotalXp } from "../systems/progress";
import type { Kelas } from "../types/content";
import { hideOverlay } from "../systems/overlay";

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

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create(): void {
    hideOverlay();
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0xfdf6e8).setOrigin(0);
    this.drawTempleBackdrop(width, height);

    this.add
      .text(width / 2, 70, "Jalan Dhamma", {
        fontFamily: "Baloo 2",
        fontSize: "44px",
        color: "#7a1f2b",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 112, "Petualangan Belajar Pendidikan Agama Buddha", {
        fontFamily: "Nunito",
        fontSize: "17px",
        color: "#6b5847",
      })
      .setOrigin(0.5);

    const totalXp = getTotalXp();
    const totalStars = getTotalStars();
    this.add
      .text(width - 24, 24, `⭐ ${totalStars}   ✨ ${totalXp} XP`, {
        fontFamily: "Baloo 2",
        fontSize: "16px",
        color: "#8a6414",
        backgroundColor: "#fbeecb",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0)
      .setDepth(5);

    const kelasList = getKelasList();
    const cardWidth = 260;
    const gap = 30;
    const totalWidth = kelasList.length * cardWidth + (kelasList.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + cardWidth / 2;
    const cardY = height / 2 + 30;

    kelasList.forEach((kelas, i) => {
      this.createKelasCard(startX + i * (cardWidth + gap), cardY, cardWidth, kelas);
    });

    this.add
      .text(width / 2, height - 24, "Dibuat untuk siswa SMA/SMK · Pendidikan Agama Buddha", {
        fontFamily: "Nunito",
        fontSize: "12px",
        color: "#a89b86",
      })
      .setOrigin(0.5);
  }

  private drawTempleBackdrop(width: number, height: number): void {
    const g = this.add.graphics();
    g.fillStyle(0xf3e6c8, 1);
    g.fillCircle(width / 2, -60, 340);
    g.fillStyle(0xd9a441, 0.15);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(80 + i * 210, height - 40, 90);
    }
  }

  private createKelasCard(x: number, y: number, w: number, kelas: Kelas): void {
    const h = 220;
    const topics = getTopikList(kelas);

    const container = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, w, h, 0xffffff)
      .setStrokeStyle(3, 0xd9a441)
      .setInteractive({ useHandCursor: true });

    const emoji = this.add.text(0, -70, "🪷", { fontSize: "40px" }).setOrigin(0.5);

    const title = this.add
      .text(0, -20, KELAS_LABEL[kelas], {
        fontFamily: "Baloo 2",
        fontSize: "24px",
        color: "#7a1f2b",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    const desc = this.add
      .text(0, 10, KELAS_DESC[kelas], {
        fontFamily: "Nunito",
        fontSize: "12.5px",
        color: "#6b5847",
        align: "center",
        wordWrap: { width: w - 40 },
      })
      .setOrigin(0.5, 0);

    const badge = this.add
      .text(0, 78, `${topics.length} Topik`, {
        fontFamily: "Baloo 2",
        fontSize: "13px",
        color: "#7a1f2b",
        backgroundColor: "#fbeecb",
        padding: { x: 12, y: 5 },
      })
      .setOrigin(0.5);

    container.add([bg, emoji, title, desc, badge]);

    bg.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.04, duration: 100 });
      bg.setStrokeStyle(3, 0x7a1f2b);
    });
    bg.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
      bg.setStrokeStyle(3, 0xd9a441);
    });
    bg.on("pointerdown", () => {
      this.scene.start("TopikMap", { kelas });
    });
  }
}
