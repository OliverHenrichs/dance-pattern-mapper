import React, { useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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

  // Gesture state - initialize with refs to avoid recreating on every render
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const baseScale = useRef(1);
  const baseTranslateX = useRef(0);
  const baseTranslateY = useRef(0);
  const isInitialized = useRef(false);

  const { width, height } = Dimensions.get("window");
  const svgWidth = width * 3;
  const svgHeight = height * 2;

  // Memoized layout calculations
  const { positions, autoFitScale, contentCenterX, contentCenterY } =
    useMemo(() => {
      // Detect circular dependencies
      detectCircularDependencies(patterns);

      const positions = calculateGraphLayout(patterns, svgWidth, svgHeight);

      if (positions.size === 0) {
        return {
          positions,
          autoFitScale: 1,
          contentCenterX: svgWidth / 2,
          contentCenterY: svgHeight / 2,
        };
      }

      // Calculate auto-fit scale and center position
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

      const contentWidth = maxX - minX + 200;
      const contentHeight = maxY - minY + 200;
      const contentCenterX = (minX + maxX) / 2;
      const contentCenterY = (minY + maxY) / 2;

      const scaleX = width / contentWidth;
      const scaleY = height / contentHeight;
      const autoFitScale = Math.min(Math.max(scaleX, scaleY, 0.3), 1.0);

      return { positions, autoFitScale, contentCenterX, contentCenterY };
    }, [patterns, svgWidth, svgHeight, width, height]);

  // Set initial scale and position to auto-fit - only once
  React.useEffect(() => {
    if (!isInitialized.current && patterns.length > 0) {
      scale.setValue(autoFitScale);
      baseScale.current = autoFitScale;

      // Center the actual pattern content in the visible area
      // We need to translate so that the content center is at screen center
      const offsetX = width / 2 - contentCenterX * autoFitScale;
      const offsetY = height / 2 - contentCenterY * autoFitScale;

      translateX.setValue(offsetX);
      translateY.setValue(offsetY);
      baseTranslateX.current = offsetX;
      baseTranslateY.current = offsetY;

      isInitialized.current = true;
    }
  }, [
    autoFitScale,
    contentCenterX,
    contentCenterY,
    scale,
    translateX,
    translateY,
    width,
    height,
    patterns.length,
  ]);

  if (patterns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("noPatternsToVisualize")}</Text>
      </View>
    );
  }

  // Generate edges
  const edges = patterns.flatMap((pattern) =>
    pattern.prerequisites.map((prereqId) => ({
      from: prereqId,
      to: pattern.id,
    })),
  );

  // Create gestures using the new Gesture API
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseScale.current = (scale as any)._value || 1;
    })
    .onUpdate((event) => {
      const newScale = baseScale.current * event.scale;
      const clampedScale = Math.min(Math.max(newScale, 0.3), 3.0);
      scale.setValue(clampedScale);
    })
    .onEnd(() => {
      baseScale.current = (scale as any)._value || baseScale.current;
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      baseTranslateX.current = (translateX as any)._value || 0;
      baseTranslateY.current = (translateY as any)._value || 0;
    })
    .onUpdate((event) => {
      const newTranslateX = baseTranslateX.current + event.translationX;
      const newTranslateY = baseTranslateY.current + event.translationY;

      const maxTranslate = Math.max(width, height) * 3;
      const boundedX = Math.max(
        -maxTranslate,
        Math.min(maxTranslate, newTranslateX),
      );
      const boundedY = Math.max(
        -maxTranslate,
        Math.min(maxTranslate, newTranslateY),
      );

      translateX.setValue(boundedX);
      translateY.setValue(boundedY);
    })
    .onEnd(() => {
      baseTranslateX.current =
        (translateX as any)._value || baseTranslateX.current;
      baseTranslateY.current =
        (translateY as any)._value || baseTranslateY.current;
    });

  // Compose gestures to work simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.svgContainer,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
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
    svgContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
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
