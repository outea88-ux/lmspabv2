export interface AvatarOption {
  icon: string;
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { icon: "🐘", label: "Gajah" },
  { icon: "🦌", label: "Rusa" },
  { icon: "🦁", label: "Singa" },
  { icon: "🐯", label: "Harimau" },
  { icon: "🐒", label: "Monyet" },
  { icon: "🦚", label: "Merak" },
  { icon: "🐢", label: "Kura-kura" },
  { icon: "🐴", label: "Kuda" },
  { icon: "🐰", label: "Kelinci" },
  { icon: "🦢", label: "Angsa" },
  { icon: "🐉", label: "Naga" },
  { icon: "🦅", label: "Garuda" },
];

export const AVATAR_BG_COLORS = [
  "#FCA311",
  "#14213D",
  "#2E7D32",
  "#7B2FBE",
  "#C62828",
  "#0288D1",
  "#EC407A",
  "#00897B",
];

export const DEFAULT_AVATAR_ICON = AVATAR_OPTIONS[0].icon;
export const DEFAULT_AVATAR_BG = AVATAR_BG_COLORS[0];
