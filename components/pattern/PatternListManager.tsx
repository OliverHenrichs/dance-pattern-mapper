import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  NewWCSPattern,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import { foundationalWCSPatterns } from "@/components/pattern/data/DefaultWCSPatterns";
import PatternList from "@/components/pattern/PatternList";
import EditPatternForm from "@/components/pattern/EditPatternForm";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  loadPatterns,
  savePatterns,
} from "@/components/pattern/PatternStorage";
import { useTranslation } from "react-i18next";
import { DrawerActions, useNavigation } from "@react-navigation/native";

const PatternListManager = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
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
    <View style={{ flex: 1 }}>
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
                {t("appTitle")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.hamburgerButton}
              accessibilityLabel={t("openMenu")}
            >
              <Icon name="menu" size={28} color="#6366f1" />
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
              onAdd={() => setIsAddingNew(!isAddingNew)}
              onEdit={handleEditPattern}
              selectedPattern={selectedPattern}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f3ff" },
  innerContainer: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { fontSize: 32, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#3730a3" },
  headerActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    marginTop: 0,
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
  hamburgerButton: {
    marginLeft: 12,
    padding: 8,
  },
});

export default PatternListManager;
