import React from "react";
import { G, Rect, Text as SvgText } from "react-native-svg";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";
import { PaletteColor } from "@/components/common/ColorPalette";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
} from "@/components/pattern/graph/types/Constants";

interface PatternNodeProps {
  pattern: WCSPattern;
  x: number;
  y: number;
  palette: Record<PaletteColor, string>;
  onPress: (pattern: WCSPattern) => void;
}

const PatternNode: React.FC<PatternNodeProps> = ({
  pattern,
  x,
  y,
  palette,
  onPress,
}) => {
  // Determine border color based on pattern type
  const getBorderColor = (): string => {
    switch (pattern.type) {
      case WCSPatternType.PUSH:
        return palette[PaletteColor.Primary];
      case WCSPatternType.PASS:
        return palette[PaletteColor.SecondaryText];
      case WCSPatternType.WHIP:
        return palette[PaletteColor.Accent];
      case WCSPatternType.TUCK:
        return palette[PaletteColor.Error];
      default:
        return palette[PaletteColor.Primary];
    }
  };

  // Determine background opacity based on level
  const getBackgroundOpacity = (): number => {
    switch (pattern.level) {
      case WCSPatternLevel.BEGINNER:
        return 0.3;
      case WCSPatternLevel.INTERMEDIATE:
        return 0.5;
      case WCSPatternLevel.ADVANCED:
        return 0.7;
      default:
        return 0.3;
    }
  };

  const isFoundational = pattern.prerequisites.length === 0;
  const borderColor = getBorderColor();
  const bgOpacity = getBackgroundOpacity();

  // Truncate long pattern names
  const displayName =
    pattern.name.length > 12
      ? pattern.name.substring(0, 11) + "..."
      : pattern.name;

  return (
    <G onPress={() => onPress(pattern)}>
      {/* Main background */}
      <Rect
        x={x - NODE_WIDTH / 2}
        y={y - NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        fill={palette[PaletteColor.PrimaryText]}
        fillOpacity={bgOpacity}
        stroke={borderColor}
        strokeWidth={2}
        rx={4}
      />

      {/* Double border for foundational patterns */}
      {isFoundational && (
        <Rect
          x={x - NODE_WIDTH / 2 + 3}
          y={y - NODE_HEIGHT / 2 + 3}
          width={NODE_WIDTH - 6}
          height={NODE_HEIGHT - 6}
          fill="none"
          stroke={borderColor}
          strokeWidth={1}
          rx={2}
        />
      )}

      {/* Pattern name */}
      <SvgText
        x={x}
        y={y - 5}
        fontSize={12}
        fontWeight="bold"
        fill={palette[PaletteColor.PrimaryText]}
        textAnchor="middle"
      >
        {displayName}
      </SvgText>

      {/* Counts */}
      <SvgText
        x={x}
        y={y + 11}
        fontSize={10}
        fill={palette[PaletteColor.SecondaryText]}
        textAnchor="middle"
      >
        {`${pattern.counts} count`}
      </SvgText>
    </G>
  );
};

export default React.memo(PatternNode);
