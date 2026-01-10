import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import {
  getCommonButton,
  getCommonLabel,
  getCommonPrereqContainer,
  getCommonRow,
} from "@/components/common/CommonStyles";

export type PatternVideosProps = {
  thumbnails: string[];
  onAddVideo: () => void;
  onRemoveVideo: (index: number) => void;
  palette: Record<PaletteColor, string>;
  disabled?: boolean;
};

const PatternVideos: React.FC<PatternVideosProps> = ({
  thumbnails,
  onAddVideo,
  onRemoveVideo,
  palette,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);

  const renderThumbnails = () => {
    if (thumbnails.length === 0) return null;
    return thumbnails.map((thumb, idx) => (
      <View key={idx} style={styles.thumbnailWrapper}>
        <View style={styles.thumbnailContainer}>
          {thumb ? (
            <Image
              source={{ uri: thumb }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                resizeMode: "cover",
              }}
            />
          ) : (
            <Text style={styles.label}>No thumbnail</Text>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveVideo(idx)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.prereqContainer}>
      <Text style={styles.label}>{t("videos")}</Text>
      <View style={styles.videosInputRow}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.videosRow}
          showsHorizontalScrollIndicator={false}
        >
          {renderThumbnails()}
        </ScrollView>
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            onPress={onAddVideo}
            style={styles.buttonIndigo}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>{t("add")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) => {
  const baseButton = getCommonButton(palette);
  return StyleSheet.create({
    prereqContainer: getCommonPrereqContainer(palette),
    label: { ...getCommonLabel(palette) }, // TextStyle only
    buttonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
    }, // TextStyle only
    videosRow: { ...getCommonRow(), gap: 4 }, // ViewStyle only
    videosInputRow: {
      ...getCommonRow(),
      minHeight: 64,
      height: 78,
    },
    thumbnailWrapper: {
      position: "relative",
      marginTop: 8,
    },
    thumbnailContainer: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
      width: 64,
    },
    removeButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: palette[PaletteColor.Error],
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },
    removeButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
      lineHeight: 18,
    },
    addButtonContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: 64,
      marginLeft: 8,
    },
    buttonIndigo: { ...baseButton },
  });
};

export default PatternVideos;
