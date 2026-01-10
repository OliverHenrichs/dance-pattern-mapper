import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  VideoReference,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import { useTranslation } from "react-i18next";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useVideoPlayer, VideoView } from "expo-video";

type VideoItemProps = {
  videoRef: VideoReference;
  styles: ReturnType<typeof getStyles>;
};

const VideoItem: React.FC<VideoItemProps> = ({ videoRef, styles }) => {
  const player = useVideoPlayer(videoRef.value, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.videoItemContainer}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
      />
    </View>
  );
};

type VideoCarouselProps = {
  videoRefs: VideoReference[];
  styles: ReturnType<typeof getStyles>;
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({ videoRefs, styles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.videoCarouselContainer}>
      <FlatList
        data={videoRefs}
        renderItem={({ item }) => <VideoItem videoRef={item} styles={styles} />}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      {videoRefs.length > 1 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationText}>
            {currentIndex + 1} / {videoRefs.length}
          </Text>
        </View>
      )}
    </View>
  );
};

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
      <Text style={styles.patternDetailsDesc}>
        {selectedPattern.description}
      </Text>
      {selectedPattern.videoRefs && selectedPattern.videoRefs.length > 0 && (
        <VideoCarousel videoRefs={selectedPattern.videoRefs} styles={styles} />
      )}
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
      {getPrerequisiteView(selectedPattern, patterns, t, styles)}
      {getBuildsIntoView(selectedPattern, patterns, t, styles)}
      {getTagView(selectedPattern, t, styles)}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getPrerequisites(selectedPattern, patterns, styles)}
        </ScrollView>
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
          <View key={preRequisiteId} style={styles.prereqItem}>
            <Text style={styles.label}>{prerequisite.name}</Text>
          </View>
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
          <View key={idx} style={styles.tagItem}>
            <Text key={idx} style={styles.tagText}>
              {tag}
            </Text>
          </View>
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
      <View style={styles.prereqContainer}>
        <Text style={styles.label}>{t("buildsInto")}:</Text>
        <Text style={styles.patternDetailsDesc}>
          {t("noDependentPatterns")}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.prereqContainer}>
      <Text style={styles.label}>{t("buildsInto")}:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dependents.map((dep) => (
          <View key={dep.id} style={styles.prereqItem}>
            <Text style={styles.label}>{dep.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (palette: Record<PaletteColor, string>) => {
  // Only use getCommonBorder for View styles
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
      color: palette[PaletteColor.SecondaryText],
    },
    prereqContainer: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: palette[PaletteColor.Border],
      backgroundColor: palette[PaletteColor.TagBg],
      padding: 8,
      marginVertical: 8,
    },
    prereqItem: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: palette[PaletteColor.Border],
      padding: 6,
      marginRight: 4,
      backgroundColor: palette[PaletteColor.Surface],
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
    tagItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette[PaletteColor.TagBg],
      paddingHorizontal: 8,
      marginRight: 4,
      marginBottom: 4,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: palette[PaletteColor.Border],
    },
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
      fontStyle: "italic",
      color: palette[PaletteColor.SecondaryText],
      marginBottom: 8,
    },
    patternDetailsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    patternDetailsCol: { flex: 1 },
    patternDetailsValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    },
    videoCarouselContainer: {
      marginVertical: 8,
    },
    videoItemContainer: {
      width: 360,
      height: 200,
      marginBottom: 8,
    },
    videoPlayer: {
      width: "100%",
      height: "100%",
    },
    paginationContainer: {
      alignItems: "center",
      marginTop: 8,
    },
    paginationText: {
      fontSize: 12,
      color: palette[PaletteColor.SecondaryText],
    },
  });
};

export default PatternDetails;
