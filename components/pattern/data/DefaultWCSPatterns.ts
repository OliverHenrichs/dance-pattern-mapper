import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";

export const foundationalWCSPatterns: WCSPattern[] = [
  {
    id: 0,
    name: "Sugar Push",
    counts: 6,
    type: WCSPatternType.PUSH,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: "Basic compression and extension pattern",
    tags: [],
    videoRefs: [],
  },
  {
    id: 1,
    name: "Left Side Pass",
    counts: 6,
    type: WCSPatternType.PASS,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: "Follower passes the leader on the left side",
    tags: [],
    videoRefs: [],
  },
  {
    id: 2,
    name: "Underarm Turn",
    counts: 6,
    type: WCSPatternType.PASS,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: "Right side pass with follower turn under raised arm",
    tags: [],
    videoRefs: [],
  },
  {
    id: 3,
    name: "Whip",
    counts: 8,
    type: WCSPatternType.WHIP,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: "Basic rotational pattern maintaining the direction",
    tags: [],
    videoRefs: [],
  },
  {
    id: 4,
    name: "Sugar Tuck",
    counts: 6,
    type: WCSPatternType.TUCK,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: "Basic compression and tuck pattern",
    tags: [],
    videoRefs: [],
  },
];

export const defaultNewPattern: Omit<WCSPattern, "id"> = {
  name: "",
  counts: 6,
  type: WCSPatternType.PASS,
  level: WCSPatternLevel.BEGINNER,
  prerequisites: [],
  description: "",
  tags: [],
  videoRefs: [],
};
