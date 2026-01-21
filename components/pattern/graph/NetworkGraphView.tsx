import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useGraphGestures } from "./GraphGestureHandler";
import { useGraphLayout } from "./hooks/useGraphLayout";
import GraphSvg from "./GraphSvg";

interface NetworkGraphViewProps {
  patterns: WCSPattern[];
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: WCSPattern) => void;
}

const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  patterns,
  palette,
  onNodeTap,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);

  // Layout calculation
  const { positions, svgWidth, svgHeight } = useGraphLayout(patterns);

  // Gesture handling
  const { composedGesture, gestureState } = useGraphGestures();
  const { xCurrent, yCurrent, scaleCurrent } = gestureState;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: xCurrent.value },
      { translateY: yCurrent.value },
      { scale: scaleCurrent.value },
    ],
  }));

  if (patterns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("noPatternsToVisualize")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.gestureContainer,
            animatedStyle,
            { width: svgWidth, height: svgHeight },
          ]}
        >
          <GraphSvg
            svgWidth={svgWidth}
            svgHeight={svgHeight}
            patterns={patterns}
            positions={positions}
            palette={palette}
            onNodeTap={onNodeTap}
            viewMode="network"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
      overflow: "hidden",
    },
    gestureContainer: {
      position: "absolute",
      top: -500,
      left: -430,
      right: 0,
      bottom: 0,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette[PaletteColor.Background],
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: palette[PaletteColor.SecondaryText],
      textAlign: "center",
    },
  });

export default NetworkGraphView;
