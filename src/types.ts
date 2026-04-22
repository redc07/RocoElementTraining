export enum Effectiveness {
  NORMAL = 0,     // 1x
  SUPER = 1,      // 2x (Green Circle)
  RESISTED = 2,   // 0.5x/0x (Red Triangle)
}

export interface Attribute {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  iconName: string;
}

export type Matrix = number[][];
