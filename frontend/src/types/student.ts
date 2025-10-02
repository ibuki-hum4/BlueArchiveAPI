// ブルーアーカイブの生徒データの型定義

export interface Weapon {
  type: string; // 例: "HG", "AR", "SR" など
  cover: boolean;
}

export interface Role {
  type: string; // 例: "SPECIAL", "STRIKER"
  class: string; // 例: "アタッカー", "T.S", "ヒーラー" など
  position: string; // 例: "BACK", "FRONT", "MIDDLE"
}

export interface Combat {
  attackType: string; // 例: "神秘", "爆発", "貫通"
  defenseType: string; // 例: "重装甲", "特殊装甲", "軽装甲"
}

export interface TerrainAdaptation {
  city: string; // 適応度 例: "S", "A", "B", "C", "D"
  outdoor: string;
  indoor: string;
}

export interface Student {
  id: string;
  name: string;
  rarity: number; // 1-3のレア度
  weapon: Weapon;
  role: Role;
  school: string; // 学校名
  combat: Combat;
  terrainAdaptation: TerrainAdaptation;
}

// API レスポンス型
export interface StudentsResponse {
  message: string;
  dataAllPage: number;
  data: Student[];
}

// フィルタリング用の型
export interface StudentFilter {
  name?: string;
  school?: string;
  rarity?: number;
  weaponType?: string;
  attackType?: string;
  defenseType?: string;
  position?: string;
}

// ソート用の型
export type SortField = 'name' | 'rarity' | 'school' | 'weapon.type' | 'combat.attackType';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}