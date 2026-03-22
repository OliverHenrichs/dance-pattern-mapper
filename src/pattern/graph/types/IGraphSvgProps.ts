import { PaletteColor } from "@/src/common/utils/ColorPalette";
import { LayoutPosition } from "@/src/pattern/graph/utils/GraphUtils";
import { IPattern } from "@/src/pattern/types/IPatternList";

export interface IGraphSvgProps {
  svgWidth: number;
  svgHeight: number;
  patterns: IPattern[];
  positions: IGraphPosition;
  palette: Record<PaletteColor, string>;
  onNodeTap: (pattern: IPattern) => void;
  typeColorMap: Map<string, string>;
}

export type IGraphPosition = Map<number, LayoutPosition>;
