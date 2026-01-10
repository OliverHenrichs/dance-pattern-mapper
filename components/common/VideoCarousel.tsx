import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { VideoReference } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useVideoPlayer, VideoView } from "expo-video";

type VideoItemProps = {
  videoRef: VideoReference;
  styles: ReturnType<typeof getStyles>;
  width: number;
};

const VideoItem: React.FC<VideoItemProps> = ({ videoRef, styles, width }) => {
  const player = useVideoPlayer(videoRef.value, (player) => {
    player.loop = false;
  });

  return (
    <View style={[styles.videoItemContainer, { width }]}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        fullscreenOptions={{ enable: true, orientation: "landscape" }}
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
  const [containerWidth, setContainerWidth] = useState(0);
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
    <View
      style={styles.videoCarouselContainer}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {containerWidth > 0 && (
        <FlatList
          data={videoRefs}
          renderItem={({ item }) => (
            <VideoItem videoRef={item} styles={styles} width={containerWidth} />
          )}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          snapToInterval={containerWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}
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
      marginBottom: 4,
    },
    videoItemContainer: {
      height: 200,
      marginBottom: 8,
    },
    videoPlayer: {
      width: "100%",
      height: "100%",
    },
    paginationContainer: {
      alignItems: "center",
    },
    paginationText: {
      fontSize: 12,
      color: palette[PaletteColor.SecondaryText],
    },
  });
};

export default VideoCarousel;
