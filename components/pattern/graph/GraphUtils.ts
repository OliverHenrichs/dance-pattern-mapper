import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";

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
 * positioned horizontally with even distribution across the lane,
 * with 70px vertical offsets to avoid collisions.
 * Returns positions and the minimum required height.
 */
export function calculateTimelineLayout(
  patterns: WCSPattern[],
  width: number,
  baseHeight: number,
): { positions: Map<number, LayoutPosition>; minHeight: number } {
  const positions = new Map<number, LayoutPosition>();
  const depthMap = calculatePrerequisiteDepth(patterns);
  const grouped = groupPatternsByType(patterns);

  // Swimlane configuration - 4 lanes for 4 types
  const swimlaneHeight = baseHeight / 4;
  const swimlanes = {
    [WCSPatternType.PUSH]: swimlaneHeight * 0.5,
    [WCSPatternType.PASS]: swimlaneHeight * 1.5,
    [WCSPatternType.WHIP]: swimlaneHeight * 2.5,
    [WCSPatternType.TUCK]: swimlaneHeight * 3.5,
  };

  // Track collisions at each depth/type
  const collisionCounts = new Map<string, number>();
  let maxY = 0;

  Object.entries(grouped).forEach(([type, typePatterns]) => {
    // Sort patterns by depth first to ensure consistent positioning
    const sortedPatterns = [...typePatterns].sort((a, b) => {
      const depthA = depthMap.get(a.id) || 0;
      const depthB = depthMap.get(b.id) || 0;
      return depthA - depthB;
    });

    // Calculate horizontal spacing for this lane based on number of patterns
    // Distribute patterns more evenly across the available width
    const laneWidth = width - 200; // Leave margins
    const patternsInLane = sortedPatterns.length;
    const spacingForLane =
      patternsInLane > 1 ? laneWidth / (patternsInLane - 1) : 0;

    sortedPatterns.forEach((pattern, index) => {
      // Position patterns evenly across the lane width
      const baseX =
        100 + (patternsInLane > 1 ? index * spacingForLane : laneWidth / 2);
      const baseY = swimlanes[type as WCSPatternType];

      // For patterns at similar positions, check for collisions
      const key = `${Math.floor(baseX / 100)}-${type}`; // Group by approximate x position
      const collisionCount = collisionCounts.get(key) || 0;

      // Apply diagonal offset for collisions (70px vertical offset = 60px node height + 10px padding)
      const offsetY = baseY + collisionCount * 70;

      // Increment collision count for next pattern at similar position/type
      collisionCounts.set(key, collisionCount + 1);

      positions.set(pattern.id, { x: baseX, y: offsetY });

      // Track maximum Y for height calculation (add node height + padding)
      maxY = Math.max(maxY, offsetY + 60 + 40); // 60px node height + 40px bottom padding
    });
  });

  return { positions, minHeight: Math.max(baseHeight, maxY) };
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
