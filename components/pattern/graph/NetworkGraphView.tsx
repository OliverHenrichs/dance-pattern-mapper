import React, { useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
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

  // Gesture state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const baseScale = useRef(1);
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const { width, height } = Dimensions.get("window");
  const svgWidth = width * 3;
  const svgHeight = height * 2;

  // Memoized layout calculations
  const { positions, autoFitScale } = useMemo(() => {
    // Detect circular dependencies
    detectCircularDependencies(patterns);

    const positions = calculateGraphLayout(patterns, svgWidth, svgHeight);

    // Calculate auto-fit scale
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
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const autoFitScale = Math.min(Math.max(scaleX, scaleY, 0.3), 1.0);

    return { positions, autoFitScale };
  }, [patterns, svgWidth, svgHeight, width, height]);

  // Set initial scale to auto-fit
  React.useEffect(() => {
    scale.setValue(autoFitScale);
    baseScale.current = autoFitScale;
    lastScale.current = autoFitScale;
  }, [autoFitScale, scale]);

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

  const handlePinchGesture = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { scale: eventScale, state } = event.nativeEvent;

        if (state === State.ACTIVE) {
          const newScale = lastScale.current * eventScale;
          // Clamp between 0.3 and 2.0
          const clampedScale = Math.min(Math.max(newScale, 0.3), 2.0);
          scale.setValue(clampedScale);
        } else if (state === State.END) {
          lastScale.current = (scale as any)._value;
        }
      },
    },
  );

  const handlePanGesture = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationX: tx, translationY: ty, state } = event.nativeEvent;

        if (state === State.ACTIVE) {
          translateX.setValue(lastTranslateX.current + tx);
          translateY.setValue(lastTranslateY.current + ty);
        } else if (state === State.END) {
          lastTranslateX.current = (translateX as any)._value;
          lastTranslateY.current = (translateY as any)._value;
        }
      },
    },
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View style={{ flex: 1 }}>
          <PinchGestureHandler onGestureEvent={handlePinchGesture}>
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
                {/* Define arrowhead marker */}
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
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
    },
    svgContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
