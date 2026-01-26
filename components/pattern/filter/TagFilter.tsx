import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { getFilterCommonStyles } from "./FilterCommonStyles";

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  palette: Record<PaletteColor, string>;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTags,
  onToggle,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getFilterCommonStyles(palette);

  return (
    <View style={styles.filterSection}>
      <Text style={styles.label}>{t("tags")}</Text>
      <View style={styles.chipContainer}>
        {allTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.chip,
              selectedTags.includes(tag) && styles.chipSelected,
            ]}
            onPress={() => onToggle(tag)}
          >
            <Text
              style={[
                styles.chipText,
                selectedTags.includes(tag) && styles.chipTextSelected,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TagFilter;
