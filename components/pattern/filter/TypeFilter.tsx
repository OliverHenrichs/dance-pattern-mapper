import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { WCSPatternType } from "@/components/pattern/types/WCSPatternEnums";
import { getFilterCommonStyles } from "./FilterCommonStyles";

interface TypeFilterProps {
  selectedTypes: WCSPatternType[];
  onToggle: (type: WCSPatternType) => void;
  palette: Record<PaletteColor, string>;
}

const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedTypes,
  onToggle,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getFilterCommonStyles(palette);

  return (
    <View style={styles.filterSection}>
      <Text style={styles.label}>{t("type")}</Text>
      <View style={styles.chipContainer}>
        {Object.values(WCSPatternType).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              selectedTypes.includes(type) && styles.chipSelected,
            ]}
            onPress={() => onToggle(type)}
          >
            <Text
              style={[
                styles.chipText,
                selectedTypes.includes(type) && styles.chipTextSelected,
              ]}
            >
              {t(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TypeFilter;
