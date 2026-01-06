export enum PaletteColor {
  Background = "Background",
  Surface = "Surface",
  Primary = "Primary",
  PrimaryText = "PrimaryText",
  SecondaryText = "SecondaryText",
  Border = "Border",
  Accent = "Accent",
  ModalOverlay = "ModalOverlay",
  Error = "Error",
  TagBg = "TagBg",
  TagText = "TagText",
}

export const LightPalette: Record<PaletteColor, string> = {
  [PaletteColor.Background]: "#f5f3ff",
  [PaletteColor.Surface]: "#fff",
  [PaletteColor.Primary]: "#6366f1",
  [PaletteColor.PrimaryText]: "#3730a3",
  [PaletteColor.SecondaryText]: "#64748b",
  [PaletteColor.Border]: "#d1d5db",
  [PaletteColor.Accent]: "#22c55e",
  [PaletteColor.ModalOverlay]: "rgba(0,0,0,0.3)",
  [PaletteColor.Error]: "#ef4444",
  [PaletteColor.TagBg]: "#ede9fe",
  [PaletteColor.TagText]: "#7c3aed",
};

export const DarkPalette: Record<PaletteColor, string> = {
  [PaletteColor.Background]: "#18181b",
  [PaletteColor.Surface]: "#23232b",
  [PaletteColor.Primary]: "#6366f1",
  [PaletteColor.PrimaryText]: "#f1f5f9",
  [PaletteColor.SecondaryText]: "#a1a1aa",
  [PaletteColor.Border]: "#52525b",
  [PaletteColor.Accent]: "#22c55e",
  [PaletteColor.ModalOverlay]: "rgba(0,0,0,0.6)",
  [PaletteColor.Error]: "#ef4444",
  [PaletteColor.TagBg]: "#27272a",
  [PaletteColor.TagText]: "#a78bfa",
};

export function getPalette(colorScheme: "light" | "dark") {
  return colorScheme === "dark" ? DarkPalette : LightPalette;
}
