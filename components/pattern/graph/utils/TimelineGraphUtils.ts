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

export interface SkipLevelEdgeInfo {
  fromId: number;
  toId: number;
  fromDepth: number;
  toDepth: number;
  intermediateNodeIds: number[]; // Nodes that were shifted to make room
  originalIntermediateY: number; // Y coordinate where edge should route (above shifted nodes for horizontal edges)
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
  skipLevelEdges: SkipLevelEdgeInfo[];
} {
  const depthMap = calculatePrerequisiteDepthMap(patterns);
  const grouped = groupPatternsByType(patterns);
  const maxStackPerType = calculateMaxStackPerType(grouped, depthMap);
  let { swimlaneHeights, swimlaneStarts } =
    calculateSwimlaneSizes(maxStackPerType);

  const positions = positionPatternsByPrerequisites(
    patterns,
    grouped,
    depthMap,
    swimlaneStarts,
  );

  const { skipLevelEdges, maxShiftPerType } = applyCollisionAvoidance(
    patterns,
    depthMap,
    positions,
  );

  // Adjust swimlane heights based on shifts
  maxShiftPerType.forEach((shift, type) => {
    const patternType = type as WCSPatternType;
    const currentHeight = swimlaneHeights.get(patternType) || 0;
    swimlaneHeights.set(patternType, currentHeight + shift);
  });

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
      skipLevelEdges.forEach((edge) => {
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

  // Total height is the cumulative Y after all swimlanes
  const adjustedTotalHeight = cumulativeY;

  return {
    positions,
    minHeight: Math.max(baseHeight, adjustedTotalHeight),
    actualWidth: calculateActualWidth(depthMap, width),
    swimlanes: buildSwimlaneInformation(
      swimlaneHeights,
      adjustedSwimlaneStarts,
    ),
    skipLevelEdges,
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
  patterns: WCSPattern[],
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

/**
 * Apply collision avoidance by detecting skip-level edges and shifting intermediate nodes.
 * This is a second pass after initial positioning.
 * Returns information about skip-level edges, which nodes were shifted, and max shifts per type.
 */
function applyCollisionAvoidance(
  patterns: WCSPattern[],
  depthMap: Map<number, number>,
  positions: Map<number, LayoutPosition>,
): {
  skipLevelEdges: SkipLevelEdgeInfo[];
  maxShiftPerType: Map<string, number>;
} {
  const patternMap = new Map<number, WCSPattern>();
  patterns.forEach((p) => patternMap.set(p.id, p));

  // Store original positions before any shifting
  const originalPositions = new Map<number, number>();
  positions.forEach((pos, id) => {
    originalPositions.set(id, pos.y);
  });

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
  const edgeToIntermediateNodes = new Map<
    string,
    { nodeIds: number[]; routingY: number }
  >(); // "fromId-toId" -> {intermediateNodeIds, routingY}

  skipLevelEdges.forEach((edge) => {
    const edgeType = patternMap.get(edge.fromId)?.type;
    if (!edgeType) return;

    const intermediateNodeIds: number[] = [];

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
          intermediateNodeIds.push(intermediatePattern.id);
        }
      }
    });

    // Calculate routing Y based on the cleared space created by shifting nodes
    if (intermediateNodeIds.length > 0) {
      const edgeKey = `${edge.fromId}-${edge.toId}`;

      // Find the topmost intermediate node (before shifting)
      const topmostNodeId = intermediateNodeIds.reduce((topId, nodeId) => {
        const topOrigY = originalPositions.get(topId) || Infinity;
        const nodeOrigY = originalPositions.get(nodeId) || Infinity;
        return nodeOrigY < topOrigY ? nodeId : topId;
      }, intermediateNodeIds[0]);

      const topmostOriginalY = originalPositions.get(topmostNodeId);

      // The cleared space is created ABOVE the shifted node
      // Original node occupies: [originalY - NODE_HEIGHT/2, originalY + NODE_HEIGHT/2]
      // After shift by shiftAmount, node occupies: [originalY + shiftAmount - NODE_HEIGHT/2, ...]
      // Cleared space is: [originalY - NODE_HEIGHT/2, originalY + shiftAmount - NODE_HEIGHT/2]

      const halfNodeHeight = NODE_HEIGHT / 2;
      const clearedSpaceTop =
        topmostOriginalY !== undefined
          ? topmostOriginalY - halfNodeHeight
          : edge.fromY;

      // Longer edges (spanning more columns) route higher to avoid later intersections
      // Divide cleared space into slots based on depth span
      // Edge spanning 3 columns gets slot 0 (highest), spanning 2 gets slot 1, etc.
      const depthSpan = edge.toDepth - edge.fromDepth;
      const slotHeight = EDGE_VERTICAL_SPACING;
      const slotIndex = Math.max(0, 3 - depthSpan); // Invert: longer span = lower index = higher position
      const routingY = clearedSpaceTop + slotIndex * slotHeight;

      edgeToIntermediateNodes.set(edgeKey, {
        nodeIds: intermediateNodeIds,
        routingY: routingY,
      });
    }
  });

  // Apply the shifts with proper cascading
  // Calculate cumulative shifts for each position in each stack
  const nodesByDepthType = new Map<string, number[]>(); // "depth-type" -> [patternIds sorted by Y]

  patterns.forEach((pattern) => {
    const depth = depthMap.get(pattern.id) || 0;
    const key = `${depth}-${pattern.type}`;
    if (!nodesByDepthType.has(key)) {
      nodesByDepthType.set(key, []);
    }
    nodesByDepthType.get(key)!.push(pattern.id);
  });

  // Sort each stack by Y position
  nodesByDepthType.forEach((nodeIds) => {
    nodeIds.sort((a, b) => {
      const posA = positions.get(a);
      const posB = positions.get(b);
      if (!posA || !posB) return 0;
      return posA.y - posB.y;
    });
  });

  // Calculate cumulative shifts for each stack position
  // Key insight: to maintain equal spacing, each node must shift by the MAXIMUM
  // of (its own shift requirement) OR (the shift of the node directly above it)
  const cumulativeShifts = new Map<number, number>(); // patternId -> total shift to apply
  let maxShiftPerType = new Map<string, number>(); // "type" -> max shift in that swimlane

  nodesByDepthType.forEach((stack, key) => {
    const type = key.split("-")[1]; // Extract type from "depth-type"
    let maxShiftInStack = 0;

    // Process from top to bottom to propagate shifts down
    let previousShift = 0;
    for (let i = 0; i < stack.length; i++) {
      const nodeId = stack[i];
      const ownShift = nodesToShift.get(nodeId) || 0;

      // This node shifts by the maximum of:
      // - Its own shift requirement
      // - The shift of the node above (to maintain spacing)
      const cumulativeShift = Math.max(ownShift, previousShift);

      cumulativeShifts.set(nodeId, cumulativeShift);
      maxShiftInStack = Math.max(maxShiftInStack, cumulativeShift);

      // Next node inherits this shift as minimum
      previousShift = cumulativeShift;
    }

    // Track max shift per swimlane type for height adjustment
    const currentMax = maxShiftPerType.get(type) || 0;
    maxShiftPerType.set(type, Math.max(currentMax, maxShiftInStack));
  });

  // Apply the cumulative shifts
  cumulativeShifts.forEach((shift, nodeId) => {
    if (shift > 0) {
      const pos = positions.get(nodeId);
      if (pos) {
        positions.set(nodeId, { x: pos.x, y: pos.y + shift });
      }
    }
  });

  // Build return array with edge information
  const edgeInfoArray = skipLevelEdges.map((edge) => {
    const edgeKey = `${edge.fromId}-${edge.toId}`;
    const info = edgeToIntermediateNodes.get(edgeKey);
    return {
      fromId: edge.fromId,
      toId: edge.toId,
      fromDepth: edge.fromDepth,
      toDepth: edge.toDepth,
      intermediateNodeIds: info?.nodeIds || [],
      originalIntermediateY: info?.routingY || 0,
    };
  });

  return { skipLevelEdges: edgeInfoArray, maxShiftPerType };
}
