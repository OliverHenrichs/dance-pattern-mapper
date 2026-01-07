import {
  WCSPatternLevel,
  WCSPatternType,
} from "@/components/pattern/types/WCSPatternEnums";

export type NewWCSPattern = BasePattern & WCSSpecificPattern;
export type WCSPattern = IdBasePattern & WCSSpecificPattern;

export interface VideoReference {
  type: "url" | "local";
  value: string; // URL or local file path
}

interface WCSSpecificPattern {
  counts: number;
  level?: WCSPatternLevel;
  type: WCSPatternType;
  tags: string[];
  videoRefs: VideoReference[];
}

export interface IdBasePattern extends BasePattern {
  id: number;
}

export interface BasePattern {
  name: string;
  prerequisites: number[];
  description: string;
}
