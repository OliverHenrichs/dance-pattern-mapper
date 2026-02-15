import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { WCSPatternType } from "@/components/pattern/types/WCSPatternEnums";
import {
  calculatePrerequisiteDepthMap,
  LayoutPosition,
} from "@/components/pattern/graph/utils/GraphUtils";
import {
  HORIZONTAL_SPACING,
  LEFT_MARGIN,
  NODE_HEIGHT,
  START_OFFSET,
  VERTICAL_STACK_SPACING,
} from "@/components/pattern/graph/types/Constants";
import { applyCollisionAvoidance } from "@/components/pattern/graph/utils/CollisionAvoidanceUtils";

export interface SwimlaneInfo {
  y: number;
  height: number;
}

export interface SkipLevelEdgeInfo {
  fromId: number;
  toId: number;
  fromDepth: number;
  toDepth: number;
  intermediateNodeIds: number[]; // Nodes that were shifted to make room
  originalIntermediateY: number; // Y coordinate where edge should route (above shifted nodes for horizontal edges)
  firstIntermediateX: number; // X position of first intermediate column (where to finish curving down)
  lastIntermediateX: number; // X position of last intermediate column (where to start curving up)
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
  skipLevelEdgeInfos: SkipLevelEdgeInfo[];
} {
  const depthMap = calculatePrerequisiteDepthMap(patterns);
  const grouped = groupPatternsByType(patterns);
  const maxStackPerType = calculateMaxStackPerType(grouped, depthMap);
  let { swimlaneHeights, swimlaneStarts } =
    calculateSwimlaneSizes(maxStackPerType);

  const positions = positionPatternsByPrerequisites(
    grouped,
    depthMap,
    swimlaneStarts,
  );

  const { skipLevelEdgeInfos, maxShiftPerType } = applyCollisionAvoidance(
    patterns,
    depthMap,
    positions,
  );

  shiftSwimlaneHeights(maxShiftPerType, swimlaneHeights);

  const { cumulativeY, adjustedSwimlaneStarts } = recalculateSwimlaneYPositions(
    swimlaneStarts,
    patterns,
    positions,
    skipLevelEdgeInfos,
    swimlaneHeights,
  );

  return {
    positions,
    minHeight: Math.max(baseHeight, cumulativeY),
    actualWidth: calculateActualWidth(depthMap, width),
    swimlanes: buildSwimlaneInformation(
      swimlaneHeights,
      adjustedSwimlaneStarts,
    ),
    skipLevelEdgeInfos,
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
  swimlaneStarts?: Map<WCSPatternType, number>,
) {
  // If swimlane starts are provided (after shift adjustment), use them
  // Otherwise calculate cumulative positions from heights
  let cumulativeY = 0;
  const typeOrder = Object.values(WCSPatternType) as WCSPatternType[];

  const swimlaneInfo: Record<WCSPatternType, SwimlaneInfo> = {} as Record<
    WCSPatternType,
    SwimlaneInfo
  >;

  typeOrder.forEach((type) => {
    const startY = swimlaneStarts
      ? swimlaneStarts.get(type) || cumulativeY
      : cumulativeY;
    const height = swimlaneHeights.get(type) || 0;

    swimlaneInfo[type] = {
      y: startY,
      height: height,
    };

    cumulativeY = startY + height;
  });

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
  grouped: Record<WCSPatternType, WCSPattern[]>,
  depthMap: Map<number, number>,
  swimlaneStarts: Map<WCSPatternType, number>,
) {
  const positions = new Map<number, LayoutPosition>();
  const depthTypeCounter = new Map<string, number>();

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

  return positions;
}

function shiftSwimlaneHeights(
  maxShiftPerType: Map<string, number>,
  swimlaneHeights: Map<WCSPatternType, number>,
) {
  maxShiftPerType.forEach((shift, type) => {
    const patternType = type as WCSPatternType;
    const currentHeight = swimlaneHeights.get(patternType) || 0;
    swimlaneHeights.set(patternType, currentHeight + shift);
  });
}

function recalculateSwimlaneYPositions(
  swimlaneStarts: Map<WCSPatternType, number>,
  patterns: WCSPattern[],
  positions: Map<number, LayoutPosition>,
  skipLevelEdgeInfos: SkipLevelEdgeInfo[],
  swimlaneHeights: Map<WCSPatternType, number>,
) {
  // Recalculate swimlane Y positions to account for expanded heights
  // Each swimlane's Y is the cumulative height of all swimlanes above it
  // AND shift all positional data (nodes, edges) to match new swimlane positions
  const typeOrder = Object.values(WCSPatternType) as WCSPatternType[];
  let cumulativeY = 0;
  const adjustedSwimlaneStarts = new Map<WCSPatternType, number>();

  typeOrder.forEach((type) => {
    const originalSwimlaneY = swimlaneStarts.get(type) || 0;
    const newSwimlaneY = cumulativeY;
    adjustedSwimlaneStarts.set(type, newSwimlaneY);

    // Calculate the shift needed for this swimlane
    const swimlaneShift = newSwimlaneY - originalSwimlaneY + NODE_HEIGHT - 10;

    if (swimlaneShift !== 0) {
      // Shift all node positions in this swimlane
      patterns.forEach((pattern) => {
        if (pattern.type === type) {
          const pos = positions.get(pattern.id);
          if (pos) {
            positions.set(pattern.id, {
              x: pos.x,
              y: pos.y + swimlaneShift,
            });
          }
        }
      });

      // Shift routing Y in skipLevelEdges for edges in this swimlane
      skipLevelEdgeInfos.forEach((edge) => {
        const fromPattern = patterns.find((p) => p.id === edge.fromId);
        if (
          fromPattern &&
          fromPattern.type === type &&
          edge.originalIntermediateY !== 0
        ) {
          edge.originalIntermediateY += swimlaneShift;
        }
      });
    }

    const height = swimlaneHeights.get(type) || 0;
    cumulativeY += height;
  });
  return { cumulativeY, adjustedSwimlaneStarts };
}
