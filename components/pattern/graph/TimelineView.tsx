import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  Marker,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  calculatePrerequisiteDepth,
  calculateTimelineLayout,
  detectCircularDependencies,
  generateCurvedPath,
} from "./GraphUtils";
import PatternNode from "./PatternNode";
import { useTranslation } from "react-i18next";

interface TimelineViewProps {
  patterns: WCSPattern[];
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: WCSPattern) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  patterns,
  palette,
  onNodeTap,
}) => {
  const { t } = useTranslation();
  const styles = getStyles(palette);

  // Memoized layout calculations
  const { positions, svgWidth, svgHeight } = useMemo(() => {
    // Detect circular dependencies
    detectCircularDependencies(patterns);

    const baseHeight = 1000;
    const depthMap = calculatePrerequisiteDepth(patterns);
    const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
    const calculatedWidth = Math.max(800, (maxDepth + 2) * 150);

    const { positions, minHeight } = calculateTimelineLayout(
      patterns,
      calculatedWidth,
      baseHeight,
    );

    return {
      positions,
      svgWidth: calculatedWidth,
      svgHeight: minHeight,
    };
  }, [patterns]);

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

  const swimlaneHeight = svgHeight / 3;

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={{ minWidth: svgWidth + 100 }}
    >
      <Svg
        width={svgWidth}
        height={svgHeight}
        shouldRasterizeIOS={patterns.length > 100}
      >
        {/* Define arrowhead marker */}
        <Defs>
          <Marker
            id="arrowhead"
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

        {/* Swimlane backgrounds */}
        <Rect
          x={0}
          y={0}
          width={svgWidth}
          height={swimlaneHeight}
          fill={palette[PaletteColor.Background]}
          fillOpacity={0.3}
        />
        <Rect
          x={0}
          y={swimlaneHeight}
          width={svgWidth}
          height={swimlaneHeight}
          fill={palette[PaletteColor.Background]}
          fillOpacity={0.5}
        />
        <Rect
          x={0}
          y={swimlaneHeight * 2}
          width={svgWidth}
          height={swimlaneHeight}
          fill={palette[PaletteColor.Background]}
          fillOpacity={0.7}
        />

        {/* Swimlane labels */}
        <SvgText
          x={20}
          y={30}
          fontSize={16}
          fontWeight="bold"
          fill={palette[PaletteColor.PrimaryText]}
        >
          {t("beginner")}
        </SvgText>
        <SvgText
          x={20}
          y={swimlaneHeight + 30}
          fontSize={16}
          fontWeight="bold"
          fill={palette[PaletteColor.PrimaryText]}
        >
          {t("intermediate")}
        </SvgText>
        <SvgText
          x={20}
          y={swimlaneHeight * 2 + 30}
          fontSize={16}
          fontWeight="bold"
          fill={palette[PaletteColor.PrimaryText]}
        >
          {t("advanced")}
        </SvgText>

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
              markerEnd="url(#arrowhead)"
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
    </ScrollView>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
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

export default TimelineView;
