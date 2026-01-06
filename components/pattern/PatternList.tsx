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
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";

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
  return (
    <View style={styles.listContainer}>
      <View style={commonStyles.sectionHeaderRow}>
        <Text style={commonStyles.sectionTitle}>{t("patternList")}</Text>
        <TouchableOpacity
          onPress={props.onAdd}
          style={styles.plusButton}
          accessibilityLabel={t("addPattern")}
        >
          <Icon
            name="plus-circle"
            size={28}
            color={palette[PaletteColor.Accent]}
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {props.patterns.map((pattern) => (
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
      </ScrollView>
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
      borderRadius: 12,
      padding: 8,
      marginTop: 8,
      marginBottom: 8,
      elevation: 2,
      backgroundColor: palette[PaletteColor.Surface],
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
  });

export default PatternList;
