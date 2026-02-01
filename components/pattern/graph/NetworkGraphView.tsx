import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import { useGraphLayout } from "./hooks/useGraphLayout";
import NetworkGraphSvg from "./GraphSvg";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { LayoutPosition } from "@/components/pattern/graph/utils/GraphUtils";

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
  const { positions, svgWidth, svgHeight } = useGraphLayout(patterns);
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
  patterns: WCSPattern[],
  positions: Map<number, LayoutPosition>,
  palette: Record<PaletteColor, string>,
  onNodeTap: (pattern: WCSPattern) => void,
) {
  const styles = getStyles(palette);
  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={4.5}
        minZoom={0.15}
        zoomStep={0.5}
        initialZoom={0.5}
        bindToBorders={false}
      >
        <NetworkGraphSvg
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          patterns={patterns}
          positions={positions}
          palette={palette}
          onNodeTap={onNodeTap}
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
