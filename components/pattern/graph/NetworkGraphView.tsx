import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { calculateGraphLayout, detectCircularDependencies } from "./GraphUtils";
import { useTranslation } from "react-i18next";
import { useGraphGestures } from "./GraphGestureHandler";
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
  const { width, height } = Dimensions.get("window");
  const initialWidth = width * 3;
  const initialHeight = height * 2;
  // Memoized layout calculations
  const { positions, svgWidth, svgHeight } = useMemo(() => {
    // Detect circular dependencies
    detectCircularDependencies(patterns);

    const positions = calculateGraphLayout(
      patterns,
      initialWidth,
      initialHeight,
    );

    if (positions.size === 0) {
      return {
        positions,
        autoFitScale: 1,
        svgWidth: initialWidth,
        svgHeight: initialHeight,
      };
    }

    // Calculate actual bounds of all patterns
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    // Add padding around content (100px on each side for nodes + margin)
    const padding = 300; // Increased padding for better initial view
    const contentWidth = maxX - minX + padding;
    const contentHeight = maxY - minY + padding;

    // SVG should be large enough to contain all patterns with padding
    const svgWidth = Math.max(initialWidth, contentWidth);
    const svgHeight = Math.max(initialHeight, contentHeight);

    // Calculate scale to fit all content in view
    // Use Math.min to ensure BOTH dimensions fit (smaller scale = zoom out more)
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const fittedScale = Math.min(scaleX, scaleY) * 0.9; // 0.9 factor adds 10% breathing room

    // Constrain scale to reasonable bounds (0.1 to 1.5)
    // This prevents extreme zoom levels while still allowing content to fit
    const autoFitScale = Math.max(0.1, Math.min(fittedScale, 1.5));

    return {
      positions,
      autoFitScale,
      svgWidth,
      svgHeight,
    };
  }, [patterns, initialWidth, initialHeight, width, height]);

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
