import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";

export const getCommonBorder = (
  palette: Record<PaletteColor, string>,
): Pick<ViewStyle, "borderWidth" | "borderRadius" | "borderColor"> => ({
  borderWidth: 1,
  borderRadius: 8,
  borderColor: palette[PaletteColor.Border],
});

export const getCommonButton = (
  palette: Record<PaletteColor, string>,
  bgColor?: string,
): ViewStyle => ({
  padding: 8,
  borderRadius: 8,
  backgroundColor: bgColor || palette[PaletteColor.Primary],
});

export const getCommonLabel = (
  palette: Record<PaletteColor, string>,
  color?: string,
): TextStyle => ({
  fontSize: 14,
  fontWeight: "500",
  marginBottom: 4,
  color: color || palette[PaletteColor.PrimaryText],
});

export const getCommonRow = (): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
});

export const getCommonInput = (
  palette: Record<PaletteColor, string>,
): ViewStyle & TextStyle => ({
  ...getCommonBorder(palette),
  padding: 8,
  color: palette[PaletteColor.PrimaryText],
  backgroundColor: palette[PaletteColor.TagBg],
});

export const getCommonStyles = (colorScheme: "light" | "dark") => {
  const palette = getPalette(colorScheme);
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    } as TextStyle,
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
      minHeight: 39, // Ensures consistent height with + button
    } as ViewStyle,
  });
};
