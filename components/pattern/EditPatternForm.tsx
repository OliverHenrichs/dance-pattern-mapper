import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  NewWCSPattern,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";
import { defaultNewPattern } from "@/components/pattern/data/DefaultWCSPatterns";
import { useTranslation } from "react-i18next";
import { PaletteColor } from "@/components/common/ColorPalette";

type EditPatternFormProps = {
  patterns: WCSPattern[];
  onAccepted: (pattern: NewWCSPattern | WCSPattern) => void;
  onCancel: () => void;
  existing?: WCSPattern | null;
  palette: Record<PaletteColor, string>;
};

const patternTypes = Object.values(WCSPatternType);
const levels = Object.values(WCSPatternLevel);

const EditPatternForm: React.FC<EditPatternFormProps> = ({
  patterns,
  onAccepted,
  onCancel,
  existing,
  palette,
}) => {
  const { t } = useTranslation();
  const [newPattern, setNewPattern] = useState<NewWCSPattern>(
    existing ?? defaultNewPattern,
  );
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !newPattern.tags.includes(tagInput.trim())) {
      setNewPattern({
        ...newPattern,
        tags: [...newPattern.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleFinish = () => {
    onAccepted(newPattern);
    setNewPattern(defaultNewPattern);
    setTagInput("");
  };

  const styles = getStyles(palette);

  return (
    <View style={styles.addPatternContainer}>
      <Text style={styles.sectionTitle}>
        {existing ? t("editPattern") : t("addPattern")}
      </Text>
      <View style={styles.inputRow}>
        <View style={styles.input}>
          <Text style={styles.label}>{t("patternName")}</Text>
          <TextInput
            placeholder={t("patternName")}
            value={newPattern.name}
            onChangeText={(text) =>
              setNewPattern({ ...newPattern, name: text })
            }
            style={styles.input}
            placeholderTextColor={palette[PaletteColor.SecondaryText]}
          />
        </View>

        <View style={styles.input}>
          <Text style={styles.label}>{t("counts")}</Text>
          <TextInput
            placeholder={t("counts")}
            value={newPattern.counts.toString()}
            onChangeText={(text) =>
              setNewPattern({ ...newPattern, counts: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={palette[PaletteColor.SecondaryText]}
          />
        </View>
      </View>
      <View style={styles.inputRow}>
        <View style={styles.input}>
          <Text style={styles.label}>{t("type")}</Text>
          {patternTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.prereqItem,
                newPattern.type === type && styles.prereqItemSelected,
              ]}
              onPress={() => setNewPattern({ ...newPattern, type })}
            >
              <Text style={styles.label}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.input}>
          <Text style={styles.label}>{t("level")}</Text>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.prereqItem,
                newPattern.level === level && styles.prereqItemSelected,
              ]}
              onPress={() =>
                setNewPattern({
                  ...newPattern,
                  level,
                })
              }
            >
              <Text style={styles.label}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TextInput
        placeholder={t("description")}
        value={newPattern.description}
        onChangeText={(text) =>
          setNewPattern({ ...newPattern, description: text })
        }
        style={styles.textarea}
        multiline
        placeholderTextColor={palette[PaletteColor.SecondaryText]}
      />
      {/* Video URL input for future video support */}
      <TextInput
        placeholder={t("videoUrlOptional")}
        value={newPattern.videoUrl || ""}
        onChangeText={(text) =>
          setNewPattern({ ...newPattern, videoUrl: text })
        }
        style={styles.input}
        placeholderTextColor={palette[PaletteColor.SecondaryText]}
      />
      <View style={styles.prereqContainer}>
        <Text style={styles.label}>{t("prerequisites")}</Text>
        <ScrollView horizontal>
          {patterns.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.prereqItem,
                newPattern.prerequisites.includes(p.id) &&
                  styles.prereqItemSelected,
              ]}
              onPress={() => {
                if (newPattern.prerequisites.includes(p.id)) {
                  setNewPattern({
                    ...newPattern,
                    prerequisites: newPattern.prerequisites.filter(
                      (id: number) => id !== p.id,
                    ),
                  });
                } else {
                  setNewPattern({
                    ...newPattern,
                    prerequisites: [...newPattern.prerequisites, p.id],
                  });
                }
              }}
            >
              <Text style={styles.label}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
          <TouchableOpacity onPress={addTag} style={styles.buttonIndigoSmall}>
            <Text style={styles.buttonText}>{t("add")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {newPattern.tags.map((tag: string, idx: number) => (
            <View key={idx} style={styles.tagItem}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() =>
                  setNewPattern({
                    ...newPattern,
                    tags: newPattern.tags.filter((_, i) => i !== idx),
                  })
                }
              >
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleFinish} style={styles.buttonIndigo}>
          <Text style={styles.buttonText}>{t("savePattern")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={styles.buttonGray}>
          <Text style={styles.buttonText}>{t("cancel")}</Text>
        </TouchableOpacity>
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

  const baseInput = {
    ...commonBorder,
    padding: 8,
    color: palette[PaletteColor.PrimaryText],
    backgroundColor: palette[PaletteColor.TagBg],
  };

  const baseButton = {
    padding: 8,
    borderRadius: 8,
  };

  return StyleSheet.create({
    // Containers
    addPatternContainer: {
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      backgroundColor: palette[PaletteColor.Surface],
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
      marginBottom: 8,
    },
    inputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    // Inputs
    input: {
      flex: 1,
      ...baseInput,
    },
    textarea: {
      ...baseInput,
      minHeight: 48,
      marginBottom: 8,
    },
    // Labels
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
      color: palette[PaletteColor.PrimaryText],
    },
    // Prerequisites
    prereqContainer: {
      ...commonBorder,
      padding: 8,
      marginVertical: 8,
      backgroundColor: palette[PaletteColor.TagBg],
    },
    prereqItem: {
      ...commonBorder,
      padding: 6,
      marginRight: 4,
      backgroundColor: palette[PaletteColor.Surface],
    },
    prereqItemSelected: { backgroundColor: palette[PaletteColor.Primary] },
    // Tags
    tagsContainer: { marginBottom: 8 },
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
    // Buttons
    buttonRow: { flexDirection: "row", gap: 8, marginTop: 8 },
    buttonIndigo: {
      ...baseButton,
      marginRight: 8,
      backgroundColor: palette[PaletteColor.Primary],
    },
    buttonIndigoSmall: {
      ...baseButton,
      backgroundColor: palette[PaletteColor.Primary],
    },
    buttonGray: {
      ...baseButton,
      backgroundColor: palette[PaletteColor.Border],
    },
    buttonText: { color: palette[PaletteColor.Surface], fontWeight: "bold" },
  });
};

export default EditPatternForm;
