import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { IModifier, IPattern } from "@/src/pattern/types/IPatternList";
import { PatternType } from "@/src/pattern/types/PatternType";
import { useTranslation } from "react-i18next";
import { PaletteColor } from "@/src/common/utils/ColorPalette";
import {
  getCommon2ndOrderLabel,
  getCommonLabel,
  getCommonPrereqContainer,
  getCommonPrereqItem,
} from "@/src/common/utils/CommonStyles";
import VideoCarousel from "@/src/common/components/VideoCarousel";

type ModifierDetailsProps = {
  modifier: IModifier;
  patterns: IPattern[];
  patternTypes?: PatternType[];
  palette: Record<PaletteColor, string>;
};

const ModifierDetails: React.FC<ModifierDetailsProps> = ({
  modifier,
  patterns,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);

  // Patterns that have this modifier in their modifierRefs (non-universal only)
  const appliedPatterns = modifier.universal
    ? []
    : patterns.filter((p) =>
        (p.modifierRefs ?? []).some((ref) => ref.modifierId === modifier.id),
      );

  return (
    <View style={styles.container}>
      {/* Videos — only for universal modifiers */}
      {modifier.universal && (modifier.videoRefs ?? []).length > 0 && (
        <VideoCarousel videoRefs={modifier.videoRefs} palette={palette} />
      )}

      {/* Connected patterns — only for non-universal modifiers */}
      {!modifier.universal && (
        <View style={styles.section}>
          <Text style={styles.label}>{t("appliedToPatterns")}:</Text>
          {appliedPatterns.length === 0 ? (
            <Text style={styles.emptyText}>{t("notAppliedToAnyPattern")}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {appliedPatterns.map((p) => (
                <View key={p.id} style={styles.patternPill}>
                  <Text style={styles.patternPillText}>{p.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: palette[PaletteColor.Border],
      paddingTop: 8,
      marginTop: 6,
    },
    section: {
      ...getCommonPrereqContainer(palette),
      marginTop: 0,
    },
    label: getCommonLabel(palette),
    emptyText: {
      ...getCommon2ndOrderLabel(palette),
      fontStyle: "italic",
    },
    patternPill: getCommonPrereqItem(palette),
    patternPillText: getCommon2ndOrderLabel(palette),
  });

export default ModifierDetails;
