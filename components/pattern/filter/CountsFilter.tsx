import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { getFilterCommonStyles } from "./FilterCommonStyles";

interface CountsFilterProps {
  minCounts?: number;
  maxCounts?: number;
  onMinChange: (value?: number) => void;
  onMaxChange: (value?: number) => void;
  palette: Record<PaletteColor, string>;
}

const CountsFilter: React.FC<CountsFilterProps> = ({
  minCounts,
  maxCounts,
  onMinChange,
  onMaxChange,
  palette,
}) => {
  const { t } = useTranslation();
  const commonStyles = getFilterCommonStyles(palette);
  const styles = getStyles(palette);

  return (
    <View style={commonStyles.filterSection}>
      <Text style={commonStyles.label}>{t("counts")}</Text>
      <View style={styles.countsRow}>
        <View style={styles.countsInput}>
          <Text style={styles.countsLabel}>{t("min")}</Text>
          <TextInput
            placeholder="0"
            value={minCounts?.toString() || ""}
            onChangeText={(text) =>
              onMinChange(text ? parseInt(text) || 0 : undefined)
            }
            style={commonStyles.input}
            keyboardType="numeric"
            placeholderTextColor={palette[PaletteColor.SecondaryText]}
          />
        </View>
        <View style={styles.countsInput}>
          <Text style={styles.countsLabel}>{t("max")}</Text>
          <TextInput
            placeholder="∞"
            value={maxCounts?.toString() || ""}
            onChangeText={(text) =>
              onMaxChange(text ? parseInt(text) || 0 : undefined)
            }
            style={commonStyles.input}
            keyboardType="numeric"
            placeholderTextColor={palette[PaletteColor.SecondaryText]}
          />
        </View>
      </View>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  return StyleSheet.create({
    countsRow: {
      flexDirection: "row" as const,
      gap: 12,
    },
    countsInput: {
      flex: 1,
    },
    countsLabel: {
      fontSize: 12,
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 4,
      textTransform: "uppercase" as const,
    },
  });
};

export default CountsFilter;
