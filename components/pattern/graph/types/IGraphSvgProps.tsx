import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { PaletteColor } from "@/components/common/ColorPalette";
import { LayoutPosition } from "@/components/pattern/graph/GraphUtils";

export interface IGraphSvgProps {
  svgWidth: number;
  svgHeight: number;
  patterns: WCSPattern[];
  positions: IGraphPosition;
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: WCSPattern) => void;
}

export type IGraphPosition = Map<number, LayoutPosition>;
