import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { PatternList } from "@/components/pattern/types/PatternList";
import { PaletteColor } from "@/components/common/ColorPalette";
import { PatternListWithPatterns } from "@/components/pattern/data/types/IExportData";
import { ImportAction } from "@/components/pattern/data/hooks/useImportDecisions";
import { ConflictBadge } from "./ConflictBadge";
import { ImportActionButtons } from "./ImportActionButtons";

interface ImportListItemProps {
  list: PatternListWithPatterns;
  existingList?: PatternList;
  currentAction: ImportAction;
  onActionChange: (action: ImportAction) => void;
  palette: Record<PaletteColor, string>;
}

export const ImportListItem: React.FC<ImportListItemProps> = ({
  list,
  existingList,
  currentAction,
  onActionChange,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);
  return (
    <View style={styles.listItem}>
      <View style={styles.listHeader}>
        <Text style={styles.listName}>{list.name}</Text>
        {existingList && <ConflictBadge palette={palette} />}
      </View>
      <Text style={styles.listMeta}>
        {list.patterns.length} {t("patterns")} • {list.danceStyle}
      </Text>
      <ImportActionButtons
        currentAction={currentAction}
        hasConflict={!!existingList}
        onActionChange={onActionChange}
        palette={palette}
      />
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    listItem: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: palette[PaletteColor.CardBackground],
      borderWidth: 1,
      borderColor: palette[PaletteColor.Border],
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    listName: {
      fontSize: 16,
      fontWeight: "600",
      color: palette[PaletteColor.PrimaryText],
      flex: 1,
    },
    listMeta: {
      fontSize: 12,
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 12,
    },
  });
