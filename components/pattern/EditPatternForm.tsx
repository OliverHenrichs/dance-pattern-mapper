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
        <TextInput
          placeholder={t("patternName")}
          value={newPattern.name}
          onChangeText={(text) => setNewPattern({ ...newPattern, name: text })}
          style={styles.input}
          placeholderTextColor={palette[PaletteColor.SecondaryText]}
        />
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

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
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
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette[PaletteColor.Border],
      borderRadius: 8,
      padding: 8,
      color: palette[PaletteColor.PrimaryText],
      backgroundColor: palette[PaletteColor.TagBg],
    },
    textarea: {
      borderWidth: 1,
      borderColor: palette[PaletteColor.Border],
      borderRadius: 8,
      padding: 8,
      minHeight: 48,
      marginBottom: 8,
      color: palette[PaletteColor.PrimaryText],
      backgroundColor: palette[PaletteColor.TagBg],
    },
    prereqContainer: { marginBottom: 8 },
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
      color: palette[PaletteColor.PrimaryText],
    },
    prereqItem: {
      backgroundColor: palette[PaletteColor.TagBg],
      padding: 6,
      borderRadius: 8,
      marginRight: 4,
      marginBottom: 4,
    },
    prereqItemSelected: { backgroundColor: palette[PaletteColor.Primary] },
    tagsContainer: { marginBottom: 8 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    tagItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette[PaletteColor.TagBg],
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 4,
    },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 12 },
    tagRemove: {
      color: palette[PaletteColor.TagText],
      fontSize: 16,
      marginLeft: 4,
    },
    buttonRow: { flexDirection: "row", gap: 8, marginTop: 8 },
    buttonIndigo: {
      padding: 8,
      borderRadius: 8,
      marginRight: 8,
      backgroundColor: palette[PaletteColor.Primary],
    },
    buttonIndigoSmall: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: palette[PaletteColor.Primary],
    },
    buttonGray: {
      backgroundColor: palette[PaletteColor.Border],
      padding: 8,
      borderRadius: 8,
    },
    buttonText: { color: palette[PaletteColor.Surface], fontWeight: "bold" },
  });

export default EditPatternForm;
