import React, { useMemo, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  calculateGraphLayout,
  detectCircularDependencies,
  generateCurvedPath,
} from "./GraphUtils";
import PatternNode from "./PatternNode";
import { useTranslation } from "react-i18next";

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

  // Shared values for transforms
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const isInitialized = useRef(false);

  const { width, height } = Dimensions.get("window");

  // Memoized layout calculations
  const { positions, autoFitScale, svgWidth, svgHeight } = useMemo(() => {
    // Initial canvas size for layout calculation
    const initialWidth = width * 3;
    const initialHeight = height * 2;

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
        contentCenterX: initialWidth / 2,
        contentCenterY: initialHeight / 2,
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
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

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
      contentCenterX,
      contentCenterY,
      svgWidth,
      svgHeight,
    };
  }, [patterns, width, height]);

  // Set initial scale and position to auto-fit - only once
  React.useEffect(() => {
    if (!isInitialized.current && patterns.length > 0) {
      // Calculate the bounding box of actual pattern positions
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

      // Center of the actual pattern content
      const actualCenterX = (minX + maxX) / 2;
      const actualCenterY = (minY + maxY) / 2;

      console.log("Pattern bounds:", { minX, maxX, minY, maxY });
      console.log("Content center:", { actualCenterX, actualCenterY });
      console.log("Auto fit scale:", autoFitScale);

      // Calculate offset to center content
      const offsetX = width / 2 - actualCenterX * autoFitScale;
      const offsetY = height / 2 - actualCenterY * autoFitScale;

      console.log("Applying offset:", { offsetX, offsetY });

      // Set initial transform with animation
      scale.value = withTiming(autoFitScale, { duration: 1000 });
      translateX.value = withTiming(offsetX, { duration: 1000 });
      translateY.value = withTiming(offsetY, { duration: 1000 });

      isInitialized.current = true;
    }
  }, [
    autoFitScale,
    width,
    height,
    patterns.length,
    positions,
    scale,
    translateX,
    translateY,
  ]);

  // Generate edges
  const edges = patterns.flatMap((pattern) =>
    pattern.prerequisites.map((prereqId) => ({
      from: prereqId,
      to: pattern.id,
    })),
  );

  // Simple gesture handling
  const savedScale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.1), 3);
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
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
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.gestureContainer, animatedStyle]}>
          <Svg
            width={svgWidth}
            height={svgHeight}
            shouldRasterizeIOS={patterns.length > 100}
          >
            <Defs>
              <Marker
                id="arrowhead-graph"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
              >
                <Polygon
                  points="0 0, 10 3, 0 6"
                  fill={palette[PaletteColor.Primary]}
                />
              </Marker>
            </Defs>

            {/* Draw edges */}
            {edges.map((edge, index) => {
              const fromPos = positions.get(edge.from);
              const toPos = positions.get(edge.to);
              if (!fromPos || !toPos) return null;

              // Offset to connect from right of source to left of target
              const fromPoint = { x: fromPos.x + 50, y: fromPos.y };
              const toPoint = { x: toPos.x - 50, y: toPos.y };

              const pathData = generateCurvedPath(fromPoint, toPoint);

              return (
                <Path
                  key={`edge-${index}`}
                  d={pathData}
                  stroke={palette[PaletteColor.Primary]}
                  strokeWidth={2}
                  fill="none"
                  markerEnd="url(#arrowhead-graph)"
                  opacity={0.6}
                />
              );
            })}

            {/* Draw nodes */}
            {patterns.map((pattern) => {
              const pos = positions.get(pattern.id);
              if (!pos) return null;

              return (
                <PatternNode
                  key={pattern.id}
                  pattern={pattern}
                  x={pos.x}
                  y={pos.y}
                  palette={palette}
                  onPress={onNodeTap}
                />
              );
            })}
          </Svg>
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
      left: -100,
      right: 0,
      bottom: 0,

      alignItems: "center",
      justifyContent: "center",
      // This fills the entire screen area to ensure gestures work everywhere
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
