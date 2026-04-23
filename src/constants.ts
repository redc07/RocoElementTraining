import { Attribute } from "./types";

export const ATTRIBUTES: Attribute[] = [
  { id: "normal", name: "普", color: "#949495", bgColor: "#E5E5E6", iconName: "Circle" },
  { id: "grass", name: "草", color: "#10B981", bgColor: "#ECFDF5", iconName: "Leaf" },
  { id: "fire", name: "火", color: "#EF4444", bgColor: "#FEF2F2", iconName: "Flame" },
  { id: "water", name: "水", color: "#3B82F6", bgColor: "#EFF6FF", iconName: "Droplets" },
  { id: "light", name: "光", color: "#EAB308", bgColor: "#FEFCE8", iconName: "Sun" },
  { id: "ground", name: "地", color: "#92400E", bgColor: "#FEF3C7", iconName: "Mountain" },
  { id: "ice", name: "冰", color: "#06B6D4", bgColor: "#ECFEFF", iconName: "Snowflake" },
  { id: "dragon", name: "龙", color: "#6366F1", bgColor: "#EEF2FF", iconName: "Flame" },
  { id: "electric", name: "电", color: "#F59E0B", bgColor: "#FFFBEB", iconName: "Zap" },
  { id: "poison", name: "毒", color: "#A855F7", bgColor: "#F3E8FF", iconName: "Atom" },
  { id: "bug", name: "虫", color: "#84CC16", bgColor: "#F7FEE7", iconName: "Bug" },
  { id: "martial", name: "武", color: "#B91C1C", bgColor: "#FEE2E2", iconName: "Hand" },
  { id: "wing", name: "翼", color: "#8B5CF6", bgColor: "#EDE9FE", iconName: "Feather" },
  { id: "psychic", name: "萌", color: "#EC4899", bgColor: "#FCE7F3", iconName: "Heart" },
  { id: "ghost", name: "幽", color: "#4C1D95", bgColor: "#EDE9FE", iconName: "Ghost" },
  { id: "dark", name: "恶", color: "#818CF8", bgColor: "#E0E7FF", iconName: "Moon" },
  { id: "machine", name: "机", color: "#64748B", bgColor: "#F1F5F9", iconName: "Settings" },
  { id: "phantom", name: "幻", color: "#94A3B8", bgColor: "#F1F5F9", iconName: "Disc" },
];

/**
 * Effectiveness Matrix (Atk Row -> Def Col)
 * Multipliers: 2 (○), 0.5/0 (△), 1 (Normal)
 * Order: 普(0), 草(1), 火(2), 水(3), 光(4), 地(5), 冰(6), 龙(7), 电(8), 毒(9), 虫(10), 武(11), 翼(12), 萌(13), 幽(14), 恶(15), 机(16), 幻(17)
 */
export const EFFECTIVENESS_MATRIX: number[][] = [
  // 普, 草, 火, 水, 光, 地, 冰, 龙, 电, 毒, 虫, 武, 翼, 萌, 幽, 恶, 机, 幻
  [1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0.5, 1], // 普
  [1, 1, 0.5, 2, 2, 2, 1, 0.5, 1, 0.5, 0.5, 1, 0.5, 1, 1, 1, 0.5, 1], // 草
  [1, 2, 1, 0.5, 1, 0.5, 2, 0.5, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1], // 火
  [1, 0.5, 2, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], // 水
  [1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1], // 光
  [1, 0.5, 2, 1, 1, 1, 2, 1, 2, 2, 1, 0.5, 1, 1, 1, 1, 1, 1], // 地
  [1, 2, 0.5, 1, 1, 2, 0.5, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 1], // 冰
  [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1], // 龙
  [1, 0.5, 1, 2, 1, 0, 1, 0.5, 0.5, 1, 1, 1, 2, 1, 1, 1, 1, 1], // 电
  [1, 2, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 2, 0.5, 1, 0, 1], // 毒
  [1, 2, 0.5, 1, 1, 1, 1, 1, 1, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 2, 0.5, 2], // 虫
  [2, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 0.5, 1, 0.5, 0.5, 0, 2, 2, 0.5], // 格
  [1, 2, 1, 1, 1, 0.5, 1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 0.5, 1], // 翼
  [1, 1, 0.5, 1, 1, 1, 1, 2, 1, 0.5, 1, 2, 1, 1, 1, 2, 0.5, 1], // 萌
  [0.5, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0.5, 1, 2], // 幽
  [1, 1, 1, 1, 0.5, 1, 1, 1, 1, 2, 1, 0.5, 1, 2, 2, 0.5, 1, 1], // 恶
  [1, 1, 0.5, 0.5, 1, 2, 2, 1, 0.5, 1, 1, 1, 1, 2, 1, 1, 0.5, 1], // 机
  [1, 1, 1, 1, 0.5, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 0.5, 0.5], // 幻
];
