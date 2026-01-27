import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { getCommonStyles } from "@/components/common/CommonStyles";
import PlusButton from "@/components/common/PlusButton";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";

interface PatternListHeaderProps {
  hasActiveFilter: boolean;
  onSort: () => void;
  onFilter: () => void;
  onAdd: () => void;
}

const PatternListHeader: React.FC<PatternListHeaderProps> = ({
  hasActiveFilter,
  onSort,
  onFilter,
  onAdd,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

  return (
    <View style={[commonStyles.sectionHeaderRow, styles.stickyHeader]}>
      <Text style={commonStyles.sectionTitle}>{t("patternList")}</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          onPress={onSort}
          style={styles.iconButton}
          accessibilityLabel={t("sortPatterns")}
        >
          <Icon name="sort" size={24} color={palette[PaletteColor.Primary]} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFilter}
          style={styles.iconButton}
          accessibilityLabel={t("filterPatterns")}
        >
          <Icon
            name={hasActiveFilter ? "filter" : "filter-outline"}
            size={24}
            color={
              hasActiveFilter
                ? palette[PaletteColor.Accent]
                : palette[PaletteColor.Primary]
            }
          />
        </TouchableOpacity>
        <PlusButton
          onPress={onAdd}
          palette={palette}
          accessibilityLabel={t("addPattern")}
        />
      </View>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    stickyHeader: {
      backgroundColor: palette[PaletteColor.Background],
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette[PaletteColor.Border],
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButton: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
  });

export default PatternListHeader;
