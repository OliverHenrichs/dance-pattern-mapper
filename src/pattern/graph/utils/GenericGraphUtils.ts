// Type that can be either Pattern or WCSPattern (for backward compatibility)
interface PatternLike {
  id: number;
  prerequisites: number[];
}

export function generateEdges<T extends PatternLike>(patterns: T[]) {
  return patterns.flatMap((pattern) =>
    pattern.prerequisites.map((prereqId) => ({
      from: prereqId,
      to: pattern.id,
    })),
  );
}

/**
 * Detect circular dependencies in the pattern graph.
 * Returns an array of cycles (each cycle is an array of pattern ids).
 * Logs warnings for each detected cycle.
 */
export function detectCircularDependencies<T extends PatternLike>(
  patterns: T[],
): number[][] {
  const cycles: number[][] = [];
  const patternMap = new Map<number, T>();
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
 * Calculate the prerequisite depth for each pattern using DFS.
 * Depth is the longest chain from foundational patterns (prerequisites: []).
 * Returns a map of pattern id -> depth.
 */
export function calculatePrerequisiteDepthMap<T extends PatternLike>(
  patterns: T[],
): Map<number, number> {
  const depthMap = new Map<number, number>();
  const patternMap = new Map<number, T>();

  // Create pattern lookup map
  patterns.forEach((pattern) => patternMap.set(pattern.id, pattern));

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

    // Calculate depth as 1 + max depth of all prerequisites
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
