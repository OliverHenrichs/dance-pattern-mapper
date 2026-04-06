import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { IPattern } from "@/src/pattern/types/IPatternList";
import { PatternType } from "@/src/pattern/types/PatternType";
import { PaletteColor } from "@/src/common/utils/ColorPalette";
import { useTranslation } from "react-i18next";
import { useGraphLayout } from "./hooks/useGraphLayout";
import NetworkGraphSvg from "./GraphSvg";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { LayoutPosition } from "@/src/pattern/graph/utils/GraphUtils";

interface NetworkGraphViewProps {
  patterns: IPattern[];
  patternTypes: PatternType[];
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: IPattern) => void;
}

const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  patterns,
  patternTypes,
  palette,
  onNodeTap,
}) => {
  const { positions, svgWidth, svgHeight } = useGraphLayout(patterns);

  // Create type color map if patternTypes provided
  const typeColorMap = useMemo(() => {
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
  patterns: IPattern[],
  positions: Map<number, LayoutPosition>,
  palette: Record<PaletteColor, string>,
  onNodeTap: (pattern: IPattern) => void,
  typeColorMap: Map<string, string>,
) {
  const INITIAL_ZOOM = 0.35;

  const styles = getStyles(palette);
  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={4.5}
        minZoom={0.15}
        zoomStep={0.5}
        initialZoom={INITIAL_ZOOM}
        initialOffsetX={0}
        initialOffsetY={0}
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
