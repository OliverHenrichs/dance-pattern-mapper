import React from "react";
import { StyleSheet, View } from "react-native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import TimelineView from "./TimelineView";
import NetworkGraphView from "./NetworkGraphView";
import Legend from "./Legend";

type ViewMode = "timeline" | "graph";

interface GraphViewContainerProps {
  viewMode: ViewMode;
  patterns: WCSPattern[];
  palette: Record<PaletteColor, string>;
  resetKey: number;
  onNodeTap: (pattern: WCSPattern) => void;
}

const GraphViewContainer: React.FC<GraphViewContainerProps> = ({
  viewMode,
  patterns,
  palette,
  resetKey,
  onNodeTap,
}) => {
  const styles = getStyles(palette);

  return (
    <>
      <View style={styles.viewContainer}>
        {viewMode === "timeline" ? (
          <TimelineView
            key={`timeline-${resetKey}`}
            patterns={patterns}
            palette={palette}
            onNodeTap={onNodeTap}
          />
        ) : (
          <NetworkGraphView
            key={`graph-${resetKey}`}
            patterns={patterns}
            palette={palette}
            onNodeTap={onNodeTap}
          />
        )}
      </View>

      <Legend palette={palette} />
    </>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    viewContainer: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
    },
  });

export default GraphViewContainer;
