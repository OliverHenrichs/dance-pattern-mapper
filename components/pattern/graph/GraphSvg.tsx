import React from "react";
import Svg, { Defs, Marker, Path, Polygon } from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  generateEdges,
  generateOrthogonalPath,
  LayoutPosition,
} from "./utils/GraphUtils";
import PatternNode from "./PatternNode";
import {
  IGraphPosition,
  IGraphSvgProps,
} from "@/components/pattern/graph/types/IGraphSvgProps";

export const ArrowheadMarker: React.FC<{
  palette: Record<PaletteColor, string>;
}> = ({ palette }) => (
  <Defs>
    <Marker
      id="arrowhead-graph"
      markerWidth="5"
      markerHeight="5"
      refX="0"
      refY="3"
      orient="auto"
    >
      <Polygon points="0 0, 10 3, 0 6" fill={palette[PaletteColor.Primary]} />
    </Marker>
  </Defs>
);

export function drawEdges(
  edges: { from: number; to: number }[],
  positions: IGraphPosition,
  palette: Record<PaletteColor, string>,
) {
  return (
    <>
      {edges.map((edge, index) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return null;
        return (
          <Path
            key={`edge-${index}`}
            d={generateOrthogonalPath(fromPos, toPos)}
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

export function drawNodes(
  patterns: WCSPattern[],
  positions: Map<number, LayoutPosition>,
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

const NetworkGraphSvg: React.FC<IGraphSvgProps> = ({
  svgWidth,
  svgHeight,
  patterns,
  positions,
  palette,
  onNodeTap,
}) => {
  const edges = generateEdges(patterns);
  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      shouldRasterizeIOS={patterns.length > 100}
    >
      <ArrowheadMarker palette={palette} />
      {drawEdges(edges, positions, palette)}
      {drawNodes(patterns, positions, palette, onNodeTap)}
    </Svg>
  );
};

export default NetworkGraphSvg;
