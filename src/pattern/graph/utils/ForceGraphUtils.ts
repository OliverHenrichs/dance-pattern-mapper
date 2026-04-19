import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { IPattern } from "@/src/pattern/types/IPatternList";
import { LayoutPosition } from "@/src/pattern/graph/utils/GraphUtils";
import { calculatePrerequisiteDepthMap } from "@/src/pattern/graph/utils/GenericGraphUtils";

interface ForceNode extends SimulationNodeDatum {
  id: number;
  depth: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: number | ForceNode;
  target: number | ForceNode;
}

const HORIZONTAL_SPACING = 320;
const VERTICAL_SPACING = 200;
const TICK_COUNT = 300;
const LINK_DISTANCE = 300;
const CHARGE_STRENGTH = -2200;
const DEPTH_FORCE_STRENGTH = 0.6;
const Y_FORCE_STRENGTH = 0.05;
/** Number of forward+backward barycenter sweeps for crossing reduction. */
const CROSSING_REDUCTION_PASSES = 4;

/**
 * Run a d3-force simulation to compute layout positions for the network graph.
 *
 * Forces applied:
 *  - forceLink  — spring force along prerequisite edges
 *  - forceManyBody — repulsion between all nodes
 *  - forceCenter — pulls the whole graph toward (0,0) for normalisation
 *  - forceX      — nudges each node toward x = depth * HORIZONTAL_SPACING
 *                  so that the DAG flows left-to-right by prerequisite depth
 *  - forceY      — weak centering force on the y-axis
 *
 * After the simulation a barycenter crossing-reduction pass reorders nodes
 * within each depth layer to minimise edge crossings (Sugiyama heuristic).
 * The simulation is run synchronously for TICK_COUNT steps and then stopped.
 * The caller is responsible for translating the returned positions into SVG
 * coordinates (see useGraphLayout.ts).
 */
export function runForceLayout(
  patterns: IPattern[],
  width: number,
): Map<number, LayoutPosition> {
  const positions = new Map<number, LayoutPosition>();

  if (patterns.length === 0) {
    return positions;
  }

  const depthMap = calculatePrerequisiteDepthMap(patterns);

  // Build node array
  const nodes: ForceNode[] = patterns.map((p) => ({
    id: p.id,
    depth: depthMap.get(p.id) ?? 0,
    // Spread initial positions by depth to give the simulation a good starting
    // point and reduce the risk of entangled initial layouts.
    x: (depthMap.get(p.id) ?? 0) * HORIZONTAL_SPACING - width / 2,
    y: 0,
  }));

  const nodeById = new Map<number, ForceNode>();
  nodes.forEach((n) => nodeById.set(n.id, n));

  // Build link array — one directed edge per prerequisite relationship
  const links: ForceLink[] = patterns.flatMap((p) =>
    p.prerequisites
      .filter((prereqId) => nodeById.has(prereqId))
      .map((prereqId) => ({
        source: prereqId,
        target: p.id,
      })),
  );

  const simulation = forceSimulation<ForceNode>(nodes)
    .force(
      "link",
      forceLink<ForceNode, ForceLink>(links)
        .id((d) => d.id)
        .distance(LINK_DISTANCE)
        .strength(0.8),
    )
    .force("charge", forceManyBody<ForceNode>().strength(CHARGE_STRENGTH))
    .force("center", forceCenter(0, 0))
    .force(
      "x",
      forceX<ForceNode>(
        (d) => d.depth * HORIZONTAL_SPACING - width / 2,
      ).strength(DEPTH_FORCE_STRENGTH),
    )
    .force("y", forceY<ForceNode>(0).strength(Y_FORCE_STRENGTH))
    .stop();

  // Run synchronously to convergence
  for (let i = 0; i < TICK_COUNT; i++) {
    simulation.tick();
  }

  nodes.forEach((node) => {
    positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
  });

  // Post-process: reduce edge crossings via barycenter layer sweeps
  reduceCrossings(nodes, links, positions, depthMap);

  return positions;
}

/**
 * Barycenter crossing-reduction (Sugiyama heuristic).
 *
 * For each sweep pass we sort every depth layer by the average Y position of
 * each node's neighbours in the adjacent layer, then re-space the layer
 * evenly on the Y axis while keeping their relative order.  Running several
 * forward and backward passes converges to a layout with fewer crossings.
 */
function reduceCrossings(
  nodes: ForceNode[],
  links: ForceLink[],
  positions: Map<number, LayoutPosition>,
  depthMap: Map<number, number>,
): void {
  // Group node ids by depth
  const layerMap = new Map<number, number[]>();
  nodes.forEach((n) => {
    const d = depthMap.get(n.id) ?? 0;
    if (!layerMap.has(d)) layerMap.set(d, []);
    layerMap.get(d)!.push(n.id);
  });

  const maxDepth = Math.max(...layerMap.keys());

  // Build adjacency: for each node, collect all directly connected node ids
  const neighbors = new Map<number, number[]>();
  nodes.forEach((n) => neighbors.set(n.id, []));
  links.forEach((l) => {
    const srcId =
      typeof l.source === "object"
        ? (l.source as ForceNode).id
        : (l.source as number);
    const tgtId =
      typeof l.target === "object"
        ? (l.target as ForceNode).id
        : (l.target as number);
    neighbors.get(srcId)?.push(tgtId);
    neighbors.get(tgtId)?.push(srcId);
  });

  const sortLayer = (layerIds: number[]) => {
    const barycenters = layerIds.map((id) => {
      const nbrs = neighbors.get(id) ?? [];
      if (nbrs.length === 0) return { id, bary: positions.get(id)?.y ?? 0 };
      const avgY =
        nbrs.reduce((sum, nid) => sum + (positions.get(nid)?.y ?? 0), 0) /
        nbrs.length;
      return { id, bary: avgY };
    });
    barycenters.sort((a, b) => a.bary - b.bary);

    // Re-space evenly around the layer's current centroid
    const centroid =
      layerIds.reduce((sum, id) => sum + (positions.get(id)?.y ?? 0), 0) /
      layerIds.length;
    const totalHeight = (layerIds.length - 1) * VERTICAL_SPACING;
    const startY = centroid - totalHeight / 2;

    barycenters.forEach(({ id }, i) => {
      const pos = positions.get(id);
      if (pos)
        positions.set(id, { x: pos.x, y: startY + i * VERTICAL_SPACING });
    });
  };

  for (let pass = 0; pass < CROSSING_REDUCTION_PASSES; pass++) {
    // Forward sweep
    for (let d = 0; d <= maxDepth; d++) {
      const layer = layerMap.get(d);
      if (layer && layer.length > 1) sortLayer(layer);
    }
    // Backward sweep
    for (let d = maxDepth; d >= 0; d--) {
      const layer = layerMap.get(d);
      if (layer && layer.length > 1) sortLayer(layer);
    }
  }
}
