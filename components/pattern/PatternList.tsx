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
import PatternDetails from "@/components/pattern/PatternDetails";
import { useTranslation } from "react-i18next";

type PatternListProps = {
  patterns: WCSPattern[];
  selectedPattern?: WCSPattern;
  onSelect: (pattern: WCSPattern) => void;
  onDelete: (id?: number) => void;
  onAdd: () => void;
  onEdit: (pattern: WCSPattern) => void;
};

const PatternList: React.FC<PatternListProps> = (props) => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t("patternList")}</Text>
        <TouchableOpacity
          onPress={props.onAdd}
          style={styles.plusButton}
          accessibilityLabel={t("addPattern")}
        >
          <Icon name="plus-circle" size={28} color="#22c55e" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {props.patterns.map((pattern) => (
          <View key={pattern.id}>
            {mapPatternToScrollViewItem(pattern, props, t)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

function mapPatternToScrollViewItem(
  pattern: WCSPattern,
  props: PatternListProps,
  t: any,
) {
  const isSelected = props.selectedPattern?.id === pattern.id;
  return (
    <TouchableOpacity
      key={pattern.id}
      onPress={() => {
        if (isSelected) {
          props.onSelect(undefined as any); // Deselect if already selected
        } else {
          props.onSelect(pattern);
        }
      }}
      style={[
        styles.patternItem,
        isSelected ? styles.patternItemSelected : styles.patternItemUnselected,
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
          accessibilityLabel={t("editPattern")}
        >
          <Icon name="pencil" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete(pattern.id, pattern.name, props.onDelete)}
          style={styles.iconButton}
          accessibilityLabel={t("deletePattern")}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      {isSelected && (
        <PatternDetails selectedPattern={pattern} patterns={props.patterns} />
      )}
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
  patternItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  patternItemSelected: { borderColor: "#6366f1", backgroundColor: "#eef2ff" },
  patternItemUnselected: { borderColor: "#d1d5db", backgroundColor: "#fff" },
  patternItemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  patternName: { fontWeight: "bold", fontSize: 16, color: "#1e293b" },
  deleteIcon: { fontSize: 20, color: "#ef4444", marginLeft: 8 },
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});

export default PatternList;
