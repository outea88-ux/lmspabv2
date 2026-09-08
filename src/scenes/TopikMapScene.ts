import Phaser from "phaser";
import { getTopikList } from "../data/contentLoader";
import { getTopikProgress, isTopikUnlocked } from "../systems/progress";
import type { Kelas } from "../types/content";
import { hideOverlay } from "../systems/overlay";

interface TopikMapData {
  kelas: Kelas;
}

const KELAS_LABEL: Record<Kelas, string> = {
  X: "Kelas X",
  XI: "Kelas XI",
  XII: "Kelas XII",
};

export class TopikMapScene extends Phaser.Scene {
  private kelas!: Kelas;

  constructor() {
    super("TopikMap");
  }

  init(data: TopikMapData): void {
    this.kelas = data.kelas;
  }

  create(): void {
    hideOverlay();
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0xfdf6e8).setOrigin(0);

    this.add
      .text(24, 20, "← Menu", {
        fontFamily: "Baloo 2",
        fontSize: "16px",
        color: "#7a1f2b",
        backgroundColor: "#f3e6c8",
        padding: { x: 12, y: 8 },
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("MainMenu"));

    this.add
      .text(width / 2, 34, `Peta Belajar — ${KELAS_LABEL[this.kelas]}`, {
        fontFamily: "Baloo 2",
        fontSize: "24px",
        color: "#7a1f2b",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    const topics = getTopikList(this.kelas);
    this.drawPath(topics.length, width, height);

    topics.forEach((t, i) => {
      const pos = this.nodePosition(i, topics.length, width, height);
      const unlocked = isTopikUnlocked(this.kelas, t.nomor);
      const progress = getTopikProgress(this.kelas, t.nomor);
      this.createNode(pos.x, pos.y, t.nomor, t.materi.meta.judul, unlocked, progress?.stars ?? 0);
    });
  }

  private nodePosition(
    index: number,
    total: number,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const marginX = 110;
    const topY = 130;
    const bottomY = height - 60;
    const usableHeight = bottomY - topY;
    const cols = Math.min(total, 4);
    const rowGap = usableHeight / Math.max(1, Math.ceil(total / cols) - 1 || 1);
    const row = Math.floor(index / cols);
    const isEvenRow = row % 2 === 0;
    const colInRow = index % cols;
    const col = isEvenRow ? colInRow : cols - 1 - colInRow;
    const usableWidth = width - marginX * 2;
    const colGap = cols > 1 ? usableWidth / (cols - 1) : 0;
    const x = marginX + col * colGap;
    const y = topY + row * rowGap;
    return { x, y };
  }

  private drawPath(total: number, width: number, height: number): void {
    const g = this.add.graphics();
    g.lineStyle(6, 0xd9a441, 0.5);
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < total; i++) {
      const p = this.nodePosition(i, total, width, height);
      points.push(new Phaser.Math.Vector2(p.x, p.y));
    }
    if (points.length > 1) {
      g.beginPath();
      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
      g.strokePath();
    }
  }

  private createNode(
    x: number,
    y: number,
    nomor: number,
    judul: string,
    unlocked: boolean,
    stars: number,
  ): void {
    const radius = 34;
    const fillColor = unlocked ? (stars > 0 ? 0x4c7a4a : 0x7a1f2b) : 0xc9b989;

    const circle = this.add
      .circle(x, y, radius, fillColor)
      .setStrokeStyle(4, 0xffffff);

    const label = this.add
      .text(x, y, unlocked ? String(nomor) : "🔒", {
        fontFamily: "Baloo 2",
        fontSize: unlocked ? "22px" : "18px",
        color: "#ffffff",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    if (unlocked) {
      circle.setInteractive({ useHandCursor: true });
      circle.on("pointerover", () => this.tweens.add({ targets: [circle, label], scale: 1.12, duration: 100 }));
      circle.on("pointerout", () => this.tweens.add({ targets: [circle, label], scale: 1, duration: 100 }));
      circle.on("pointerdown", () => {
        this.scene.start("Materi", { kelas: this.kelas, nomor });
      });
    }

    if (stars > 0) {
      const starText = "⭐".repeat(stars);
      this.add
        .text(x, y + radius + 14, starText, { fontSize: "12px" })
        .setOrigin(0.5);
    }

    const shortTitle = judul.length > 26 ? `${judul.slice(0, 24)}…` : judul;
    this.add
      .text(x, y - radius - 12, shortTitle, {
        fontFamily: "Nunito",
        fontSize: "10.5px",
        color: "#6b5847",
        align: "center",
        wordWrap: { width: 130 },
      })
      .setOrigin(0.5, 1);
  }
}
