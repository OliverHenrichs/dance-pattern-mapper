import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";

interface PatternTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  styles: any;
}

const PatternTags: React.FC<PatternTagsProps> = ({ tags, setTags, styles }) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  styles = { ...styles, ...getStyles(palette) };

  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <View style={styles.tagsContainer}>
      <Text style={styles.label}>{t("tags")}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder={t("addTag")}
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={addTag}
          style={styles.input}
          placeholderTextColor={palette[PaletteColor.SecondaryText]}
        />
        <TouchableOpacity onPress={addTag} style={styles.buttonIndigo}>
          <Text style={styles.buttonText}>{t("add")}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagsRow}>
        {tags.map((tag: string, idx: number) => (
          <View key={idx} style={styles.tagItem}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity
              onPress={() => setTags(tags.filter((_, i) => i !== idx))}
            >
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  // Common style fragments
  const commonBorder = {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: palette[PaletteColor.Border],
  };
  return {
    // Tags
    tagsContainer: {
      ...commonBorder,
      padding: 6,
      backgroundColor: palette[PaletteColor.TagBg],
    },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    tagItem: {
      ...commonBorder,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette[PaletteColor.TagBg],
      paddingHorizontal: 8,
    },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 14 },
    tagRemove: {
      color: palette[PaletteColor.TagText],
      fontSize: 16,
      marginLeft: 4,
    },
  };
};
export default PatternTags;
