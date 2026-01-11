import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";
import {
  HORIZONTAL_SPACING,
  LEFT_MARGIN,
  NODE_HEIGHT,
  TOP_MARGIN,
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
} {
  const positions = new Map<number, LayoutPosition>();
  const depthMap = calculatePrerequisiteDepth(patterns);
  const grouped = groupPatternsByType(patterns);

  // Calculate max depth to determine required width
  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const requiredWidth = LEFT_MARGIN + (maxDepth + 1) * HORIZONTAL_SPACING + 100;
  const actualWidth = Math.max(width, requiredWidth);

  // Swimlane configuration - 4 lanes for 4 types
  const swimlaneHeight = baseHeight / 4;
  const swimlanes = {
    [WCSPatternType.PUSH]: TOP_MARGIN + 20,
    [WCSPatternType.PASS]: TOP_MARGIN + swimlaneHeight + 20,
    [WCSPatternType.WHIP]: TOP_MARGIN + swimlaneHeight * 2 + 20,
    [WCSPatternType.TUCK]: TOP_MARGIN + swimlaneHeight * 3 + 20,
  };

  // Track how many patterns we've placed at each depth+type combination
  const depthTypeCounter = new Map<string, number>();
  let maxY = 0;

  Object.entries(grouped).forEach(([type, typePatterns]) => {
    typePatterns.forEach((pattern) => {
      const depth = depthMap.get(pattern.id) || 0;
      const baseY = swimlanes[type as WCSPatternType];

      // Position horizontally based on depth
      const x = LEFT_MARGIN + depth * HORIZONTAL_SPACING;

      // Track how many patterns at this depth+type for vertical stacking
      const key = `${depth}-${type}`;
      const stackIndex = depthTypeCounter.get(key) || 0;
      depthTypeCounter.set(key, stackIndex + 1);

      // Stack patterns vertically with proper spacing to avoid overlap
      const y = baseY + stackIndex * VERTICAL_STACK_SPACING;

      positions.set(pattern.id, { x, y });

      // Track maximum Y for height calculation (add node height/2 + padding)
      maxY = Math.max(maxY, y + NODE_HEIGHT / 2 + 40);
    });
  });

  return {
    positions,
    minHeight: Math.max(baseHeight, maxY),
    actualWidth,
  };
}

/**
 * Calculate layout positions for network graph view.
 * Uses hierarchical layout with levels as y-tiers,
 * spreading patterns horizontally by depth to minimize crossings.
 */
export function calculateGraphLayout(
  patterns: WCSPattern[],
  width: number,
  height: number,
): Map<number, LayoutPosition> {
  const positions = new Map<number, LayoutPosition>();
  const depthMap = calculatePrerequisiteDepth(patterns);
  const grouped = groupPatternsByLevel(patterns);

  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const horizontalSpacing = Math.max(150, width / (maxDepth + 2));

  // Vertical tiers by level
  const levelYPositions = {
    [WCSPatternLevel.BEGINNER]: height * 0.2,
    [WCSPatternLevel.INTERMEDIATE]: height * 0.5,
    [WCSPatternLevel.ADVANCED]: height * 0.8,
  };

  // Position patterns within each level tier
  Object.entries(grouped).forEach(([level, levelPatterns]) => {
    // Sort by depth for left-to-right ordering
    const sorted = [...levelPatterns].sort((a, b) => {
      const depthA = depthMap.get(a.id) || 0;
      const depthB = depthMap.get(b.id) || 0;
      return depthA - depthB;
    });

    sorted.forEach((pattern) => {
      const depth = depthMap.get(pattern.id) || 0;
      const x = 100 + depth * horizontalSpacing;
      const baseY = levelYPositions[level as WCSPatternLevel];

      // Apply small vertical jitter to reduce overlap
      const jitter = (Math.random() - 0.5) * 40;

      positions.set(pattern.id, { x, y: baseY + jitter });
    });
  });

  return positions;
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
