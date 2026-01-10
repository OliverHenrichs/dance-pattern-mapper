import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";
import {
  getCommonBorder,
  getCommonButton,
  getCommonInput,
  getCommonLabel,
  getCommonRow,
} from "@/components/common/CommonStyles";

interface PatternTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  styles?: any;
}

const PatternTags: React.FC<PatternTagsProps> = ({ tags, setTags, styles }) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const localStyles = getStyles(palette);
  styles = { ...styles, ...localStyles };

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
  return {
    tagsContainer: {
      ...getCommonBorder(palette),
      padding: 6,
      backgroundColor: palette[PaletteColor.TagBg],
    },
    tagsRow: { ...getCommonRow(), flexWrap: "wrap", gap: 4 },
    tagItem: {
      ...getCommonBorder(palette),
      ...getCommonRow(),
      backgroundColor: palette[PaletteColor.TagBg],
      paddingHorizontal: 8,
    },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 14 }, // TextStyle only
    tagRemove: {
      color: palette[PaletteColor.TagText],
      fontSize: 16,
      marginLeft: 4,
    },
    inputRow: { ...getCommonRow(), gap: 8, marginBottom: 4 }, // ViewStyle only
    input: { ...getCommonInput(palette), flex: 1 }, // TextInput: ViewStyle & TextStyle
    buttonIndigo: { ...getCommonButton(palette) }, // ViewStyle only
    buttonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
    }, // TextStyle only
    label: { ...getCommonLabel(palette) }, // TextStyle only
  };
};

export default PatternTags;
