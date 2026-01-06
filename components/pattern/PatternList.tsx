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
import { useThemeContext } from "@/components/common/ThemeContext";
import { getCommonStyles } from "@/components/common/CommonStyles";

type PatternListProps = {
  patterns: WCSPattern[];
  selectedPattern?: WCSPattern;
  onSelect: (pattern: WCSPattern) => void;
  onDelete: (id?: number) => void;
  onAdd: () => void;
  onEdit: (pattern: WCSPattern) => void;
};

const PatternList: React.FC<PatternListProps> = ({
  patterns,
  onSelect,
  onDelete,
  onAdd,
  onEdit,
  selectedPattern,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  return (
    <View
      style={[
        styles.listContainer,
        { backgroundColor: colorScheme === "dark" ? "#18181b" : "#fff" },
      ]}
    >
      <View style={commonStyles.sectionHeaderRow}>
        <Text style={commonStyles.sectionTitle}>{t("patternList")}</Text>
        <TouchableOpacity
          onPress={onAdd}
          style={styles.plusButton}
          accessibilityLabel={t("addPattern")}
        >
          <Icon name="plus-circle" size={28} color="#22c55e" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {patterns.map((pattern) => (
          <View key={pattern.id}>
            {mapPatternToScrollViewItem(
              pattern,
              {
                onSelect,
                onDelete,
                onEdit,
                selectedPattern,
                patterns,
              } as PatternListProps,
              t,
              colorScheme,
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

function mapPatternToScrollViewItem(
  pattern: WCSPattern,
  { onSelect, onDelete, onEdit, selectedPattern, patterns }: PatternListProps,
  t: any,
  colorScheme: string,
) {
  const isSelected = selectedPattern?.id === pattern.id;
  return (
    <TouchableOpacity
      key={pattern.id}
      onPress={() => {
        if (isSelected) {
          onSelect(undefined as any); // Deselect if already selected
        } else {
          onSelect(pattern);
        }
      }}
      style={[
        styles.patternItem,
        isSelected ? styles.patternItemSelected : styles.patternItemUnselected,
      ]}
    >
      <View style={styles.patternItemHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.patternName,
              { color: colorScheme === "dark" ? "#f1f5f9" : "#1e293b" },
            ]}
          >
            {pattern.name}
          </Text>
          {/* Add tags or other info here if needed */}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onEdit(pattern);
          }}
          style={styles.iconButton}
          accessibilityLabel={t("editPattern")}
        >
          <Icon name="pencil" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete(pattern.id, pattern.name, onDelete)}
          style={styles.iconButton}
          accessibilityLabel={t("deletePattern")}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      {isSelected && (
        <PatternDetails selectedPattern={pattern} patterns={patterns} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
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
  patternName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteIcon: { fontSize: 20, color: "#ef4444", marginLeft: 8 },
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});

export default PatternList;
