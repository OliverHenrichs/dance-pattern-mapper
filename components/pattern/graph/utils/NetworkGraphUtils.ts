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

  // Shared set: first DFS visitor to claim a node wins.
  // This handles multi-parent nodes: only the first (shortest DFS path) placement sticks.
  const positioned = new Set<number>(foundationalPatterns.map((p) => p.id));

  // Fixed step between parent and child — independent of depth so all rings are even.
  const DEPTH_SPACING = 220;
  const MIN_ANGLE_PER_NODE = Math.PI / 8; // 22.5° minimum gap per sibling

  /**
   * Recursively place all children of `parentId` radially outward from `parentPos`
   * along `parentAngle`, then immediately recurse into each child's subtree (DFS).
   * This ensures every subtree is fully laid out before moving to the next sibling,
   * so nodes at the same visual ring are always direct siblings of the same parent.
   */
  function placeChildren(
    parentId: number,
    parentPos: LayoutPosition,
    parentAngle: number,
  ) {
    const children = patterns.filter(
      (p) => p.prerequisites.includes(parentId) && !positioned.has(p.id),
    );

    // Claim all children before recursing so that sibling cross-links don't
    // cause one sibling to be placed as a child of another sibling.
    children.forEach((child) => positioned.add(child.id));

    const numChildren = children.length;
    const spreadAngle =
      numChildren > 1 ? (numChildren - 1) * MIN_ANGLE_PER_NODE : 0;

    children.forEach((child, idx) => {
      const offsetAngle =
        numChildren > 1
          ? (idx - (numChildren - 1) / 2) * (spreadAngle / (numChildren - 1))
          : 0;

      const finalAngle = parentAngle + offsetAngle;
      const x = parentPos.x + Math.cos(finalAngle) * DEPTH_SPACING;
      const y = parentPos.y + Math.sin(finalAngle) * DEPTH_SPACING;
      positions.set(child.id, { x, y });

      // DFS: fully place this child's subtree before moving to next sibling.
      placeChildren(child.id, { x, y }, finalAngle);
    });
  }

  foundationalPatterns.forEach((foundational, index) => {
    placeChildren(
      foundational.id,
      positions.get(foundational.id)!,
      foundationalAngles[index],
    );
  });

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
