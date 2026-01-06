import { StyleSheet } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";

export const getCommonStyles = (colorScheme: "light" | "dark") => {
  const palette = getPalette(colorScheme);
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
      minHeight: 39, // Ensures consistent height with + button
    },
  });
};
