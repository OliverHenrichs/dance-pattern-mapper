import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { WCSPatternLevel } from "@/components/pattern/types/WCSPatternEnums";
import { getFilterCommonStyles } from "./FilterCommonStyles";

interface LevelFilterProps {
  selectedLevels: WCSPatternLevel[];
  onToggle: (level: WCSPatternLevel) => void;
  palette: Record<PaletteColor, string>;
}

const LevelFilter: React.FC<LevelFilterProps> = ({
  selectedLevels,
  onToggle,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getFilterCommonStyles(palette);

  return (
    <View style={styles.filterSection}>
      <Text style={styles.label}>{t("level")}</Text>
      <View style={styles.chipContainer}>
        {Object.values(WCSPatternLevel).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.chip,
              selectedLevels.includes(level) && styles.chipSelected,
            ]}
            onPress={() => onToggle(level)}
          >
            <Text
              style={[
                styles.chipText,
                selectedLevels.includes(level) && styles.chipTextSelected,
              ]}
            >
              {t(level)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default LevelFilter;
