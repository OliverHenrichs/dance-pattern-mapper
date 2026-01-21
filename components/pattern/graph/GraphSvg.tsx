import React from "react";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { generateCurvedPath } from "./GraphUtils";
import PatternNode from "./PatternNode";

interface GraphSvgProps {
  svgWidth: number;
  svgHeight: number;
  patterns: WCSPattern[];
  positions: Map<number, { x: number; y: number }>;
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: WCSPattern) => void;
}

const GraphSvg: React.FC<GraphSvgProps> = ({
  svgWidth,
  svgHeight,
  patterns,
  positions,
  palette,
  onNodeTap,
}) => {
  // Generate edges
  const edges = patterns.flatMap((pattern) =>
    pattern.prerequisites.map((prereqId) => ({
      from: prereqId,
      to: pattern.id,
    })),
  );

  return (
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
  );
};

export default GraphSvg;
