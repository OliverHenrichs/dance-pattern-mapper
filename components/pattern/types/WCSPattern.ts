import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";

export type NewWCSPattern = BasePattern & WCSSpecificPattern;
export type WCSPattern = IdBasePattern & WCSSpecificPattern;

interface WCSSpecificPattern {
  counts: number;
  level?: WCSPatternLevel;
  type: WCSPatternType;
  tags: string[];
  videoUrl?: string; // Optional field for video content
}

export interface IdBasePattern extends BasePattern {
  id: number;
}

export interface BasePattern {
  name: string;
  prerequisites: number[];
  description: string;
}
