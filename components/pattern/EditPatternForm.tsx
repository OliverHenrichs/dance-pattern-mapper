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

  return (
    <View
      style={[
        styles.addPatternContainer,
        { backgroundColor: palette[PaletteColor.Surface] },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          { color: palette[PaletteColor.PrimaryText] },
        ]}
      >
        {existing ? t("editPattern") : t("addPattern")}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder={t("patternName")}
          value={newPattern.name}
          onChangeText={(text) => setNewPattern({ ...newPattern, name: text })}
          style={[
            styles.input,
            {
              color: palette[PaletteColor.PrimaryText],
              backgroundColor: palette[PaletteColor.TagBg],
              borderColor: palette[PaletteColor.Border],
            },
          ]}
        />
        <TextInput
          placeholder={t("counts")}
          value={newPattern.counts.toString()}
          onChangeText={(text) =>
            setNewPattern({ ...newPattern, counts: parseInt(text) || 0 })
          }
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: palette[PaletteColor.PrimaryText],
              backgroundColor: palette[PaletteColor.TagBg],
              borderColor: palette[PaletteColor.Border],
            },
          ]}
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
                newPattern.type === type && {
                  backgroundColor: palette[PaletteColor.Primary],
                },
              ]}
              onPress={() => setNewPattern({ ...newPattern, type })}
            >
              <Text>{type}</Text>
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
                newPattern.level === level && {
                  backgroundColor: palette[PaletteColor.Primary],
                },
              ]}
              onPress={() =>
                setNewPattern({
                  ...newPattern,
                  level,
                })
              }
            >
              <Text>{level}</Text>
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
        style={[
          styles.textarea,
          {
            color: palette[PaletteColor.PrimaryText],
            backgroundColor: palette[PaletteColor.TagBg],
            borderColor: palette[PaletteColor.Border],
          },
        ]}
        multiline
      />
      {/* Video URL input for future video support */}
      <TextInput
        placeholder={t("videoUrlOptional")}
        value={newPattern.videoUrl || ""}
        onChangeText={(text) =>
          setNewPattern({ ...newPattern, videoUrl: text })
        }
        style={[
          styles.input,
          {
            color: palette[PaletteColor.PrimaryText],
            backgroundColor: palette[PaletteColor.TagBg],
            borderColor: palette[PaletteColor.Border],
          },
        ]}
      />
      <View style={styles.prereqContainer}>
        <Text
          style={[styles.label, { color: palette[PaletteColor.PrimaryText] }]}
        >
          {t("prerequisites")}
        </Text>
        <ScrollView horizontal>
          {patterns.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.prereqItem,
                newPattern.prerequisites.includes(p.id) &&
                  styles.prereqItemSelected,
                newPattern.prerequisites.includes(p.id) && {
                  backgroundColor: palette[PaletteColor.Primary],
                },
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
              <Text>{p.name}</Text>
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
            style={[
              styles.input,
              {
                color: palette[PaletteColor.PrimaryText],
                backgroundColor: palette[PaletteColor.TagBg],
                borderColor: palette[PaletteColor.Border],
              },
            ]}
          />
          <TouchableOpacity
            onPress={addTag}
            style={[
              styles.buttonIndigoSmall,
              { backgroundColor: palette[PaletteColor.Primary] },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: palette[PaletteColor.Surface] },
              ]}
            >
              {t("add")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {newPattern.tags.map((tag: string, idx: number) => (
            <View
              key={idx}
              style={[
                styles.tagItem,
                { backgroundColor: palette[PaletteColor.TagBg] },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: palette[PaletteColor.TagText] },
                ]}
              >
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setNewPattern({
                    ...newPattern,
                    tags: newPattern.tags.filter((_, i) => i !== idx),
                  })
                }
              >
                <Text
                  style={[
                    styles.tagRemove,
                    { color: palette[PaletteColor.TagText] },
                  ]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleFinish}
          style={[
            styles.buttonIndigo,
            { backgroundColor: palette[PaletteColor.Primary] },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: palette[PaletteColor.Surface] },
            ]}
          >
            {t("savePattern")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={styles.buttonGray}>
          <Text style={styles.buttonText}>{t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addPatternContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    minHeight: 48,
    marginBottom: 8,
  },
  prereqContainer: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  prereqItem: {
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  prereqItemSelected: { backgroundColor: "#c7d2fe" },
  tagsContainer: { marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: { color: "#7c3aed", fontSize: 12 },
  tagRemove: { color: "#7c3aed", fontSize: 16, marginLeft: 4 },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  buttonIndigo: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonIndigoSmall: {
    padding: 8,
    borderRadius: 8,
  },
  buttonGray: { backgroundColor: "#d1d5db", padding: 8, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default EditPatternForm;
