import {WCSPattern} from "@/components/types/WCSPattern";
import {WCSPatternLevel, WCSPatternType} from "@/components/types/WCSPatternEnums";

export const defaultPatterns: WCSPattern[] = [
    {
        id: 0,
        name: 'Sugar Push',
        counts: 6,
        type: WCSPatternType.PUSH,
        level: WCSPatternLevel.BEGINNER,
        prerequisites: [],
        description: 'Basic compression and extension pattern',
        tags: ['fundamental', 'slot']
    },
    {
        id: 1,
        name: 'Left Side Pass',
        counts: 6,
        type: WCSPatternType.PASS,
        level: WCSPatternLevel.BEGINNER,
        prerequisites: [],
        description: 'Leader and follower pass on left sides',
        tags: ['fundamental', 'slot']
    },
    {
        id: 2,
        name: 'Underarm Turn',
        counts: 6,
        type: WCSPatternType.PASS,
        level: WCSPatternLevel.BEGINNER,
        prerequisites: ['left-side-pass'],
        description: 'Pass with follower turn under raised arm',
        tags: ['turn', 'slot']
    },
    {
        id: 3,
        name: 'Whip',
        counts: 8,
        type: WCSPatternType.WHIP,
        level: WCSPatternLevel.BEGINNER,
        prerequisites: ['sugar-push'],
        description: 'Follower walks past leader with extension',
        tags: ['fundamental', 'slot']
    }
]

export const defaultNewPattern: Omit<WCSPattern, "id"> = {
    name: '',
    counts: 6,
    type: WCSPatternType.PASS,
    level: WCSPatternLevel.BEGINNER,
    prerequisites: [],
    description: '',
    tags: []
}