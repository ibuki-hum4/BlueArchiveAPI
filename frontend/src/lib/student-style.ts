// 生徒データの属性ごとの配色（ゲーム内の色分けに合わせる）

// 攻撃タイプと、それが有効な防御タイプは同じ色で表す
const ATTACK_DOT: Record<string, string> = {
  '爆発': 'bg-red-500',
  '貫通': 'bg-amber-400',
  '神秘': 'bg-sky-500',
  '振動': 'bg-violet-500',
  '分解': 'bg-emerald-500',
};

const DEFENSE_DOT: Record<string, string> = {
  '軽装備': 'bg-red-500',
  '重装甲': 'bg-amber-400',
  '特殊装甲': 'bg-sky-500',
  '弾力装甲': 'bg-violet-500',
  '複合装甲': 'bg-emerald-500',
};

export const attackDotClass = (attackType: string) => ATTACK_DOT[attackType] ?? 'bg-gray-400';
export const defenseDotClass = (defenseType: string) => DEFENSE_DOT[defenseType] ?? 'bg-gray-400';

// 地形適応度（S/Aだけ強調し、それ以外は控えめにする）
export const terrainGradeClass = (grade: string): string => {
  switch (grade) {
    case 'S': return 'text-gray-900';
    case 'A': return 'text-gray-700';
    default: return 'text-gray-400';
  }
};
