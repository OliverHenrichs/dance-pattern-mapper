import {WCSPatternLevel, WCSPatternType} from "@/components/types/WCSPatternEnums";

export interface WCSPattern extends BasePattern{
    counts: number,
    level?: WCSPatternLevel,
    type: WCSPatternType,
    tags: string[],
}

export interface BasePattern {
    id: number,
    name: string,
    prerequisites: number[],
    description: string,
}