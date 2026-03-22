import { FC } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";
import { IVideoReference } from "@/src/pattern/types/IPatternList";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  extractYouTubeVideoId,
  isYouTubeUrl,
} from "@/src/common/utils/YouTubeUtils";

type VideoItemProps = {
  videoRef: IVideoReference;
  width: number;
};

/** YouTube player – only mounted when the URL is a YouTube link. */
const YouTubeVideoItem: FC<VideoItemProps> = ({ videoRef, width }) => {
  const videoId = extractYouTubeVideoId(videoRef.value) ?? "";
  return (
    <View style={[localStyles.videoItemContainer, { width }]}>
      <YoutubePlayer
        height={200}
        width={width}
        videoId={videoId}
        play={false}
        initialPlayerParams={
          videoRef.startTime != null ? { start: videoRef.startTime } : undefined
        }
      />
    </View>
  );
};

/** Direct-URL / local video player powered by expo-video. */
const DirectVideoItem: FC<VideoItemProps> = ({ videoRef, width }) => {
  const player = useVideoPlayer(videoRef.value, (p) => {
    p.loop = false;
    if (videoRef.startTime) {
      p.currentTime = videoRef.startTime;
    }
  });
  return (
    <View style={[localStyles.videoItemContainer, { width }]}>
      <VideoView
        style={localStyles.videoPlayer}
        player={player}
        fullscreenOptions={{ enable: true, orientation: "landscape" }}
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
      />
    </View>
  );
};

export const VideoItem: FC<VideoItemProps> = ({ videoRef, width }) => {
  if (videoRef.type === "url" && isYouTubeUrl(videoRef.value)) {
    return <YouTubeVideoItem videoRef={videoRef} width={width} />;
  }
  return <DirectVideoItem videoRef={videoRef} width={width} />;
};

const localStyles = StyleSheet.create({
  videoItemContainer: {
    height: 200,
    marginBottom: 8,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
});
