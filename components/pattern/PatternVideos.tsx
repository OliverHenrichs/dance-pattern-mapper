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

export type PatternVideosProps = {
  thumbnails: string[];
  onAddVideo: () => void;
  palette: Record<PaletteColor, string>;
  disabled?: boolean;
};

const PatternVideos: React.FC<PatternVideosProps> = ({
  thumbnails,
  onAddVideo,
  palette,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);
  return (
    <View style={styles.prereqContainer}>
      <Text style={styles.label}>{t("videos")}</Text>
      <View style={styles.videosInputRow}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.videosRow}
          showsHorizontalScrollIndicator={false}
        >
          {thumbnails.length > 0 &&
            thumbnails.map((thumb, idx) => (
              <View key={idx} style={styles.prereqItem}>
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
              </View>
            ))}
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
  const commonBorder = {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: palette[PaletteColor.Border],
  };
  const baseButton = {
    padding: 8,
    borderRadius: 8,
  };
  return StyleSheet.create({
    prereqContainer: {
      ...commonBorder,
      backgroundColor: palette[PaletteColor.TagBg],
      padding: 8,
      marginVertical: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
      color: palette[PaletteColor.PrimaryText],
    },
    videosRow: { flexDirection: "row", gap: 4, alignItems: "center" },
    videosInputRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 64,
      height: 78,
    },
    prereqItem: {
      ...commonBorder,
      padding: 6,
      marginRight: 4,
      backgroundColor: palette[PaletteColor.Surface],
    },
    addButtonContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: 64,
      marginLeft: 8,
    },
    buttonIndigo: {
      ...baseButton,
      backgroundColor: palette[PaletteColor.Primary],
    },
    buttonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
    },
  });
};

export default PatternVideos;
