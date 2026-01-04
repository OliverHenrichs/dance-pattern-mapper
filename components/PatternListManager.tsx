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
import EditPatternForm from "@/components/EditPatternForm";
import PatternDetails from "@/components/PatternDetails";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PatternListManager = () => {
  const [patterns, setPatterns] = useState<WCSPattern[]>(defaultPatterns);
  const [selectedPattern, setSelectedPattern] = useState<WCSPattern | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const addPattern = (pattern: NewWCSPattern) => {
    if (!pattern.name.trim()) return;
    setPatterns([...patterns, { ...pattern, id: patterns.length + 1 }]);
    setIsAddingNew(false);
  };
  const isWCSPattern = (p: any): p is WCSPattern => typeof p.id === "number";
  const editPattern = (pattern: WCSPattern | NewWCSPattern) => {
    if (!pattern.name.trim() || !isWCSPattern(pattern)) return;
    setPatterns(
      patterns.map((p) => (p.id === pattern.id ? { ...pattern } : p)),
    );
    setIsEditing(false);
  };

  const deletePattern = (id?: number) => {
    setPatterns(patterns.filter((p) => p.id !== id));
    if (selectedPattern?.id === id) setSelectedPattern(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon
              name="dance-ballroom"
              size={32}
              color="#6366f1"
              style={styles.headerIcon}
            />
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
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.buttonGreen}
          >
            <Text style={styles.buttonText}>Edit Pattern</Text>
          </TouchableOpacity>
        </View>
        {isAddingNew && (
          <EditPatternForm
            patterns={patterns}
            onAccepted={addPattern}
            onCancel={() => setIsAddingNew(false)}
          />
        )}
        {isEditing && selectedPattern != null && (
          <EditPatternForm
            patterns={patterns}
            onAccepted={editPattern}
            onCancel={() => setIsEditing(false)}
            existing={selectedPattern}
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
              <PatternDetails
                selectedPattern={selectedPattern}
                patterns={patterns}
              />
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
  patternDetailsContainer: { marginTop: 16, marginLeft: 0, width: "100%" },
  patternDetailsDesc: { color: "#64748b", marginBottom: 8 },
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

export default PatternListManager;
