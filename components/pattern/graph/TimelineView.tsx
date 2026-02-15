import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { WCSPatternType } from "@/components/pattern/types/WCSPatternEnums";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  detectCircularDependencies,
  generateEdges,
  generateOrthogonalPath,
  generateSkipLevelPath,
  LayoutPosition,
} from "./utils/GraphUtils";
import { ArrowheadMarker, drawNodes } from "./GraphSvg";
import { useTranslation } from "react-i18next";
import {
  MIN_PATTERN_HEIGHT,
  MIN_PATTERNS_VISIBLE,
} from "@/components/pattern/graph/types/Constants";
import {
  calculateTimelineLayout,
  SkipLevelEdgeInfo,
  SwimlaneInfo,
} from "@/components/pattern/graph/utils/TimelineGraphUtils";

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
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const styles = getStyles(palette);

  const { positions, svgWidth, svgHeight, swimlanes, skipLevelEdges } =
    useMemo(() => {
      detectCircularDependencies(patterns);

      const minBaseHeight = MIN_PATTERN_HEIGHT * MIN_PATTERNS_VISIBLE;
      const baseHeight = Math.max(screenHeight, minBaseHeight);

      const {
        positions,
        minHeight,
        actualWidth,
        swimlanes,
        skipLevelEdgeInfos,
      } = calculateTimelineLayout(patterns, screenWidth, baseHeight);

      return {
        positions,
        svgWidth: actualWidth,
        svgHeight: minHeight,
        swimlanes,
        skipLevelEdges: skipLevelEdgeInfos,
      };
    }, [patterns, screenHeight, screenWidth]);

  if (patterns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("noPatternsToVisualize")}</Text>
      </View>
    );
  }

  const edges = generateEdges(patterns);

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={{ width: svgWidth, height: svgHeight }}
    >
      <Svg
        width={svgWidth}
        height={svgHeight}
        shouldRasterizeIOS={patterns.length > 100}
      >
        <ArrowheadMarker palette={palette} />
        {drawSwimlanes(swimlanes, svgWidth, palette)}
        {drawTimelineEdges(edges, positions, skipLevelEdges, palette)}
        {drawNodes(patterns, positions, palette, onNodeTap)}
      </Svg>
    </ScrollView>
  );
};

/**
 * Draw edges with optimized routing for skip-level edges.
 * Skip-level edges route through the cleared space below shifted nodes.
 */
function drawTimelineEdges(
  edges: { from: number; to: number }[],
  positions: Map<number, LayoutPosition>,
  skipLevelEdges: SkipLevelEdgeInfo[],
  palette: Record<PaletteColor, string>,
) {
  // Create a map of skip-level edges for quick lookup
  const skipLevelEdgeMap = new Map<string, SkipLevelEdgeInfo>();
  skipLevelEdges.forEach((edge) => {
    if (edge.intermediateNodeIds.length > 0) {
      const key = `${edge.fromId}-${edge.toId}`;
      skipLevelEdgeMap.set(key, edge);
    }
  });

  return (
    <>
      {edges.map((edge, index) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return null;

        const edgeKey = `${edge.from}-${edge.to}`;
        const skipLevelInfo = skipLevelEdgeMap.get(edgeKey);

        let pathData: string;
        if (skipLevelInfo && skipLevelInfo.intermediateNodeIds.length > 0) {
          // This is a skip-level edge with shifted nodes - use optimized routing
          // Use the pre-calculated original Y position from the edge info
          console.log("hihi", skipLevelInfo);
          pathData = generateSkipLevelPath(
            fromPos,
            toPos,
            skipLevelInfo.originalIntermediateY,
            skipLevelInfo.firstIntermediateX,
            skipLevelInfo.lastIntermediateX,
          );
        } else {
          // Regular edge - use standard orthogonal routing
          pathData = generateOrthogonalPath(fromPos, toPos);
          console.log("hihi2");
        }

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
    </>
  );
}

function drawSwimlanes(
  swimlanes: Record<WCSPatternType, SwimlaneInfo>,
  svgWidth: number,
  palette: Record<PaletteColor, string>,
) {
  return (
    <>
      {createSwimlaneBackground(
        swimlanes[WCSPatternType.PUSH],
        svgWidth,
        palette[PaletteColor.Primary],
      )}
      {createSwimlaneBackground(
        swimlanes[WCSPatternType.PASS],
        svgWidth,
        palette[PaletteColor.SecondaryText],
      )}
      {createSwimlaneBackground(
        swimlanes[WCSPatternType.WHIP],
        svgWidth,
        palette[PaletteColor.Accent],
      )}
      {createSwimlaneBackground(
        swimlanes[WCSPatternType.TUCK],
        svgWidth,
        palette[PaletteColor.Error],
      )}

      {createSwimlaneLabel(
        WCSPatternType.PUSH,
        swimlanes[WCSPatternType.PUSH],
        palette[PaletteColor.Primary],
      )}
      {createSwimlaneLabel(
        WCSPatternType.PASS,
        swimlanes[WCSPatternType.PASS],
        palette[PaletteColor.SecondaryText],
      )}
      {createSwimlaneLabel(
        WCSPatternType.WHIP,
        swimlanes[WCSPatternType.WHIP],
        palette[PaletteColor.Accent],
      )}
      {createSwimlaneLabel(
        WCSPatternType.TUCK,
        swimlanes[WCSPatternType.TUCK],
        palette[PaletteColor.Error],
      )}
    </>
  );
}

function createSwimlaneBackground(
  swimlanes: SwimlaneInfo,
  svgWidth: number,
  color: string,
) {
  return (
    <Rect
      x={0}
      y={swimlanes.y}
      width={svgWidth}
      height={swimlanes.height}
      fill={color}
      fillOpacity={0.1}
    />
  );
}

function createSwimlaneLabel(
  patternType: WCSPatternType,
  swimlane: SwimlaneInfo,
  color: string,
) {
  return (
    <SvgText
      x={20}
      y={swimlane.y + 25}
      fontSize={16}
      fontWeight="bold"
      fill={color}
      fillOpacity={0.5}
    >
      {patternType.toUpperCase()}
    </SvgText>
  );
}

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
