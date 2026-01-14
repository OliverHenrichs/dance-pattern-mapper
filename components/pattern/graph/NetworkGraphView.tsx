import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

  // Generate edges
  const edges = patterns.flatMap((pattern) =>
    pattern.prerequisites.map((prereqId) => ({
      from: prereqId,
      to: pattern.id,
    })),
  );

  // Simple gesture handling
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const avgFocalDistanceX = useSharedValue(0);
  const avgFocalDistanceY = useSharedValue(0);
  const xCurrent = useSharedValue(0);
  const yCurrent = useSharedValue(0);
  const xPrevious = useSharedValue(0);
  const yPrevious = useSharedValue(0);
  const scaleCurrent = useSharedValue(0.5);
  const scalePrevious = useSharedValue(1);
  const updateCount = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onBegin((event) => {
      updateCount.value = 0;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
      avgFocalDistanceX.value = 0;
      avgFocalDistanceY.value = 0;
      scalePrevious.value = scaleCurrent.value;
    })
    .onUpdate((event) => {
      if (event.numberOfPointers === 2) {
        updateCount.value++;
        // Skip first 2 updates to let focal point stabilize
        if (updateCount.value <= 2) {
          focalX.value = event.focalX;
          focalY.value = event.focalY;
          console.log("Ignoring first couple updates");
          console.log(`f: ${focalX.value}, ${focalY.value}`);
          return;
        }

        const focalDistanceX = event.focalX - focalX.value;
        const focalDistanceY = event.focalY - focalY.value;

        // Calculate total distance from last focal point
        const distance = Math.sqrt(
          focalDistanceX * focalDistanceX + focalDistanceY * focalDistanceY,
        );
        // Reject if jump exceeds threshold (30-50px is typical)
        const maxJumpDistance = 50;
        if (distance > maxJumpDistance) {
          return;
        }
        scaleCurrent.value = scalePrevious.value * event.scale;
        xCurrent.value += scaleCurrent.value * focalDistanceX;
        yCurrent.value += scaleCurrent.value * focalDistanceY;
      }
    })
    .onEnd(() => {
      scalePrevious.value = scaleCurrent.value;
    });

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      xPrevious.value = xCurrent.value;
      yPrevious.value = yCurrent.value;
    })
    .onUpdate((event) => {
      xCurrent.value = xPrevious.value + event.translationX;
      yCurrent.value = yPrevious.value + event.translationY;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

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
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            styles.gestureContainer,
            animatedStyle,
            { width: svgWidth, height: svgHeight },
          ]}
        >
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
