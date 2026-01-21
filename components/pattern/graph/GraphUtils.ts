import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";
import {
  HORIZONTAL_SPACING,
  LEFT_MARGIN,
  NODE_HEIGHT,
  NODE_WIDTH,
  START_OFFSET,
  VERTICAL_STACK_SPACING,
} from "@/components/pattern/graph/types/Constants";

export interface LayoutPosition {
  x: number;
  y: number;
}

/**
 * Calculate the prerequisite depth for each pattern using DFS.
 * Depth is the longest chain from foundational patterns (prerequisites: []).
 * Returns a map of pattern id -> depth.
 */
export function calculatePrerequisiteDepth(
  patterns: WCSPattern[],
): Map<number, number> {
  const depthMap = new Map<number, number>();
  const patternMap = new Map<number, WCSPattern>();

  // Create pattern lookup map
  patterns.forEach((p) => patternMap.set(p.id, p));

  function getDepth(
    patternId: number,
    visited: Set<number> = new Set(),
  ): number {
    // Check if already calculated
    if (depthMap.has(patternId)) {
      return depthMap.get(patternId)!;
    }

    // Detect circular dependency
    if (visited.has(patternId)) {
      return 0; // Break cycle
    }

    const pattern = patternMap.get(patternId);
    if (!pattern) return 0;

    // Foundational pattern (no prerequisites)
    if (pattern.prerequisites.length === 0) {
      depthMap.set(patternId, 0);
      return 0;
    }

    // Calculate depth as max prerequisite depth + 1
    visited.add(patternId);
    const maxPrereqDepth = Math.max(
      ...pattern.prerequisites.map((prereqId) => getDepth(prereqId, visited)),
    );
    const depth = maxPrereqDepth + 1;
    depthMap.set(patternId, depth);

    return depth;
  }

  // Calculate depth for all patterns
  patterns.forEach((p) => getDepth(p.id));

  return depthMap;
}

/**
 * Detect circular dependencies in the pattern graph.
 * Returns an array of cycles (each cycle is an array of pattern ids).
 * Logs warnings for each detected cycle.
 */
export function detectCircularDependencies(patterns: WCSPattern[]): number[][] {
  const cycles: number[][] = [];
  const patternMap = new Map<number, WCSPattern>();
  patterns.forEach((p) => patternMap.set(p.id, p));

  function findCycles(
    patternId: number,
    visited: Set<number>,
    path: number[],
  ): void {
    if (visited.has(patternId)) {
      // Found a cycle
      const cycleStart = path.indexOf(patternId);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        cycles.push(cycle);
        console.warn(
          `Warning: Circular dependency detected between patterns: ${cycle.join(" -> ")}`,
        );
      }
      return;
    }

    const pattern = patternMap.get(patternId);
    if (!pattern) return;

    visited.add(patternId);
    path.push(patternId);

    pattern.prerequisites.forEach((prereqId) => {
      findCycles(prereqId, new Set(visited), [...path]);
    });
  }

  patterns.forEach((p) => findCycles(p.id, new Set(), []));

  return cycles;
}

/**
 * Group patterns by their WCSPatternLevel.
 */
export function groupPatternsByLevel(
  patterns: WCSPattern[],
): Record<WCSPatternLevel, WCSPattern[]> {
  const grouped: Record<WCSPatternLevel, WCSPattern[]> = {
    [WCSPatternLevel.BEGINNER]: [],
    [WCSPatternLevel.INTERMEDIATE]: [],
    [WCSPatternLevel.ADVANCED]: [],
  };

  patterns.forEach((p) => {
    const level = p.level || WCSPatternLevel.BEGINNER;
    grouped[level].push(p);
  });

  return grouped;
}

/**
 * Group patterns by their WCSPatternType.
 */
export function groupPatternsByType(
  patterns: WCSPattern[],
): Record<WCSPatternType, WCSPattern[]> {
  const grouped: Record<WCSPatternType, WCSPattern[]> = {
    [WCSPatternType.PUSH]: [],
    [WCSPatternType.PASS]: [],
    [WCSPatternType.WHIP]: [],
    [WCSPatternType.TUCK]: [],
  };

  patterns.forEach((p) => {
    grouped[p.type].push(p);
  });

  return grouped;
}

export interface SwimlaneInfo {
  y: number;
  height: number;
}

