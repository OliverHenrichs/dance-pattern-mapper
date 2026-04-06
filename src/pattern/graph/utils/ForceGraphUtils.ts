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

  const HORIZONTAL_SPACING = 320;
  const TICK_COUNT = 300;
  const LINK_DISTANCE = 300;
  const CHARGE_STRENGTH = -1800;
  const DEPTH_FORCE_STRENGTH = 0.6;
  const Y_FORCE_STRENGTH = 0.05;

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

  return positions;
}
