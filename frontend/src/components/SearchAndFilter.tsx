 'use client';

import { useId, useState, useEffect } from 'react';
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
  const formId = useId();
  const nameId = `${formId}-name`;
  const schoolId = `${formId}-school`;
  const rarityId = `${formId}-rarity`;
  const weaponId = `${formId}-weapon`;
  const attackId = `${formId}-attack`;
  const defenseId = `${formId}-defense`;
  const positionId = `${formId}-position`;
  const sortFieldId = `${formId}-sort-field`;

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
  const attackTypes = ['神秘', '爆発', '貫通', '振動', '分解'];
  const defenseTypes = ['重装甲', '軽装備', '特殊装甲', '弾力装甲', '複合装甲'];
  const positions = ['FRONT', 'MIDDLE', 'BACK'];

  // Debug: log incoming totalCount when it changes
  // eslint-disable-next-line no-console
  useEffect(() => {
    console.debug('[SearchAndFilter] prop totalCount:', totalCount);
  }, [totalCount]);

  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6"
      role="search"
      aria-labelledby={`${formId}-title`}
      aria-describedby={`${formId}-summary`}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${formId}-title`} className="text-base font-semibold text-slate-900">
          検索とフィルター
        </h3>
        <span id={`${formId}-summary`} className="text-xs text-slate-500">
          条件を入力すると即座に結果が更新されます
        </span>
      </div>

      {/* 検索バー */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor={nameId} className="block text-sm font-semibold text-slate-700 mb-2">
            生徒名で検索
          </label>
          <input
            type="text"
            id={nameId}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="生徒名を入力..."
            value={filter.name || ''}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor={schoolId} className="block text-sm font-semibold text-slate-700 mb-2">
            学校
          </label>
          <select
            id={schoolId}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-700">詳細フィルター</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label htmlFor={rarityId} className="block text-sm font-semibold text-slate-700 mb-2">
              レア度
            </label>
            <select
              id={rarityId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
            <label htmlFor={weaponId} className="block text-sm font-semibold text-slate-700 mb-2">
              武器タイプ
            </label>
            <select
              id={weaponId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
            <label htmlFor={attackId} className="block text-sm font-semibold text-slate-700 mb-2">
              攻撃タイプ
            </label>
            <select
              id={attackId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
            <label htmlFor={defenseId} className="block text-sm font-semibold text-slate-700 mb-2">
              防御タイプ
            </label>
            <select
              id={defenseId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
            <label htmlFor={positionId} className="block text-sm font-semibold text-slate-700 mb-2">
              ポジション
            </label>
            <select
              id={positionId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
      </fieldset>

      {/* ソート・アクション */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor={sortFieldId} className="text-sm font-semibold text-slate-700">並び替え:</label>
            <select
              id={sortFieldId}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
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
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
              aria-label={`並び順を${sortOrder === 'asc' ? '降順' : '昇順'}に変更`}
              onClick={() => handleSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            type="button"
            className="rounded-lg px-4 py-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
            onClick={clearFilters}
          >
            フィルターをクリア
          </button>
        </div>
        <div className="text-sm text-slate-500" aria-live="polite">
          {totalCount}件の生徒が見つかりました
        </div>
      </div>
    </form>
  );
}