/**
 * Calculate layout positions for timeline view.
 * Patterns are arranged in horizontal swimlanes by type (push/pass/whip/tuck),
 * positioned horizontally based on their prerequisite depth,
 * with 70px vertical offsets to stack patterns at the same depth vertically.
 * Returns positions and the minimum required height.
 */
export function calculateTimelineLayout(
  patterns: WCSPattern[],
  width: number,
  baseHeight: number,
): {
  positions: Map<number, LayoutPosition>;
  minHeight: number;
  actualWidth: number;
  swimlanes: Record<WCSPatternType, SwimlaneInfo>;
} {
  const positions = new Map<number, LayoutPosition>();
  const depthMap = calculatePrerequisiteDepth(patterns);
  const grouped = groupPatternsByType(patterns);

  // Calculate max depth to determine required width
  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const requiredWidth = LEFT_MARGIN + (maxDepth + 0.5) * HORIZONTAL_SPACING;
  const actualWidth = Math.max(width, requiredWidth);

  // First pass: Calculate maximum stack height for each type group
  const maxStackPerType = new Map<string, number>();

  Object.entries(grouped).forEach(([type, typePatterns]) => {
    const depthCounts = new Map<number, number>();

    typePatterns.forEach((pattern) => {
      const depth = depthMap.get(pattern.id) || 0;
      depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
    });

    // Maximum stack height for this type is the max patterns at any depth
    const maxStack = Math.max(...Array.from(depthCounts.values()), 1);
    maxStackPerType.set(type, maxStack);
  });

  // Calculate dynamic swimlane heights based on content
  const swimlaneHeights = new Map<WCSPatternType, number>();
  const swimlaneStarts = new Map<WCSPatternType, number>();

  const typeOrder = [
    WCSPatternType.PUSH,
    WCSPatternType.PASS,
    WCSPatternType.WHIP,
    WCSPatternType.TUCK,
  ];

  let currentY = 0;

  typeOrder.forEach((type) => {
    const maxStack = maxStackPerType.get(type) || 1;
    const height =
      START_OFFSET + NODE_HEIGHT + (maxStack - 1) * VERTICAL_STACK_SPACING;

    swimlaneHeights.set(type, height);
    swimlaneStarts.set(type, currentY + START_OFFSET);
    currentY += height;
  });

  // Second pass: Position patterns using calculated swimlane positions
  // Sort patterns by their prerequisites to maintain visual consistency
  const depthTypeCounter = new Map<string, number>();

  Object.entries(grouped).forEach(([type, typePatterns]) => {
    // Sort patterns: first by depth, then by prerequisite IDs to ensure consistent ordering
    const sortedPatterns = [...typePatterns].sort((a, b) => {
      const depthA = depthMap.get(a.id) || 0;
      const depthB = depthMap.get(b.id) || 0;

      // First sort by depth
      if (depthA !== depthB) return depthA - depthB;

      // If same depth, sort by first prerequisite ID (for consistent stacking)
      const prereqA =
        a.prerequisites.length > 0 ? Math.min(...a.prerequisites) : a.id;
      const prereqB =
        b.prerequisites.length > 0 ? Math.min(...b.prerequisites) : b.id;

      if (prereqA !== prereqB) return prereqA - prereqB;

      // Finally, sort by pattern ID for complete consistency
      return a.id - b.id;
    });

    sortedPatterns.forEach((pattern) => {
      const depth = depthMap.get(pattern.id) || 0;
      const baseY = swimlaneStarts.get(type as WCSPatternType) || 0;

      // Position horizontally based on depth
      const x = LEFT_MARGIN + depth * HORIZONTAL_SPACING;

      // Track how many patterns at this depth+type for vertical stacking
      const key = `${depth}-${type}`;
      const stackIndex = depthTypeCounter.get(key) || 0;
      depthTypeCounter.set(key, stackIndex + 1);

      // Stack patterns vertically with proper spacing to avoid overlap
      const y = baseY + stackIndex * VERTICAL_STACK_SPACING;

      positions.set(pattern.id, { x, y });
    });
  });

  // Total height is the sum of all swimlane heights
  const totalHeight = currentY;

  // Build swimlane info for rendering
  const swimlaneInfo: Record<WCSPatternType, SwimlaneInfo> = {
    [WCSPatternType.PUSH]: {
      y: 0,
      height: swimlaneHeights.get(WCSPatternType.PUSH) || 0,
    },
    [WCSPatternType.PASS]: {
      y: swimlaneHeights.get(WCSPatternType.PUSH) || 0,
      height: swimlaneHeights.get(WCSPatternType.PASS) || 0,
    },
    [WCSPatternType.WHIP]: {
      y:
        (swimlaneHeights.get(WCSPatternType.PUSH) || 0) +
        (swimlaneHeights.get(WCSPatternType.PASS) || 0),
      height: swimlaneHeights.get(WCSPatternType.WHIP) || 0,
    },
    [WCSPatternType.TUCK]: {
      y:
        (swimlaneHeights.get(WCSPatternType.PUSH) || 0) +
        (swimlaneHeights.get(WCSPatternType.PASS) || 0) +
        (swimlaneHeights.get(WCSPatternType.WHIP) || 0),
      height: swimlaneHeights.get(WCSPatternType.TUCK) || 0,
    },
  };

  return {
    positions,
    minHeight: Math.max(baseHeight, totalHeight),
    actualWidth,
    swimlanes: swimlaneInfo,
  };
}

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
  const positions = new Map<number, LayoutPosition>();
  const depthMap = calculatePrerequisiteDepth(patterns);

  // Identify foundational patterns (depth 0)
  const foundationalPatterns = patterns.filter(
    (p) => (depthMap.get(p.id) || 0) === 0,
  );

  // Center of the layout
  const centerX = width / 2;
  const centerY = height / 2;

  // Ellipse parameters (leave room for dependencies)
  const ellipseRadiusX = Math.min(width * 0.25, 400);
  const ellipseRadiusY = Math.min(height * 0.25, 300);

  // Spacing between depth levels
  const depthSpacing = 180;

  // Position foundational patterns around the ellipse
  foundationalPatterns.forEach((pattern, index) => {
    const angle = (index / foundationalPatterns.length) * 2 * Math.PI;

    // Position on ellipse
    const x = centerX + ellipseRadiusX * Math.cos(angle);
    const y = centerY + ellipseRadiusY * Math.sin(angle);

    positions.set(pattern.id, { x, y });
  });

  // Build dependency tree for each foundational pattern
  const patternMap = new Map<number, WCSPattern>();
  patterns.forEach((p) => patternMap.set(p.id, p));

  // For each foundational pattern, position its descendants radially
  foundationalPatterns.forEach((foundational, index) => {
    const angle = (index / foundationalPatterns.length) * 2 * Math.PI;
    const foundationalPos = positions.get(foundational.id)!;

    // Direction perpendicular to ellipse (radial direction from center)
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    // Find all descendants of this foundational pattern
    const descendants = new Map<number, WCSPattern[]>(); // depth -> patterns

    function collectDescendants(patternId: number) {
      patterns.forEach((p) => {
        if (p.prerequisites.includes(patternId)) {
          const depth = depthMap.get(p.id) || 0;
          if (!descendants.has(depth)) {
            descendants.set(depth, []);
          }
          descendants.get(depth)!.push(p);
          collectDescendants(p.id);
        }
      });
    }

    collectDescendants(foundational.id);

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
  });

  return positions;
}

