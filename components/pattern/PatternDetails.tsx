import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { useTranslation } from "react-i18next";
import { PaletteColor } from "@/components/common/ColorPalette";

type PatternDetailsProps = {
  selectedPattern: WCSPattern;
  patterns: WCSPattern[];
  palette: Record<PaletteColor, string>;
};

const PatternDetails: React.FC<PatternDetailsProps> = ({
  selectedPattern,
  patterns,
  palette,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);
  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.patternName}>{selectedPattern.name}</Text>
      <Text style={styles.patternDetailsDesc}>
        {selectedPattern.description}
      </Text>
      {selectedPattern.videoUrl ? (
        <Text style={styles.videoUrl}>
          {t("video")}: {selectedPattern.videoUrl}
        </Text>
      ) : null}
      <View style={styles.patternDetailsRow}>
        <View style={styles.patternDetailsCol}>
          <Text style={styles.label}>{t("counts")}:</Text>
          <Text style={styles.patternDetailsValue}>
            {selectedPattern.counts}
          </Text>
        </View>
        <View style={styles.patternDetailsCol}>
          <Text style={styles.label}>{t("type")}:</Text>
          <Text style={styles.patternDetailsValue}>{selectedPattern.type}</Text>
        </View>
        <View style={styles.patternDetailsCol}>
          <Text style={styles.label}>{t("level")}:</Text>
          <Text style={styles.patternDetailsValue}>
            {selectedPattern.level}
          </Text>
        </View>
      </View>
      {selectedPattern.tags.length > 0 &&
        getTagView(selectedPattern, t, styles)}
      {getPrerequisiteView(selectedPattern, patterns, t, styles)}
      {getBuildsIntoView(selectedPattern, patterns, t, styles)}
    </View>
  );
};

function getPrerequisiteView(
  selectedPattern: WCSPattern,
  patterns: WCSPattern[],
  t: any,
  styles: ReturnType<typeof getStyles>,
) {
  return (
    <View style={styles.prereqContainer}>
      <Text style={styles.label}>{t("prerequisites")}:</Text>
      {selectedPattern.prerequisites.length === 0 ? (
        <Text style={styles.patternDetailsDesc}>
          {t("patternDetailsNoPrerequisites")}
        </Text>
      ) : (
        <View>{getPrerequisites(selectedPattern, patterns, styles)}</View>
      )}
    </View>
  );
}

function getPrerequisites(
  selectedPattern: WCSPattern,
  patterns: WCSPattern[],
  styles: ReturnType<typeof getStyles>,
) {
  return (
    <>
      {selectedPattern.prerequisites.map((preRequisiteId: number) => {
        const prerequisite = patterns.find((p) => p.id === preRequisiteId);
        return prerequisite ? (
          <Text key={preRequisiteId} style={styles.prereqItem}>
            {prerequisite.name}
          </Text>
        ) : null;
      })}
    </>
  );
}

function getTagView(
  selectedPattern: WCSPattern,
  t: any,
  styles: ReturnType<typeof getStyles>,
) {
  return (
    <View style={styles.tagsRow}>
      <Text style={styles.label}>{t("tags")}:</Text>
      <View style={styles.tagsRow}>
        {selectedPattern.tags.map((tag, idx) => (
          <Text key={idx} style={styles.tagText}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}

function getBuildsIntoView(
  selectedPattern: WCSPattern,
  patterns: WCSPattern[],
  t: any,
  styles: ReturnType<typeof getStyles>,
) {
  const dependents = patterns.filter((pattern) =>
    pattern.prerequisites.includes(selectedPattern.id),
  );
  if (dependents.length === 0) {
    return (
      <View>
        <Text style={styles.label}>{t("buildsInto")}:</Text>
        <Text style={styles.patternDetailsDesc}>
          {t("noDependentPatterns")}
        </Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.label}>{t("buildsInto")}:</Text>
      {dependents.map((dep) => (
        <Text key={dep.id} style={styles.prereqItem}>
          {dep.name}
        </Text>
      ))}
    </View>
  );
}

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 4,
    },
    prereqContainer: { marginBottom: 8 },
    prereqItem: {
      backgroundColor: palette[PaletteColor.TagBg],
      padding: 6,
      borderRadius: 8,
      marginRight: 4,
      marginBottom: 4,
    },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    tagText: { color: palette[PaletteColor.TagText], fontSize: 12 },
    detailsContainer: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: palette[PaletteColor.Primary],
      padding: 16,
      marginTop: 8,
      backgroundColor: palette[PaletteColor.Surface],
    },
    patternName: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 4,
      color: palette[PaletteColor.PrimaryText],
    },
    patternDetailsDesc: {
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 8,
    },
    patternDetailsRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
    patternDetailsCol: { flex: 1 },
    patternDetailsValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    },
    videoUrl: { color: palette[PaletteColor.Accent], marginBottom: 8 },
  });

export default PatternDetails;
