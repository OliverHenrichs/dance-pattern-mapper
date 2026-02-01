import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  calculatePrerequisiteDepthMap,
  LayoutPosition,
} from "@/components/pattern/graph/utils/GraphUtils";

/**
 * Calculate layout positions for network graph view.
 * Uses elliptical layout for foundational nodes, with dependencies
 * spreading radially outward perpendicular to the ellipse's surface.
 */
export function calculateGraphLayout(
  patterns: WCSPattern[],
  width: number,
  height: number,
): Map<number, LayoutPosition> {
  const depthMap = calculatePrerequisiteDepthMap(patterns);
  const foundationalPatterns = getFoundationalPatterns(patterns, depthMap);
  const positions = calculateFoundationalPatternPositions(
    width,
    height,
    foundationalPatterns,
  );

  // Build dependency tree for each foundational pattern
  const patternMap = new Map<number, WCSPattern>();
  patterns.forEach((p) => patternMap.set(p.id, p));

  // For each foundational pattern, position its descendants radially
  foundationalPatterns.forEach((foundational, index) => {
    const descendants = collectDescendants(foundational.id, patterns, depthMap);
    const angle = (index / foundationalPatterns.length) * 2 * Math.PI;
    const foundationalPos = positions.get(foundational.id)!;
    calculateDescendantPatternPositions(
      descendants,
      angle,
      foundationalPos,
      positions,
    );
  });

  return positions;
}

function calculateFoundationalPatternPositions(
  width: number,
  height: number,
  foundationalPatterns: WCSPattern[],
) {
  // Ellipse parameters (leave room for dependencies)
  const ellipseRadiusX = Math.min(width * 0.25, 400);
  const ellipseRadiusY = Math.min(height * 0.25, 300);

  // Center of the layout
  const centerX = width;
  const centerY = height;
  const positions = new Map<number, LayoutPosition>();
  // Position foundational patterns around the ellipse
  foundationalPatterns.forEach((pattern, index) => {
    const angle = (index / foundationalPatterns.length) * 2 * Math.PI;

    // Position on ellipse
    const x = centerX + ellipseRadiusX * Math.cos(angle);
    const y = centerY + ellipseRadiusY * Math.sin(angle);

    positions.set(pattern.id, { x, y });
  });
  return positions;
}

function getFoundationalPatterns(
  patterns: WCSPattern[],
  depthMap: Map<number, number>,
) {
  return patterns.filter((p) => (depthMap.get(p.id) || 0) === 0);
}

function collectDescendants(
  patternId: number,
  patterns: WCSPattern[],
  depthMap: Map<number, number>,
  descendants?: Map<number, WCSPattern[]>,
) {
  if (!descendants) {
    descendants = new Map<number, WCSPattern[]>();
  }
  patterns.forEach((p) => {
    if (p.prerequisites.includes(patternId)) {
      const depth = depthMap.get(p.id) || 0;
      if (!descendants.has(depth)) {
        descendants.set(depth, []);
      }
      descendants.get(depth)!.push(p);
      collectDescendants(p.id, patterns, depthMap, descendants);
    }
  });
  return descendants;
}

function calculateDescendantPatternPositions(
  descendants: Map<number, WCSPattern[]>,
  angle: number,
  foundationalPos: LayoutPosition,
  positions: Map<number, LayoutPosition>,
) {
  // Spacing between depth levels
  const depthSpacing = 280;
  // Position descendants at each depth level
  descendants.forEach((patternsAtDepth, depth) => {
    patternsAtDepth.forEach((pattern, idx) => {
      // Distance from foundational pattern
      const distance = depth * depthSpacing;
      // Spread patterns at this depth perpendicular to the radial direction
      // Calculate perpendicular offset for multiple patterns at same depth
      const numAtDepth = patternsAtDepth.length;
      const spreadAngle = numAtDepth > 1 ? Math.PI / 6 : 0; // 30 degrees spread
      const offsetAngle =
        numAtDepth > 1
          ? (idx - (numAtDepth - 1) / 2) * (spreadAngle / (numAtDepth - 1))
          : 0;

      // Calculate position along the radial direction with perpendicular offset
      const finalAngle = angle + offsetAngle;
      const finalDirX = Math.cos(finalAngle);
      const finalDirY = Math.sin(finalAngle);

      const x = foundationalPos.x + finalDirX * distance;
      const y = foundationalPos.y + finalDirY * distance;

      positions.set(pattern.id, { x, y });
    });
  });
}
