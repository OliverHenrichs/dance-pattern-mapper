import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
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
  getCommonBorder,
  getCommonButton,
  getCommonInput,
  getCommonLabel,
  getCommonRow,
} from "@/components/common/CommonStyles";

interface PatternTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  allPatterns?: WCSPattern[];
  styles?: any;
}

const PatternTags: React.FC<PatternTagsProps> = ({
  tags,
  setTags,
  allPatterns,
  styles,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const localStyles = getStyles(palette);
  styles = { ...styles, ...localStyles };

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract all unique tags from all patterns
  const allExistingTags = useMemo(() => {
    if (!allPatterns) return [];
    const tagSet = new Set<string>();
    allPatterns.forEach((pattern) => {
      pattern.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
  }, [allPatterns]);

  // Filter existing tags based on search query and exclude already selected
  const filteredExistingTags = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allExistingTags.filter(
      (tag) =>
        tag.toLowerCase().includes(query) &&
        !tags.some(
          (existingTag) => existingTag.toLowerCase() === tag.toLowerCase(),
        ),
    );
  }, [searchQuery, allExistingTags, tags]);

  // Check if search query is a new tag (not in existing tags)
  const isNewTag = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return false;
    return (
      !allExistingTags.some(
        (tag) => tag.toLowerCase() === query.toLowerCase(),
      ) && !tags.some((tag) => tag.toLowerCase() === query.toLowerCase())
    );
  }, [searchQuery, allExistingTags, tags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !tags.some((t) => t.toLowerCase() === trimmedTag.toLowerCase())
    ) {
      setTags([...tags, trimmedTag]);
      setSearchQuery("");
    }
  };

  const handleAddNewTag = () => {
    if (searchQuery.trim()) {
      addTag(searchQuery);
      setSearchQuery("");
    }
  };

  const openBottomSheet = () => {
    setIsBottomSheetVisible(true);
    setSearchQuery("");
  };

  const closeBottomSheet = () => {
    setIsBottomSheetVisible(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.tagsContainer}>
      <Text style={styles.label}>{t("tags")}</Text>
      <TouchableOpacity onPress={openBottomSheet} style={styles.addTagButton}>
        <Text style={styles.addTagButtonText}>+ {t("addTag")}</Text>
      </TouchableOpacity>
      <View style={styles.tagsRow}>
        {tags.map((tag: string, idx: number) => (
          <View key={idx} style={styles.tagItem}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity
              onPress={() => setTags(tags.filter((_, i) => i !== idx))}
            >
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isBottomSheetVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBottomSheet}
      >
        <Pressable style={styles.modalOverlay} onPress={closeBottomSheet}>
          <Pressable
            style={styles.bottomSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{t("addTag")}</Text>
              <TouchableOpacity onPress={closeBottomSheet}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={t("addTag")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={palette[PaletteColor.SecondaryText]}
              autoFocus={true}
            />

            <ScrollView
              style={styles.tagsScrollView}
              contentContainerStyle={styles.tagsScrollContent}
            >
              {/* Create new tag option */}
              {isNewTag && (
                <TouchableOpacity
                  style={styles.createNewTagButton}
                  onPress={handleAddNewTag}
                >
                  <Text style={styles.createNewTagText}>
                    + Create &quot;{searchQuery}&quot;
                  </Text>
                </TouchableOpacity>
              )}

              {/* Existing tags */}
              {filteredExistingTags.length > 0 && (
                <View style={styles.existingTagsSection}>
                  <Text style={styles.sectionTitle}>
                    {searchQuery ? "Matching tags" : "Existing tags"}
                  </Text>
                  <View style={styles.tagsGrid}>
                    {filteredExistingTags.map((tag, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.existingTagChip}
                        onPress={() => {
                          addTag(tag);
                        }}
                      >
                        <Text style={styles.existingTagText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Empty state */}
              {!isNewTag && filteredExistingTags.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? "No matching tags found"
                      : "No existing tags yet"}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  return {
    tagsContainer: {
      ...getCommonBorder(palette),
      padding: 6,
      backgroundColor: palette[PaletteColor.TagBg],
    },
    tagsRow: { ...getCommonRow(), flexWrap: "wrap", gap: 4, marginTop: 8 },
    tagItem: {
      ...getCommonBorder(palette),
      ...getCommonRow(),
      backgroundColor: palette[PaletteColor.TagBg],
      paddingHorizontal: 8,
    },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 14 },
    tagRemove: {
      color: palette[PaletteColor.TagText],
      fontSize: 16,
      marginLeft: 4,
    },
    label: { ...getCommonLabel(palette) },
    addTagButton: {
      ...getCommonButton(palette),
      marginTop: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    addTagButtonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
      fontSize: 14,
    },
    // Bottom Sheet Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    bottomSheet: {
      backgroundColor: palette[PaletteColor.Surface],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
      maxHeight: "80%",
      minHeight: "50%",
    },
    bottomSheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    },
    closeButton: {
      fontSize: 24,
      color: palette[PaletteColor.SecondaryText],
      padding: 4,
    },
    searchInput: {
      ...getCommonInput(palette),
      marginBottom: 16,
      fontSize: 16,
    },
    tagsScrollView: {
      flex: 1,
    },
    tagsScrollContent: {
      paddingBottom: 16,
    },
    createNewTagButton: {
      ...getCommonBorder(palette),
      backgroundColor: palette[PaletteColor.Primary],
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      alignItems: "center",
    },
    createNewTagText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
      fontSize: 14,
    },
    existingTagsSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 8,
      textTransform: "uppercase",
    },
    tagsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    existingTagChip: {
      ...getCommonBorder(palette),
      backgroundColor: palette[PaletteColor.TagBg],
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    existingTagText: {
      color: palette[PaletteColor.TagText],
      fontSize: 14,
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
  };
};

export default PatternTags;
