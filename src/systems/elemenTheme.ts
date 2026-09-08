import type { Elemen } from "../types/content";

export interface ElemenTheme {
  label: Elemen;
  emoji: string;
  color: number;
  colorCss: string;
  colorSoftCss: string;
}

export const ELEMEN_THEME: Record<Elemen, ElemenTheme> = {
  Sejarah: { label: "Sejarah", emoji: "📜", color: 0xb5762a, colorCss: "#b5762a", colorSoftCss: "#f3e3c8" },
  Ritual: { label: "Ritual", emoji: "🧘", color: 0x3d7a6b, colorCss: "#3d7a6b", colorSoftCss: "#dcece7" },
  Etika: { label: "Etika", emoji: "⚖️", color: 0x7a1f2b, colorCss: "#7a1f2b", colorSoftCss: "#f3dcdf" },
};
