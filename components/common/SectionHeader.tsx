import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { getCommonStyles } from "@/components/common/CommonStyles";
import { useThemeContext } from "@/components/common/ThemeContext";

interface SectionHeaderProps {
  title: string;
  rightActions?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  rightActions,
}) => {
  const { colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

  return (
    <View style={[commonStyles.sectionHeaderRow, styles.headerContainer]}>
      <Text style={commonStyles.sectionTitle}>{title}</Text>
      {rightActions && (
        <View style={styles.actionsContainer}>{rightActions}</View>
      )}
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: palette[PaletteColor.Background],
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette[PaletteColor.Border],
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });

export default SectionHeader;
