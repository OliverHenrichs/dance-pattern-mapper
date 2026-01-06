import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import {
  NewWCSPattern,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import { foundationalWCSPatterns } from "@/components/pattern/data/DefaultWCSPatterns";
import PatternList from "@/components/pattern/PatternList";
import EditPatternForm from "@/components/pattern/EditPatternForm";
import {
  loadPatterns,
  savePatterns,
} from "@/components/pattern/PatternStorage";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import { useThemeContext } from "@/components/common/ThemeContext";

const PatternListManager = () => {
  const { colorScheme } = useThemeContext();
  const [patterns, setPatterns] = useState<WCSPattern[]>(
    foundationalWCSPatterns,
  );
  const [selectedPattern, setSelectedPattern] = useState<
    WCSPattern | undefined
  >(undefined);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load patterns from storage on mount
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const stored = await loadPatterns();
        if (stored) setPatterns(stored);
      } catch {
        // fallback to defaults
      }
    };
    fetchPatterns();
  }, []);

  // Save patterns to storage whenever they change
  useEffect(() => {
    savePatterns(patterns);
  }, [patterns]);

  const addPattern = (pattern: NewWCSPattern) => {
    if (!pattern.name.trim()) return;
    setPatterns([
      ...patterns,
      {
        ...pattern,
        id:
          patterns.length > 0 ? Math.max(...patterns.map((p) => p.id)) + 1 : 1,
      },
    ]);
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
    if (selectedPattern?.id === id) setSelectedPattern(undefined);
  };

  const handleEditPattern = (pattern: WCSPattern) => {
    setSelectedPattern(pattern);
    setIsEditing(true);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#18181b" : "#f5f3ff",
      }}
    >
      <PageContainer>
        <AppHeader />
        <ScrollView style={styles.container}>
          <Modal
            visible={isAddingNew}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsAddingNew(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                  <EditPatternForm
                    patterns={patterns}
                    onAccepted={addPattern}
                    onCancel={() => setIsAddingNew(false)}
                  />
                </ScrollView>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isEditing && selectedPattern != null}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsEditing(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                  <EditPatternForm
                    patterns={patterns}
                    onAccepted={editPattern}
                    onCancel={() => setIsEditing(false)}
                    existing={selectedPattern}
                  />
                </ScrollView>
              </View>
            </View>
          </Modal>
          <View>
            <PatternList
              patterns={patterns}
              onSelect={setSelectedPattern}
              onDelete={deletePattern}
              onAdd={() => setIsAddingNew(!isAddingNew)}
              onEdit={handleEditPattern}
              selectedPattern={selectedPattern}
            />
          </View>
        </ScrollView>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 20,
    minWidth: "80%",
    maxHeight: "100%", // Limit modal height
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default PatternListManager;