/**
 * Represents a side of a rectangular node
 */
export enum NodeSide {
  TOP = "top",
  RIGHT = "right",
  BOTTOM = "bottom",
  LEFT = "left",
}

/**
 * Calculate which side of a node is closest to a target point
 */
export function getClosestSide(
  nodePos: LayoutPosition,
  targetPos: LayoutPosition,
): NodeSide {
  const dx = targetPos.x - nodePos.x;
  const dy = targetPos.y - nodePos.y;

  // Use the direction with the larger absolute value to determine the side
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? NodeSide.RIGHT : NodeSide.LEFT;
  } else {
    return dy > 0 ? NodeSide.BOTTOM : NodeSide.TOP;
  }
}

/**
 * Get the connection point on a specific side of a node
 */
export function getConnectionPoint(
  nodePos: LayoutPosition,
  side: NodeSide,
): LayoutPosition {
  switch (side) {
    case NodeSide.TOP:
      return { x: nodePos.x, y: nodePos.y - NODE_HEIGHT / 2 };
    case NodeSide.RIGHT:
      return { x: nodePos.x + NODE_WIDTH / 2, y: nodePos.y };
    case NodeSide.BOTTOM:
      return { x: nodePos.x, y: nodePos.y + NODE_HEIGHT / 2 };
    case NodeSide.LEFT:
      return { x: nodePos.x - NODE_WIDTH / 2, y: nodePos.y };
  }
}

