import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { WCSPatternType } from "@/components/pattern/types/WCSPatternEnums";
import {
  calculatePrerequisiteDepthMap,
  LayoutPosition,
} from "@/components/pattern/graph/utils/GraphUtils";
import {
  EDGE_VERTICAL_SPACING,
  HORIZONTAL_SPACING,
  LEFT_MARGIN,
  NODE_HEIGHT,
  START_OFFSET,
  VERTICAL_STACK_SPACING,
} from "@/components/pattern/graph/types/Constants";

export interface SwimlaneInfo {
  y: number;
  height: number;
}

/**
 * Calculate layout positions for utils view.
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
  const depthMap = calculatePrerequisiteDepthMap(patterns);
  const grouped = groupPatternsByType(patterns);
  const maxStackPerType = calculateMaxStackPerType(grouped, depthMap);
  let { swimlaneHeights, swimlaneStarts, totalHeight } =
    calculateSwimlaneSizes(maxStackPerType);
  return {
    positions: positionPatternsByPrerequisites(
      patterns,
      grouped,
      depthMap,
      swimlaneStarts,
    ),
    minHeight: Math.max(baseHeight, totalHeight),
    actualWidth: calculateActualWidth(depthMap, width),
    swimlanes: buildSwimlaneInformation(swimlaneHeights),
  };
}

/**
 * Group patterns by their WCSPatternType.
 */
function groupPatternsByType(
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

function buildSwimlaneInformation(
  swimlaneHeights: Map<WCSPatternType, number>,
) {
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
  return swimlaneInfo;
}

function calculateMaxStackPerType(
  grouped: Record<WCSPatternType, WCSPattern[]>,
  depthMap: Map<number, number>,
) {
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
  return maxStackPerType;
}

/**
 * Calculates max depth to determine required width.
 * */
function calculateActualWidth(depthMap: Map<number, number>, width: number) {
  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const requiredWidth = LEFT_MARGIN + (maxDepth + 0.5) * HORIZONTAL_SPACING;
  return Math.max(width, requiredWidth);
}

/**
 * Dynamically calculates swimlane heights based on content.
 * */
function calculateSwimlaneSizes(maxStackPerType: Map<string, number>) {
  const swimlaneHeights = new Map<WCSPatternType, number>();
  const swimlaneStarts = new Map<WCSPatternType, number>();
  const typeOrder = Object.values(WCSPatternType) as WCSPatternType[];
  const totalHeight = typeOrder.reduce((currentHeight, type) => {
    const maxStack = maxStackPerType.get(type) || 1;
    const height =
      START_OFFSET + NODE_HEIGHT + (maxStack - 1) * VERTICAL_STACK_SPACING;

    swimlaneHeights.set(type, height);
    swimlaneStarts.set(type, currentHeight + START_OFFSET);
    return currentHeight + height;
  }, 0);
  return { swimlaneHeights, swimlaneStarts, totalHeight };
}

function positionPatternsByPrerequisites(
  patterns: WCSPattern[],
  grouped: Record<WCSPatternType, WCSPattern[]>,
  depthMap: Map<number, number>,
  swimlaneStarts: Map<WCSPatternType, number>,
) {
  const positions = new Map<number, LayoutPosition>();
  const depthTypeCounter = new Map<string, number>();
  const patternMap = new Map<number, WCSPattern>();

  // Build pattern lookup map
  patterns.forEach((p) => patternMap.set(p.id, p));

  // PASS 1: Position all nodes initially without collision avoidance
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

      // Calculate initial vertical position
      const y = baseY + stackIndex * VERTICAL_STACK_SPACING;

      positions.set(pattern.id, { x, y });
    });
  });

  // PASS 2: Detect and resolve collisions
  applyCollisionAvoidance(patterns, depthMap, patternMap, positions);

  return positions;
}

/**
 * Apply collision avoidance by detecting skip-level edges and shifting intermediate nodes.
 * This is a second pass after initial positioning.
 */
function applyCollisionAvoidance(
  patterns: WCSPattern[],
  depthMap: Map<number, number>,
  patternMap: Map<number, WCSPattern>,
  positions: Map<number, LayoutPosition>,
): void {
  // Find all skip-level edges (edges that span more than 1 depth level)
  const skipLevelEdges: {
    fromId: number;
    toId: number;
    fromDepth: number;
    toDepth: number;
    fromY: number;
    toY: number;
  }[] = [];

  patterns.forEach((pattern) => {
    const toDepth = depthMap.get(pattern.id) || 0;
    const toPos = positions.get(pattern.id);
    if (!toPos) return;

    pattern.prerequisites.forEach((prereqId) => {
      const fromDepth = depthMap.get(prereqId) || 0;
      const depthSpan = toDepth - fromDepth;

      // Only consider skip-level edges (spanning more than 1 depth level)
      if (depthSpan <= 1) return;

      const fromPos = positions.get(prereqId);
      if (!fromPos) return;

      // Check if they're in the same swimlane (same type)
      const prereqPattern = patternMap.get(prereqId);
      if (!prereqPattern || prereqPattern.type !== pattern.type) return;

      skipLevelEdges.push({
        fromId: prereqId,
        toId: pattern.id,
        fromDepth,
        toDepth,
        fromY: fromPos.y,
        toY: toPos.y,
      });
    });
  });

  // For each skip-level edge, find intermediate nodes that would be crossed
  const nodesToShift = new Map<number, number>(); // patternId -> vertical offset needed

  skipLevelEdges.forEach((edge) => {
    const edgeType = patternMap.get(edge.fromId)?.type;
    if (!edgeType) return;

    // Find all nodes at intermediate depths in the same swimlane
    patterns.forEach((intermediatePattern) => {
      if (intermediatePattern.type !== edgeType) return;

      const intermediateDepth = depthMap.get(intermediatePattern.id) || 0;

      // Check if this pattern is at an intermediate depth
      if (
        intermediateDepth > edge.fromDepth &&
        intermediateDepth < edge.toDepth
      ) {
        const intermediatePos = positions.get(intermediatePattern.id);
        if (!intermediatePos) return;

        // Check if the edge would pass through this node's vertical region
        const minEdgeY = Math.min(edge.fromY, edge.toY);
        const maxEdgeY = Math.max(edge.fromY, edge.toY);
        const nodeTop = intermediatePos.y - NODE_HEIGHT / 2;
        const nodeBottom = intermediatePos.y + NODE_HEIGHT / 2;

        // If there's vertical overlap, this edge crosses our node
        if (maxEdgeY >= nodeTop && minEdgeY <= nodeBottom) {
          // Calculate how much to shift this node
          const currentOffset = nodesToShift.get(intermediatePattern.id) || 0;
          const newOffset = currentOffset + EDGE_VERTICAL_SPACING;
          nodesToShift.set(intermediatePattern.id, newOffset);
        }
      }
    });
  });

  // Apply the shifts
  nodesToShift.forEach((offset, patternId) => {
    const pos = positions.get(patternId);
    if (pos) {
      positions.set(patternId, { x: pos.x, y: pos.y + offset });
    }
  });
}
