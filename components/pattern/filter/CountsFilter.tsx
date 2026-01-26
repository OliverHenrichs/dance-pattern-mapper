import React from "react";
import { Text, TextInput, View } from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { getFilterCommonStyles } from "./FilterCommonStyles";

interface CountsFilterProps {
  counts?: number;
  onChange: (value?: number) => void;
  palette: Record<PaletteColor, string>;
}

const CountsFilter: React.FC<CountsFilterProps> = ({
  counts,
  onChange,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getFilterCommonStyles(palette);

  return (
    <View style={styles.filterSection}>
      <Text style={styles.label}>{t("counts")}</Text>
      <TextInput
        placeholder={t("exactCounts")}
        value={counts?.toString() || ""}
        onChangeText={(text) =>
          onChange(text ? parseInt(text) || 0 : undefined)
        }
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor={palette[PaletteColor.SecondaryText]}
      />
    </View>
  );
};

export default CountsFilter;
