import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WCSPattern } from "@/components/types/WCSPattern";

type PatternDetailsProps = {
  selectedPattern: WCSPattern;
  patterns: WCSPattern[];
};

const PatternDetails: React.FC<PatternDetailsProps> = ({
  selectedPattern,
  patterns,
}) => {
  const getDependents = (id: number) => {
    return patterns.filter((p) => p.prerequisites.includes(id));
  };
  return (
    <View style={styles.patternDetails}>
      <Text style={styles.sectionTitle}>Pattern Details</Text>
      <Text style={styles.patternDetailsName}>{selectedPattern.name}</Text>
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
          <Text style={styles.patternDetailsValue}>{selectedPattern.type}</Text>
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
  );
};

const styles = StyleSheet.create({
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
});

export default PatternDetails;
