'use client';

import { useState } from 'react';
import { StudentFilter, SortOptions, SortField, SortOrder } from '@/types/student';

interface SearchAndFilterProps {
  onFilterChange: (filter: StudentFilter) => void;
  onSortChange: (sort: SortOptions) => void;
  totalCount: number;
  schools?: string[];
  weaponTypes?: string[];
}

export default function SearchAndFilter({ onFilterChange, onSortChange, totalCount, schools = [], weaponTypes = [] }: SearchAndFilterProps) {
  const [filter, setFilter] = useState<StudentFilter>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleFilterChange = (newFilter: Partial<StudentFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    onSortChange({ field, order });
  };

  const clearFilters = () => {
    const emptyFilter = {};
    setFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  // デフォルトの武器タイプ（propsで提供されない場合のフォールバック）
  const defaultWeaponTypes = ['HG', 'AR', 'SMG', 'SR', 'SG', 'GL', 'RL', 'RG', 'MG', 'MT', 'FT'];
  const displayWeaponTypes = weaponTypes.length > 0 ? weaponTypes : defaultWeaponTypes;
  const attackTypes = ['神秘', '爆発', '貫通', '振動'];
  const defenseTypes = ['重装甲', '軽装備', '特殊装甲', '弾力装甲'];
  const positions = ['FRONT', 'MIDDLE', 'BACK'];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
      {/* 検索バー */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生徒名で検索
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="生徒名を入力..."
            value={filter.name || ''}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学校
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.school || ''}
            onChange={(e) => handleFilterChange({ school: e.target.value || undefined })}
          >
            <option value="">すべての学校</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* フィルター */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レア度
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.rarity || ''}
            onChange={(e) => handleFilterChange({ rarity: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">すべて</option>
            <option value="3">★3</option>
            <option value="2">★2</option>
            <option value="1">★1</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            武器タイプ
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.weaponType || ''}
            onChange={(e) => handleFilterChange({ weaponType: e.target.value || undefined })}
          >
            <option value="">すべて</option>
            {displayWeaponTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            攻撃タイプ
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.attackType || ''}
            onChange={(e) => handleFilterChange({ attackType: e.target.value || undefined })}
          >
            <option value="">すべて</option>
            {attackTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            防御タイプ
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.defenseType || ''}
            onChange={(e) => handleFilterChange({ defenseType: e.target.value || undefined })}
          >
            <option value="">すべて</option>
            {defenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ポジション
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter.position || ''}
            onChange={(e) => handleFilterChange({ position: e.target.value || undefined })}
          >
            <option value="">すべて</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ソート・アクション */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">並び替え:</label>
            <select
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as SortField, sortOrder)}
            >
              <option value="name">生徒名</option>
              <option value="rarity">レア度</option>
              <option value="school">学校</option>
              <option value="weapon.type">武器タイプ</option>
              <option value="combat.attackType">攻撃タイプ</option>
            </select>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => handleSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            className="px-4 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
            onClick={clearFilters}
          >
            フィルターをクリア
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {totalCount}件の生徒が見つかりました
        </div>
      </div>
    </div>
  );
}