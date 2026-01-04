import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NewWCSPattern, WCSPattern } from "@/components/types/WCSPattern";
import { defaultPatterns } from "@/components/data/DefaultPatterns";
import PatternList from "@/components/PatternList";
import AddPatternForm from "@/components/AddPatternForm";

const WCSPatternGraph = () => {
  const [patterns, setPatterns] = useState<WCSPattern[]>(defaultPatterns);
  const [selectedPattern, setSelectedPattern] = useState<WCSPattern | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = useState(false);

  const addPattern = (pattern: NewWCSPattern) => {
    if (!pattern.name.trim()) return;
    setPatterns([...patterns, { ...pattern, id: patterns.length + 1 }]);
    setIsAddingNew(false);
  };

  const deletePattern = (id?: number) => {
    setPatterns(patterns.filter((p) => p.id !== id));
    if (selectedPattern?.id === id) setSelectedPattern(null);
  };

  const getDependents = (id: number) => {
    return patterns.filter((p) => p.prerequisites.includes(id));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Using a dancing figure emoji as a placeholder for a vector icon */}
            <Text style={styles.headerIcon}>💃</Text>
            <Text style={[styles.headerTitle, { fontSize: 18 }]}>
              Dance Pattern Mapper
            </Text>
          </View>
        </View>
        <View style={styles.headerActionsRow}>
          <TouchableOpacity
            onPress={() => setIsAddingNew(!isAddingNew)}
            style={styles.buttonGreen}
          >
            <Text style={styles.buttonText}>Add Pattern</Text>
          </TouchableOpacity>
        </View>

        {isAddingNew && (
          <AddPatternForm
            patterns={patterns}
            onAdd={addPattern}
            onCancel={() => setIsAddingNew(false)}
          />
        )}
        <View>
          <PatternList
            patterns={patterns}
            onSelect={setSelectedPattern}
            onDelete={deletePattern}
          />

          <View style={styles.patternDetailsContainer}>
            {selectedPattern ? (
              <View style={styles.patternDetails}>
                <Text style={styles.sectionTitle}>Pattern Details</Text>
                <Text style={styles.patternDetailsName}>
                  {selectedPattern.name}
                </Text>
                <Text style={styles.patternDetailsDesc}>
                  {selectedPattern.description}
                </Text>
                <View style={styles.patternDetailsRow}>
                  <View style={styles.patternDetailsCol}>
                    <Text style={styles.label}>Counts:</Text>
                    <Text style={styles.patternDetailsValue}>
                      {selectedPattern.counts}
                    </Text>
                  </View>
                  <View style={styles.patternDetailsCol}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.patternDetailsValue}>
                      {selectedPattern.type}
                    </Text>
                  </View>
                  <View style={styles.patternDetailsCol}>
                    <Text style={styles.label}>Level:</Text>
                    <Text style={styles.patternDetailsValue}>
                      {selectedPattern.level}
                    </Text>
                  </View>
                </View>
                {selectedPattern.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    <Text style={styles.label}>Tags:</Text>
                    <View style={styles.tagsRow}>
                      {selectedPattern.tags.map((tag, idx) => (
                        <Text key={idx} style={styles.tagText}>
                          {tag}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.prereqContainer}>
                  <Text style={styles.label}>Prerequisites:</Text>
                  {selectedPattern.prerequisites.length === 0 ? (
                    <Text style={styles.patternDetailsDesc}>
                      None (foundational pattern)
                    </Text>
                  ) : (
                    <View>
                      {selectedPattern.prerequisites.map((preqId) => {
                        const preq = patterns.find((p) => p.id === preqId);
                        return preq ? (
                          <Text key={preqId} style={styles.prereqItem}>
                            {preq.name}
                          </Text>
                        ) : null;
                      })}
                    </View>
                  )}
                </View>
                <View style={styles.prereqContainer}>
                  <Text style={styles.label}>Builds into:</Text>
                  {getDependents(selectedPattern.id).length === 0 ? (
                    <Text style={styles.patternDetailsDesc}>
                      No dependent patterns yet
                    </Text>
                  ) : (
                    <View>
                      {getDependents(selectedPattern.id).map((dep) => (
                        <Text key={dep.id} style={styles.prereqItem}>
                          {dep.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.patternDetailsEmpty}>
                <Text style={styles.emptyIcon}>🌐</Text>
                <Text style={styles.patternDetailsDesc}>
                  Select a pattern to view details and dependencies
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f3ff" },
  innerContainer: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    justifyContent: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { fontSize: 32, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#3730a3" },
  headerActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    marginTop: 16,
    justifyContent: "flex-start",
  },
  buttonGreen: {
    backgroundColor: "#22c55e",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "500", color: "#64748b", marginBottom: 4 },
  prereqContainer: { marginBottom: 8 },
  prereqItem: {
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tagText: { color: "#7c3aed", fontSize: 12 },
  patternDetailsContainer: { marginTop: 16, marginLeft: 0, width: "100%" },
  patternDetails: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6366f1",
    padding: 16,
  },
  patternDetailsName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 4,
  },
  patternDetailsDesc: { color: "#64748b", marginBottom: 8 },
  patternDetailsRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  patternDetailsCol: { flex: 1 },
  patternDetailsValue: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  patternDetailsEmpty: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: { fontSize: 48, color: "#d1d5db", marginBottom: 8 },
});

export default WCSPatternGraph;
