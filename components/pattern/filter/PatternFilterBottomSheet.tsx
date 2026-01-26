import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/components/common/ThemeContext";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";
import {
  getCommonBorder,
  getCommonInput,
  getCommonLabel,
} from "@/components/common/CommonStyles";
import BottomSheet from "@/components/common/BottomSheet";

export interface PatternFilter {
  name: string;
  types: WCSPatternType[];
  levels: WCSPatternLevel[];
  minCounts?: number;
  maxCounts?: number;
  tags: string[];
}

interface PatternFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: PatternFilter) => void;
  currentFilter: PatternFilter;
  allPatterns: WCSPattern[];
}

const PatternFilterBottomSheet: React.FC<PatternFilterBottomSheetProps> = ({
  visible,
  onClose,
  onApplyFilter,
  currentFilter,
  allPatterns,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

  const [filter, setFilter] = useState<PatternFilter>(currentFilter);

  // Extract all unique tags from all patterns
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allPatterns.forEach((pattern) => {
      pattern.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
  }, [allPatterns]);

  const toggleType = (type: WCSPatternType) => {
    setFilter((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleLevel = (level: WCSPatternLevel) => {
    setFilter((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const toggleTag = (tag: string) => {
    setFilter((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleApply = () => {
    onApplyFilter(filter);
    onClose();
  };

  const handleReset = () => {
    const emptyFilter: PatternFilter = {
      name: "",
      types: [],
      levels: [],
      minCounts: undefined,
      maxCounts: undefined,
      tags: [],
    };
    setFilter(emptyFilter);
    onApplyFilter(emptyFilter);
  };

  const handleClose = () => {
    setFilter(currentFilter); // Reset to current filter on cancel
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={t("filterPatterns")}
      palette={palette}
      maxHeight="95%"
      minHeight="85%"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Name Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>{t("name")}</Text>
          <TextInput
            placeholder={t("searchByName")}
            value={filter.name}
            onChangeText={(text) => setFilter({ ...filter, name: text })}
            style={styles.input}
            placeholderTextColor={palette[PaletteColor.SecondaryText]}
          />
        </View>

        {/* Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>{t("type")}</Text>
          <View style={styles.chipContainer}>
            {Object.values(WCSPatternType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  filter.types.includes(type) && styles.chipSelected,
                ]}
                onPress={() => toggleType(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter.types.includes(type) && styles.chipTextSelected,
                  ]}
                >
                  {t(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Level Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>{t("level")}</Text>
          <View style={styles.chipContainer}>
            {Object.values(WCSPatternLevel).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  filter.levels.includes(level) && styles.chipSelected,
                ]}
                onPress={() => toggleLevel(level)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter.levels.includes(level) && styles.chipTextSelected,
                  ]}
                >
                  {t(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Counts Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>{t("counts")}</Text>
          <View style={styles.countsRow}>
            <View style={styles.countsInput}>
              <Text style={styles.countsLabel}>{t("min")}</Text>
              <TextInput
                placeholder="0"
                value={filter.minCounts?.toString() || ""}
                onChangeText={(text) =>
                  setFilter({
                    ...filter,
                    minCounts: text ? parseInt(text) || 0 : undefined,
                  })
                }
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor={palette[PaletteColor.SecondaryText]}
              />
            </View>
            <View style={styles.countsInput}>
              <Text style={styles.countsLabel}>{t("max")}</Text>
              <TextInput
                placeholder="∞"
                value={filter.maxCounts?.toString() || ""}
                onChangeText={(text) =>
                  setFilter({
                    ...filter,
                    maxCounts: text ? parseInt(text) || 0 : undefined,
                  })
                }
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor={palette[PaletteColor.SecondaryText]}
              />
            </View>
          </View>
        </View>

        {/* Tags Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>{t("tags")}</Text>
          <View style={styles.chipContainer}>
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.chip,
                  filter.tags.includes(tag) && styles.chipSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter.tags.includes(tag) && styles.chipTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>{t("reset")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>{t("apply")}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    filterSection: {
      marginBottom: 20,
    },
    label: {
      ...getCommonLabel(palette),
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    input: {
      ...getCommonInput(palette),
      fontSize: 16,
    },
    chipContainer: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 8,
    },
    chip: {
      ...getCommonBorder(palette),
      backgroundColor: palette[PaletteColor.TagBg],
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    chipSelected: {
      backgroundColor: palette[PaletteColor.Primary],
      borderColor: palette[PaletteColor.Primary],
    },
    chipText: {
      color: palette[PaletteColor.TagText],
      fontSize: 14,
    },
    chipTextSelected: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold" as const,
    },
    countsRow: {
      flexDirection: "row" as const,
      gap: 12,
    },
    countsInput: {
      flex: 1,
    },
    countsLabel: {
      fontSize: 12,
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 4,
      textTransform: "uppercase" as const,
    },
    buttonRow: {
      flexDirection: "row" as const,
      gap: 12,
      marginTop: 16,
    },
    resetButton: {
      flex: 1,
      ...getCommonBorder(palette),
      backgroundColor: palette[PaletteColor.Surface],
      padding: 12,
      borderRadius: 8,
      alignItems: "center" as const,
    },
    resetButtonText: {
      color: palette[PaletteColor.SecondaryText],
      fontWeight: "bold" as const,
      fontSize: 16,
    },
    applyButton: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Primary],
      padding: 12,
      borderRadius: 8,
      alignItems: "center" as const,
    },
    applyButtonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold" as const,
      fontSize: 16,
    },
  });
};

export default PatternFilterBottomSheet;
