import { VideoReference } from "@/components/pattern/types/WCSPattern";
import { FC } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

type VideoItemProps = {
  videoRef: VideoReference;
  width: number;
};

export const VideoItem: FC<VideoItemProps> = ({ videoRef, width }) => {
  const styles = getStyles();
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

const getStyles = () => {
  return StyleSheet.create({
    videoItemContainer: {
      height: 200,
      marginBottom: 8,
    },
    videoPlayer: {
      width: "100%",
      height: "100%",
    },
  });
};
