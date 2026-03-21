import { LayoutPosition } from "@/components/pattern/graph/utils/GraphUtils";
import { Pattern } from "@/components/pattern/types/PatternList";
import { calculatePrerequisiteDepthMap } from "@/components/pattern/graph/utils/GenericGraphUtils";

export interface GraphLayout {
  positions: Map<number, LayoutPosition>;
  /** The center of the foundational ellipse in the same coordinate space as positions. */
  ellipseCenterX: number;
  ellipseCenterY: number;
}

/**
 * Calculate layout positions for network graph view.
 * Uses elliptical layout for foundational nodes, with dependencies
 * spreading radially outward from each foundational node.
 *
 * Each non-foundational pattern is positioned exactly once, by the
 * foundational ancestor that reaches it via the shortest prerequisite path
 * (BFS order). Angles are derived from the direct parent's outward direction,
 * never accumulated across the full chain, so multi-parent nodes stay
 * close to the sector they naturally belong to.
 */
export function calculateGraphLayout(
  patterns: Pattern[],
  width: number,
  height: number,
): GraphLayout {
  const depthMap = calculatePrerequisiteDepthMap(patterns);
  const foundationalPatterns = getFoundationalPatterns(patterns, depthMap);

  const centerX = width / 2;
  const centerY = height / 2;

  const { positions, foundationalAngles } =
    calculateFoundationalPatternPositions(
      centerX,
      centerY,
      width,
      height,
      foundationalPatterns,
    );

  const patternMap = new Map<number, Pattern>();
  patterns.forEach((p) => patternMap.set(p.id, p));

  // BFS queue entry: the pattern to place, the angle pointing away from
  // its foundational ancestor, and the position of its direct parent.
  interface QueueEntry {
    pattern: Pattern;
    /** Outward angle inherited from parent (radians). */
    parentAngle: number;
    parentPos: LayoutPosition;
    /** Hop distance from the foundational node (1 = direct child). */
    localDepth: number;
  }

  // Shared set: first foundational to claim a node wins (shortest path).
  const positioned = new Set<number>(foundationalPatterns.map((p) => p.id));

  // Seed the BFS queues from each foundational node.
  // We process all foundationals in parallel (one BFS level at a time)
  // so that the shortest-path rule is respected across sectors.
  let queue: QueueEntry[] = [];
  foundationalPatterns.forEach((foundational, index) => {
    const angle = foundationalAngles[index];
    const foundationalPos = positions.get(foundational.id)!;
    const directChildren = patterns.filter((p) =>
      p.prerequisites.includes(foundational.id),
    );
    directChildren.forEach((child) => {
      if (!positioned.has(child.id)) {
        positioned.add(child.id);
        queue.push({
          pattern: child,
          parentAngle: angle,
          parentPos: foundationalPos,
          localDepth: 1,
        });
      }
    });
  });

  // BFS: process level by level so siblings at the same depth are spread
  // relative to their own parent's direction.
  const DEPTH_SPACING = 220;
  const MIN_ANGLE_PER_NODE = Math.PI / 8; // 22.5° minimum gap per sibling

  while (queue.length > 0) {
    const nextQueue: QueueEntry[] = [];

    // Group queue entries by parent position so siblings share the same spread.
    const byParent = new Map<string, QueueEntry[]>();
    queue.forEach((entry) => {
      const key = `${entry.parentPos.x},${entry.parentPos.y}`;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(entry);
    });

    byParent.forEach((siblings) => {
      const numSiblings = siblings.length;
      const spreadAngle =
        numSiblings > 1 ? (numSiblings - 1) * MIN_ANGLE_PER_NODE : 0;

      siblings.forEach((entry, idx) => {
        const offsetAngle =
          numSiblings > 1
            ? (idx - (numSiblings - 1) / 2) * (spreadAngle / (numSiblings - 1))
            : 0;

        const finalAngle = entry.parentAngle + offsetAngle;
        const distance = entry.localDepth * DEPTH_SPACING;

        const x = entry.parentPos.x + Math.cos(finalAngle) * distance;
        const y = entry.parentPos.y + Math.sin(finalAngle) * distance;
        positions.set(entry.pattern.id, { x, y });

        // Enqueue children of this node using *its* angle as the new parent angle.
        const children = patterns.filter((p) =>
          p.prerequisites.includes(entry.pattern.id),
        );
        children.forEach((child) => {
          if (!positioned.has(child.id)) {
            positioned.add(child.id);
            nextQueue.push({
              pattern: child,
              parentAngle: finalAngle,
              parentPos: { x, y },
              localDepth: entry.localDepth + 1,
            });
          }
        });
      });
    });

    queue = nextQueue;
  }

  addSizeSafeguards(positions);
  return { positions, ellipseCenterX: centerX, ellipseCenterY: centerY };
}

function calculateFoundationalPatternPositions(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  foundationalPatterns: Pattern[],
): { positions: Map<number, LayoutPosition>; foundationalAngles: number[] } {
  // Larger ellipse radii so the ring isn't cramped
  const ellipseRadiusX = Math.min(width * 0.3, 500);
  const ellipseRadiusY = Math.min(height * 0.3, 400);

  const positions = new Map<number, LayoutPosition>();
  const foundationalAngles: number[] = [];

  foundationalPatterns.forEach((pattern, index) => {
    const angle = (index / foundationalPatterns.length) * 2 * Math.PI;
    foundationalAngles.push(angle);

    const x = centerX + ellipseRadiusX * Math.cos(angle);
    const y = centerY + ellipseRadiusY * Math.sin(angle);
    positions.set(pattern.id, { x, y });
  });

  return { positions, foundationalAngles };
}

function getFoundationalPatterns(
  patterns: Pattern[],
  depthMap: Map<number, number>,
) {
  return patterns.filter((p) => (depthMap.get(p.id) || 0) === 0);
}

function addSizeSafeguards(positions: Map<number, LayoutPosition>) {
  // Clamp all positions to reasonable bounds to prevent excessive canvas size.
  // This prevents "Canvas: trying to draw too large bitmap" errors.
  const MAX_COORDINATE = 4000;
  positions.forEach((pos) => {
    pos.x = Math.max(-MAX_COORDINATE, Math.min(MAX_COORDINATE, pos.x));
    pos.y = Math.max(-MAX_COORDINATE, Math.min(MAX_COORDINATE, pos.y));
  });
}
