import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  getCommonBorder,
  getCommonButton,
  getCommonLabel,
  getCommonRow,
} from "@/components/common/CommonStyles";
import TagPickerBottomSheet from "./TagPickerBottomSheet";

interface PatternTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  allPatterns?: WCSPattern[];
  styles?: any;
}

const PatternTags: React.FC<PatternTagsProps> = ({
  tags,
  setTags,
  allPatterns,
  styles,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const localStyles = getStyles(palette);
  styles = { ...styles, ...localStyles };

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !tags.some((t) => t.toLowerCase() === trimmedTag.toLowerCase())
    ) {
      setTags([...tags, trimmedTag]);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.tagsContainer}>
      <Text style={styles.label}>{t("tags")}</Text>
      <TouchableOpacity
        onPress={() => setIsBottomSheetVisible(true)}
        style={styles.addTagButton}
      >
        <Text style={styles.addTagButtonText}>+ {t("addTag")}</Text>
      </TouchableOpacity>
      <View style={styles.tagsRow}>
        {tags.map((tag: string, idx: number) => (
          <View key={idx} style={styles.tagItem}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(idx)}>
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TagPickerBottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onAddTag={addTag}
        selectedTags={tags}
        allPatterns={allPatterns}
      />
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  return {
    tagsContainer: {
      ...getCommonBorder(palette),
      padding: 6,
      backgroundColor: palette[PaletteColor.TagBg],
    },
    tagsRow: { ...getCommonRow(), flexWrap: "wrap", gap: 4, marginTop: 8 },
    tagItem: {
      ...getCommonBorder(palette),
      ...getCommonRow(),
      backgroundColor: palette[PaletteColor.TagBg],
      paddingHorizontal: 8,
    },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 14 },
    tagRemove: {
      color: palette[PaletteColor.TagText],
      fontSize: 16,
      marginLeft: 4,
    },
    label: { ...getCommonLabel(palette) },
    addTagButton: {
      ...getCommonButton(palette),
      marginTop: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    addTagButtonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
      fontSize: 14,
    },
  };
};

export default PatternTags;
