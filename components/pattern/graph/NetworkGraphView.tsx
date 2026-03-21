import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pattern } from "@/components/pattern/types/PatternList";
import { PatternType } from "@/components/pattern/types/PatternType";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useGraphLayout } from "./hooks/useGraphLayout";
import NetworkGraphSvg from "./GraphSvg";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { LayoutPosition } from "@/components/pattern/graph/utils/GraphUtils";

interface NetworkGraphViewProps {
  patterns: Pattern[];
  patternTypes?: PatternType[]; // Optional: if provided, creates color map
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: Pattern) => void;
}

const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  patterns,
  patternTypes,
  palette,
  onNodeTap,
}) => {
  const { positions, svgWidth, svgHeight, ellipseCenterX, ellipseCenterY } =
    useGraphLayout(patterns);

  // Create type color map if patternTypes provided
  const typeColorMap = useMemo(() => {
    if (!patternTypes) return undefined;
    const map = new Map<string, string>();
    patternTypes.forEach((type) => {
      map.set(type.id, type.color);
    });
    return map;
  }, [patternTypes]);

  if (patterns.length === 0) {
    return createEmptyNetworkGraph(palette);
  }

  return createNetworkGraph(
    svgWidth,
    svgHeight,
    ellipseCenterX,
    ellipseCenterY,
    patterns,
    positions,
    palette,
    onNodeTap,
    typeColorMap,
  );
};

function createEmptyNetworkGraph(palette: Record<PaletteColor, string>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();
  const styles = getStyles(palette);
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t("noPatternsToVisualize")}</Text>
    </View>
  );
}

function createNetworkGraph(
  svgWidth: number,
  svgHeight: number,
  ellipseCenterX: number,
  ellipseCenterY: number,
  patterns: Pattern[],
  positions: Map<number, LayoutPosition>,
  palette: Record<PaletteColor, string>,
  onNodeTap: (pattern: Pattern) => void,
  typeColorMap?: Map<string, string>,
) {
  const INITIAL_ZOOM = 0.35;

  // The zoomable view centers the SVG mid-point (svgWidth/2, svgHeight/2) in the
  // viewport by default (offset 0,0). To center the ellipse instead, we shift by
  // the difference between the SVG mid-point and the ellipse center, scaled by zoom.
  const initialOffsetX = (svgWidth / 2 - ellipseCenterX) * INITIAL_ZOOM;
  const initialOffsetY = (svgHeight / 2 - ellipseCenterY) * INITIAL_ZOOM;

  const styles = getStyles(palette);
  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={4.5}
        minZoom={0.15}
        zoomStep={0.5}
        initialZoom={INITIAL_ZOOM}
        initialOffsetX={initialOffsetX}
        initialOffsetY={initialOffsetY}
        bindToBorders={false}
      >
        <NetworkGraphSvg
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          patterns={patterns as any}
          positions={positions}
          palette={palette}
          onNodeTap={onNodeTap as any}
          typeColorMap={typeColorMap}
        />
      </ReactNativeZoomableView>
    </View>
  );
}

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
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
