import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WCSPattern } from "@/components/types/WCSPattern";

type PatternListProps = {
  patterns: WCSPattern[];
  selectedPattern?: WCSPattern;
  onSelect: (pattern: WCSPattern) => void;
  onDelete: (id?: number) => void;
};

const PatternList: React.FC<PatternListProps> = (props) => (
  <View>
    <Text style={styles.sectionTitle}>Pattern List</Text>
    <ScrollView style={styles.patternListScroll}>
      {props.patterns.map((pattern) =>
        mapPatternToScrollViewItem(pattern, props),
      )}
    </ScrollView>
  </View>
);

function mapPatternToScrollViewItem(
  pattern: WCSPattern,
  props: Omit<PatternListProps, "patterns">,
) {
  return (
    <TouchableOpacity
      key={pattern.id}
      onPress={() => props.onSelect(pattern)}
      style={[
        styles.patternItem,
        props.selectedPattern?.id === pattern.id
          ? styles.patternItemSelected
          : styles.patternItemUnselected,
      ]}
    >
      <View style={styles.patternItemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patternName}>{pattern.name}</Text>
          {/* Add tags or other info here if needed */}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            props.onDelete(pattern.id);
          }}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  patternListScroll: { maxHeight: 400 },
  patternItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  patternItemSelected: { borderColor: "#6366f1", backgroundColor: "#eef2ff" },
  patternItemUnselected: { borderColor: "#d1d5db", backgroundColor: "#fff" },
  patternItemHeader: { flexDirection: "row", alignItems: "center" },
  patternName: { fontWeight: "bold", fontSize: 16, color: "#1e293b" },
  deleteIcon: { fontSize: 20, color: "#ef4444", marginLeft: 8 },
});

export default PatternList;
