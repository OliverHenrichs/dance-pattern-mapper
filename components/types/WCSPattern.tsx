import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/types/WCSPatternEnums";

export type NewWCSPattern = BasePattern & WCSSpecificPattern;
export type WCSPattern = IdBasePattern & WCSSpecificPattern;

interface WCSSpecificPattern {
  counts: number;
  level?: WCSPatternLevel;
  type: WCSPatternType;
  tags: string[];
}

export interface IdBasePattern extends BasePattern {
  id: number;
}

export interface BasePattern {
  name: string;
  prerequisites: number[];
  description: string;
}
