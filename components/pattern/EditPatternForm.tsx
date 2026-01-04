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

type EditPatternFormProps = {
  patterns: WCSPattern[];
  onAccepted: (pattern: NewWCSPattern | WCSPattern) => void;
  onCancel: () => void;
  existing?: WCSPattern | null;
};

const patternTypes = Object.values(WCSPatternType);
const levels = Object.values(WCSPatternLevel);

const EditPatternForm: React.FC<EditPatternFormProps> = ({
  patterns,
  onAccepted,
  onCancel,
  existing,
}) => {
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
    <View style={styles.addPatternContainer}>
      <Text style={styles.sectionTitle}>
        {existing ? "Edit" : "Add New"} Pattern
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Pattern Name"
          value={newPattern.name}
          onChangeText={(text) => setNewPattern({ ...newPattern, name: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Counts"
          value={newPattern.counts.toString()}
          onChangeText={(text) =>
            setNewPattern({ ...newPattern, counts: parseInt(text) || 0 })
          }
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <View style={styles.inputRow}>
        <View style={styles.input}>
          <Text style={styles.label}>Type</Text>
          {patternTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.prereqItem,
                newPattern.type === type && styles.prereqItemSelected,
              ]}
              onPress={() => setNewPattern({ ...newPattern, type })}
            >
              <Text>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.input}>
          <Text style={styles.label}>Level</Text>
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
              <Text>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TextInput
        placeholder="Description"
        value={newPattern.description}
        onChangeText={(text) =>
          setNewPattern({ ...newPattern, description: text })
        }
        style={styles.textarea}
        multiline
      />
      {/* Video URL input for future video support */}
      <TextInput
        placeholder="Video URL (optional)"
        value={newPattern.videoUrl || ""}
        onChangeText={(text) =>
          setNewPattern({ ...newPattern, videoUrl: text })
        }
        style={styles.input}
      />
      <View style={styles.prereqContainer}>
        <Text style={styles.label}>Prerequisites</Text>
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
              <Text>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.tagsContainer}>
        <Text style={styles.label}>Tags</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add tag"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
            style={styles.input}
          />
          <TouchableOpacity onPress={addTag} style={styles.buttonIndigoSmall}>
            <Text style={styles.buttonText}>Add</Text>
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
          <Text style={styles.buttonText}>Save Pattern</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={styles.buttonGray}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addPatternContainer: {
    backgroundColor: "#eef2ff",
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
    backgroundColor: "#fff",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    minHeight: 48,
    marginBottom: 8,
  },
  prereqContainer: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "500", color: "#64748b", marginBottom: 4 },
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
    backgroundColor: "#6366f1",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonIndigoSmall: {
    backgroundColor: "#6366f1",
    padding: 8,
    borderRadius: 8,
  },
  buttonGray: { backgroundColor: "#d1d5db", padding: 8, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default EditPatternForm;
