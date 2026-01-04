import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import handleDelete from "@/components/common/DeleteConfirmationDialog";

type PatternListProps = {
  patterns: WCSPattern[];
  selectedPattern?: WCSPattern;
  onSelect: (pattern: WCSPattern) => void;
  onDelete: (id?: number) => void;
  onAdd: () => void;
  onEdit: (pattern: WCSPattern) => void;
};

const PatternList: React.FC<PatternListProps> = (props) => (
  <View>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Pattern List</Text>
      <TouchableOpacity
        onPress={props.onAdd}
        style={styles.plusButton}
        accessibilityLabel="Add Pattern"
      >
        <Icon name="plus-circle" size={28} color="#22c55e" />
      </TouchableOpacity>
    </View>
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
            props.onEdit(pattern);
          }}
          style={styles.iconButton}
          accessibilityLabel="Edit Pattern"
        >
          <Icon name="pencil" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete(pattern.id, pattern.name, props.onDelete)}
          style={styles.iconButton}
          accessibilityLabel="Delete Pattern"
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  plusButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 16,
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
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});

export default PatternList;
