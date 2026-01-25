import React from "react";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  generateCurvedPath,
  generateEdges,
  generateOrthogonalPath,
  LayoutPosition,
} from "./GraphUtils";
import PatternNode from "./PatternNode";

export type GraphViewMode = "timeline" | "network";
type IGraphPosition = Map<number, LayoutPosition>;

interface GraphSvgProps {
  svgWidth: number;
  svgHeight: number;
  patterns: WCSPattern[];
  positions: IGraphPosition;
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: WCSPattern) => void;
  viewMode: GraphViewMode;
}

function drawEdges(
  edges: { from: number; to: number }[],
  positions: IGraphPosition,
  viewMode: "timeline" | "network",
  palette: Record<PaletteColor, string>,
) {
  return (
    <>
      {edges.map((edge, index) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return null;

        let pathData: string;

        if (viewMode === "network") {
          // Use orthogonal paths that connect from the closest sides
          pathData = generateOrthogonalPath(fromPos, toPos);
        } else {
          // Timeline view: use curved paths from right to left
          const fromPoint = { x: fromPos.x + 50, y: fromPos.y };
          const toPoint = { x: toPos.x - 50, y: toPos.y };
          pathData = generateCurvedPath(fromPoint, toPoint);
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

function drawNodes(
  patterns: WCSPattern[],
  positions: Map<
    number,
    {
      x: number;
      y: number;
    }
  >,
  palette: Record<PaletteColor, string>,
  onNodeTap: (pattern: WCSPattern) => void,
) {
  return patterns.map((pattern) => {
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
  });
}

const GraphSvg: React.FC<GraphSvgProps> = ({
  svgWidth,
  svgHeight,
  patterns,
  positions,
  palette,
  onNodeTap,
  viewMode,
}) => {
  const edges = generateEdges(patterns);
  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      shouldRasterizeIOS={patterns.length > 100}
    >
      <Defs>
        <Marker
          id="arrowhead-graph"
          markerWidth="5"
          markerHeight="5"
          refX="0"
          refY="3"
          orient="auto"
        >
          <Polygon
            points="0 0, 10 3, 0 6"
            fill={palette[PaletteColor.Primary]}
          />
        </Marker>
      </Defs>
      {drawEdges(edges, positions, viewMode, palette)}
      {drawNodes(patterns, positions, palette, onNodeTap)}
    </Svg>
  );
};

export default GraphSvg;
