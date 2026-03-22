import React from "react";
import { StyleSheet, View } from "react-native";
import { IPattern } from "@/src/pattern/types/IPatternList";
import { PatternType } from "@/src/pattern/types/PatternType";
import { PaletteColor } from "@/src/common/utils/ColorPalette";
import TimelineView from "./TimelineView";
import NetworkGraphView from "./NetworkGraphView";
import Legend from "./Legend";

type ViewMode = "timeline" | "graph";

interface GraphViewContainerProps {
  viewMode: ViewMode;
  patterns: IPattern[];
  patternTypes: PatternType[];
  palette: Record<PaletteColor, string>;
  resetKey: number;
  onNodeTap: (pattern: IPattern) => void;
}

const GraphViewContainer: React.FC<GraphViewContainerProps> = ({
  viewMode,
  patterns,
  patternTypes,
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
            patternTypes={patternTypes}
            palette={palette}
            onNodeTap={onNodeTap}
          />
        ) : (
          <NetworkGraphView
            key={`graph-${resetKey}`}
            patterns={patterns}
            patternTypes={patternTypes}
            palette={palette}
            onNodeTap={onNodeTap}
          />
        )}
      </View>

      <Legend palette={palette} patternTypes={patternTypes} />
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
