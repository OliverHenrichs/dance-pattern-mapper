import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
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
  getCommonBorder,
  getCommonInput,
} from "@/components/common/CommonStyles";

interface TagPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddTag: (tag: string) => void;
  selectedTags: string[];
  allPatterns?: WCSPattern[];
}

const TagPickerBottomSheet: React.FC<TagPickerBottomSheetProps> = ({
  visible,
  onClose,
  onAddTag,
  selectedTags,
  allPatterns,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

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
        !selectedTags.some(
          (existingTag) => existingTag.toLowerCase() === tag.toLowerCase(),
        ),
    );
  }, [searchQuery, allExistingTags, selectedTags]);

  // Check if search query is a new tag (not in existing tags)
  const isNewTag = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return false;
    return (
      !allExistingTags.some(
        (tag) => tag.toLowerCase() === query.toLowerCase(),
      ) &&
      !selectedTags.some((tag) => tag.toLowerCase() === query.toLowerCase())
    );
  }, [searchQuery, allExistingTags, selectedTags]);

  const handleAddTag = (tag: string) => {
    onAddTag(tag);
    setSearchQuery("");
  };

  const handleAddNewTag = () => {
    if (searchQuery.trim()) {
      handleAddTag(searchQuery);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={styles.bottomSheet}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{t("addTag")}</Text>
            <TouchableOpacity onPress={handleClose}>
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
                      onPress={() => handleAddTag(tag)}
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
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end" as const,
    },
    bottomSheet: {
      backgroundColor: palette[PaletteColor.Surface],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
      maxHeight: "80%" as const,
      minHeight: "50%" as const,
    },
    bottomSheetHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: 16,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "bold" as const,
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
      alignItems: "center" as const,
    },
    createNewTagText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold" as const,
      fontSize: 14,
    },
    existingTagsSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 8,
      textTransform: "uppercase" as const,
    },
    tagsGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
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
      alignItems: "center" as const,
    },
    emptyStateText: {
      color: palette[PaletteColor.SecondaryText],
      fontSize: 14,
      fontStyle: "italic" as const,
    },
  });
};

export default TagPickerBottomSheet;
