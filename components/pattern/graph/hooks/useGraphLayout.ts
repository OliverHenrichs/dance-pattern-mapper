import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  calculateGraphLayout,
  detectCircularDependencies,
  LayoutPosition,
} from "../GraphUtils";
// Layout constants
const INITIAL_WIDTH_MULTIPLIER = 3;
const INITIAL_HEIGHT_MULTIPLIER = 2;
const CONTENT_PADDING = 300;
interface GraphLayoutResult {
  positions: Map<number, LayoutPosition>;
  svgWidth: number;
  svgHeight: number;
}
interface ContentBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
/**
 * Calculate the bounding box containing all pattern positions
 */
export function calculateContentBounds(
  positions: Map<number, LayoutPosition>,
): ContentBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  positions.forEach((pos) => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });
  return { minX, maxX, minY, maxY };
}
/**
 * Calculate SVG dimensions based on content bounds and initial dimensions
 */
export function calculateSvgDimensions(
  bounds: ContentBounds,
  initialWidth: number,
  initialHeight: number,
): { svgWidth: number; svgHeight: number } {
  const contentWidth = bounds.maxX - bounds.minX + CONTENT_PADDING;
  const contentHeight = bounds.maxY - bounds.minY + CONTENT_PADDING;
  // SVG should be large enough to contain all patterns with padding
  const svgWidth = Math.max(initialWidth, contentWidth);
  const svgHeight = Math.max(initialHeight, contentHeight);
  return { svgWidth, svgHeight };
}
/**
 * Custom hook for calculating graph layout positions and dimensions.
 * Handles circular dependency detection, position calculations,
 * and SVG canvas sizing based on window dimensions.
 */
export function useGraphLayout(patterns: WCSPattern[]): GraphLayoutResult {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const initialWidth = width * INITIAL_WIDTH_MULTIPLIER;
    const initialHeight = height * INITIAL_HEIGHT_MULTIPLIER;
    // Detect and log circular dependencies
    detectCircularDependencies(patterns);
    // Calculate pattern positions
    const positions = calculateGraphLayout(
      patterns,
      initialWidth,
      initialHeight,
    );
    // Handle empty graph case
    if (positions.size === 0) {
      return {
        positions,
        svgWidth: initialWidth,
        svgHeight: initialHeight,
      };
    }
    // Calculate content bounds and SVG dimensions
    const bounds = calculateContentBounds(positions);
    const dimensions = calculateSvgDimensions(
      bounds,
      initialWidth,
      initialHeight,
    );
    return {
      positions,
      ...dimensions,
    };
  }, [patterns, width, height]);
}
