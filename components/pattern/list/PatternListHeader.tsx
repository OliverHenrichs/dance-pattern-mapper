import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import PlusButton from "@/components/common/PlusButton";
import SectionHeader from "@/components/common/SectionHeader";
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
  const palette = getPalette(colorScheme);
  const styles = getStyles();

  const rightActions = (
    <>
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
    </>
  );

  return <SectionHeader title={t("patternList")} rightActions={rightActions} />;
};

const getStyles = () =>
  StyleSheet.create({
    iconButton: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
  });

export default PatternListHeader;
