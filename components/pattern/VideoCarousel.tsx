import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { VideoReference } from "@/components/pattern/types/WCSPattern";
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
  palette: Record<PaletteColor, string>;
};

const VideoCarousel: React.FC<VideoCarouselProps> = ({
  videoRefs,
  palette,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const styles = getStyles(palette);

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

const getStyles = (palette: Record<PaletteColor, string>) => {
  return StyleSheet.create({
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

export default VideoCarousel;