/**
 * The arrow has a size and needs space to render properly.
 * Adjust the endpoint of the path to create space for the arrowhead.
 */
function adjustEndpointForArrow(
  toSide: NodeSide,
  endPoint: LayoutPosition,
): LayoutPosition {
  // Arrow size - move endpoint away from box so arrow can extend to touch box surface
  const arrowSize = 20;

  // Adjust end point: move it AWAY from the box by arrow size
  // This creates space for the arrow to extend from path endpoint to box surface
  let adjustedEndPoint: LayoutPosition;
  switch (toSide) {
    case NodeSide.TOP:
      adjustedEndPoint = { x: endPoint.x, y: endPoint.y - arrowSize };
      break;
    case NodeSide.RIGHT:
      adjustedEndPoint = { x: endPoint.x + arrowSize, y: endPoint.y };
      break;
    case NodeSide.BOTTOM:
      adjustedEndPoint = { x: endPoint.x, y: endPoint.y + arrowSize };
      break;
    case NodeSide.LEFT:
      adjustedEndPoint = { x: endPoint.x - arrowSize, y: endPoint.y };
      break;
  }
  return adjustedEndPoint;
}

/**
 * Calculate orthogonal offset for control points based on distance between start and end points.
 * Ensures the curve has a smooth bend without being too sharp or too flat.
 */
function getOrthogonalOffset(
  adjustedEndPoint: LayoutPosition,
  startPoint: LayoutPosition,
): number {
  // Calculate distance between points to determine control point offset
  const dx = adjustedEndPoint.x - startPoint.x;
  const dy = adjustedEndPoint.y - startPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Use 30% of the distance as the control point offset, with min/max bounds
  return Math.min(Math.max(distance * 0.3, 30), 100);
}

function getControlPoint(
  toSide: NodeSide,
  position: LayoutPosition,
  offset: number,
) {
  switch (toSide) {
    case NodeSide.TOP:
      return {
        x: position.x,
        y: position.y - offset,
      };
    case NodeSide.RIGHT:
      return {
        x: position.x + offset,
        y: position.y,
      };
    case NodeSide.BOTTOM:
      return {
        x: position.x,
        y: position.y + offset,
      };
    case NodeSide.LEFT:
      return {
        x: position.x - offset,
        y: position.y,
      };
  }
}

/**
 * Generate SVG path string for an orthogonal edge between two nodes.
 * The path starts perpendicular to the source side and ends perpendicular to the target side.
 */
export function generateOrthogonalPath(
  fromPos: LayoutPosition,
  toPos: LayoutPosition,
): string {
  // Determine which sides to connect
  const fromSide = getClosestSide(fromPos, toPos);
  const toSide = getClosestSide(toPos, fromPos);

  const startPoint = getConnectionPoint(fromPos, fromSide);
  const endPoint = getConnectionPoint(toPos, toSide);
  const adjustedEndPoint = adjustEndpointForArrow(toSide, endPoint);
  const orthogonalOffset = getOrthogonalOffset(adjustedEndPoint, startPoint);
  let cp1 = getControlPoint(fromSide, startPoint, orthogonalOffset);
  let cp2 = getControlPoint(toSide, adjustedEndPoint, orthogonalOffset);

  // Use cubic Bézier curve (C command) for smooth, continuous curve
  // This creates a smooth curve from start to end with orthogonal tangents at both ends
  return `M ${startPoint.x} ${startPoint.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${adjustedEndPoint.x} ${adjustedEndPoint.y}`;
}

/**
 * Generate SVG path string for a curved edge between two points.
 * Uses quadratic Bézier curve for smooth connections.
 */
export function generateCurvedPath(
  from: LayoutPosition,
  to: LayoutPosition,
): string {
  const dx = to.x - from.x;

  // Control point for quadratic curve
  const controlX = from.x + dx * 0.5;
  const controlY = from.y; // Horizontal-first curve

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY}, ${to.x} ${to.y}`;
}
