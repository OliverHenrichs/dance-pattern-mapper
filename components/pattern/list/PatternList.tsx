import React, { useMemo, useState } from "react";
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
import PatternDetails from "@/components/pattern/common/PatternDetails";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";
import {
  getCommonListContainer,
  getCommonStyles,
} from "@/components/common/CommonStyles";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import PlusButton from "@/components/common/PlusButton";
import PatternFilterBottomSheet, {
  PatternFilter,
} from "../filter/PatternFilterBottomSheet";

type PatternListProps = {
  patterns: WCSPattern[];
  selectedPattern?: WCSPattern;
  onSelect: (pattern: WCSPattern) => void;
  onDelete: (id?: number) => void;
  onAdd: () => void;
  onEdit: (pattern: WCSPattern) => void;
};

type PatternListItemProps = {
  pattern: WCSPattern;
  t: any;
  palette: Record<PaletteColor, string>;
  styles: ReturnType<typeof getStyles>;
  colorScheme: "light" | "dark";
} & PatternListProps;

const PatternList: React.FC<PatternListProps> = (props) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filter, setFilter] = useState<PatternFilter>({
    name: "",
    types: [],
    levels: [],
    counts: undefined,
    tags: [],
  });

  // Filter patterns based on current filter
  const filteredPatterns = useMemo(() => {
    return props.patterns.filter((pattern) => {
      // Name filter
      if (
        filter.name &&
        !pattern.name.toLowerCase().includes(filter.name.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (filter.types.length > 0 && !filter.types.includes(pattern.type)) {
        return false;
      }

      // Level filter
      if (
        filter.levels.length > 0 &&
        (!pattern.level || !filter.levels.includes(pattern.level))
      ) {
        return false;
      }

      // Counts filter
      if (filter.counts !== undefined && pattern.counts !== filter.counts) {
        return false;
      }

      // Tags filter - pattern must have ALL selected tags
      if (filter.tags.length > 0) {
        const hasAllTags = filter.tags.every((tag) =>
          pattern.tags.some(
            (patternTag) => patternTag.toLowerCase() === tag.toLowerCase(),
          ),
        );
        if (!hasAllTags) {
          return false;
        }
      }

      return true;
    });
  }, [props.patterns, filter]);

  const hasActiveFilter = useMemo(() => {
    return (
      filter.name !== "" ||
      filter.types.length > 0 ||
      filter.levels.length > 0 ||
      filter.counts !== undefined ||
      filter.tags.length > 0
    );
  }, [filter]);

  return (
    <View style={styles.listContainer}>
      <View style={[commonStyles.sectionHeaderRow, styles.stickyHeader]}>
        <Text style={commonStyles.sectionTitle}>{t("patternList")}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            style={styles.iconButton}
            accessibilityLabel={t("filterPatterns")}
          >
            <Icon
              name={hasActiveFilter ? "filter" : "filter-outline"}
              size={24}
              color={
                hasActiveFilter
                  ? palette[PaletteColor.Accent]
                  : palette[PaletteColor.Primary]
              }
            />
          </TouchableOpacity>
          <PlusButton
            onPress={props.onAdd}
            palette={palette}
            accessibilityLabel={t("addPattern")}
          />
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        {filteredPatterns.map((pattern) => (
          <View key={pattern.id}>
            {mapPatternToScrollViewItem({
              ...props,
              pattern,
              t,
              palette,
              styles,
              colorScheme,
            })}
          </View>
        ))}
        {filteredPatterns.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {hasActiveFilter ? t("noMatchingPatterns") : t("noPatterns")}
            </Text>
          </View>
        )}
      </ScrollView>

      <PatternFilterBottomSheet
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilter={setFilter}
        currentFilter={filter}
        allPatterns={props.patterns}
      />
    </View>
  );
};

function mapPatternToScrollViewItem({
  onSelect,
  onDelete,
  onEdit,
  selectedPattern,
  patterns,
  pattern,
  t,
  palette,
  styles,
  colorScheme,
}: PatternListItemProps) {
  const isSelected = selectedPattern?.id === pattern.id;
  return (
    <View
      style={[styles.patternItem, isSelected && styles.patternItemSelected]}
    >
      <View style={styles.patternItemHeader}>
        <TouchableOpacity
          onPress={() => {
            if (isSelected) {
              onSelect(undefined as any); // Deselect if already selected
            } else {
              onSelect(pattern);
            }
          }}
          style={{ flex: 1 }}
          accessibilityLabel={t("selectPattern")}
        >
          <Text style={styles.patternName}>{pattern.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onEdit(pattern);
          }}
          style={styles.iconButton}
          accessibilityLabel={t("editPattern")}
        >
          <Icon name="pencil" size={20} color={palette[PaletteColor.Primary]} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete(
            pattern.id,
            pattern.name,
            colorScheme,
            onDelete,
          )}
          style={styles.iconButton}
          accessibilityLabel={t("deletePattern")}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      {isSelected && (
        <PatternDetails
          selectedPattern={pattern}
          patterns={patterns}
          palette={palette}
        />
      )}
    </View>
  );
}

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    listContainer: {
      ...getCommonListContainer(palette),
      flex: 1,
    },
    stickyHeader: {
      backgroundColor: palette[PaletteColor.Background],
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette[PaletteColor.Border],
    },
    scrollView: {
      flex: 1,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    patternItem: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      marginBottom: 8,
      borderColor: palette[PaletteColor.Border],
      backgroundColor: palette[PaletteColor.Surface],
    },
    patternItemSelected: {
      borderColor: palette[PaletteColor.Primary],
      backgroundColor: palette[PaletteColor.TagBg],
    },
    patternItemHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    patternName: {
      fontWeight: "bold",
      fontSize: 16,
      color: palette[PaletteColor.PrimaryText],
    },
    deleteIcon: {
      fontSize: 20,
      marginLeft: 8,
      color: palette[PaletteColor.Error],
    },
    iconButton: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: "center",
    },
    emptyStateText: {
      color: palette[PaletteColor.SecondaryText],
      fontSize: 14,
      fontStyle: "italic",
    },
  });

export default PatternList;
