'use client';

import { memo, useId, useState } from 'react';
import { StudentFilter, SortOptions, SortField, SortOrder } from '@/types/student';
import { ATTACK_TYPES, DEFENSE_TYPES, POSITIONS, WEAPON_TYPES } from '@/lib/student-options';

interface SearchAndFilterProps {
  onFilterChange: (filter: StudentFilter) => void;
  onSortChange: (sort: SortOptions) => void;
  totalCount: number;
  schools?: string[];
  weaponTypes?: string[];
}

function SearchAndFilter({ onFilterChange, onSortChange, totalCount, schools = [], weaponTypes = [] }: SearchAndFilterProps) {
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

  // 武器タイプ（propsで提供されない場合は共通定義をフォールバックとして使用）
  const displayWeaponTypes = weaponTypes.length > 0 ? weaponTypes : WEAPON_TYPES;

  const inputClass =
    'w-full rounded-full border border-ba-blue-200 bg-white px-4 py-2 text-ba-navy-900 placeholder:text-ba-navy-300 focus:outline-none focus:ring-2 focus:ring-ba-blue-300 focus:border-ba-blue-400';
  const labelClass = 'block text-sm font-semibold text-ba-navy-700 mb-2';

  return (
    <form
      className="space-y-6 rounded-3xl border border-ba-blue-100 bg-white p-6 shadow-sm"
      role="search"
      aria-labelledby={`${formId}-title`}
      aria-describedby={`${formId}-summary`}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ba-blue-100 pb-3">
        <h3 id={`${formId}-title`} className="font-rounded text-base font-bold text-ba-navy-900">
          検索とフィルター
        </h3>
        <span id={`${formId}-summary`} className="text-xs text-ba-navy-400">
          条件を入力すると即座に結果が更新されます
        </span>
      </div>

      {/* 検索バー */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor={nameId} className={labelClass}>
            生徒名で検索
          </label>
          <input
            type="text"
            id={nameId}
            className={inputClass}
            placeholder="生徒名を入力..."
            value={filter.name || ''}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor={schoolId} className={labelClass}>
            学校
          </label>
          <select
            id={schoolId}
            className={inputClass}
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
        <legend className="text-sm font-semibold text-ba-navy-700">詳細フィルター</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label htmlFor={rarityId} className={labelClass}>
              レア度
            </label>
            <select
              id={rarityId}
              className={inputClass}
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
            <label htmlFor={weaponId} className={labelClass}>
              武器タイプ
            </label>
            <select
              id={weaponId}
              className={inputClass}
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
            <label htmlFor={attackId} className={labelClass}>
              攻撃タイプ
            </label>
            <select
              id={attackId}
              className={inputClass}
              value={filter.attackType || ''}
              onChange={(e) => handleFilterChange({ attackType: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {ATTACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={defenseId} className={labelClass}>
              防御タイプ
            </label>
            <select
              id={defenseId}
              className={inputClass}
              value={filter.defenseType || ''}
              onChange={(e) => handleFilterChange({ defenseType: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {DEFENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={positionId} className={labelClass}>
              ポジション
            </label>
            <select
              id={positionId}
              className={inputClass}
              value={filter.position || ''}
              onChange={(e) => handleFilterChange({ position: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {POSITIONS.map((pos) => (
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor={sortFieldId} className="text-sm font-semibold text-ba-navy-700">並び替え:</label>
            <select
              id={sortFieldId}
              className="rounded-full border border-ba-blue-200 bg-white px-3 py-1.5 text-sm text-ba-navy-900 focus:outline-none focus:ring-2 focus:ring-ba-blue-300 focus:border-ba-blue-400"
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
              className="rounded-full border border-ba-blue-200 bg-ba-blue-50 px-3 py-1.5 text-sm font-semibold text-ba-blue-700 transition hover:bg-ba-blue-100 focus:outline-none focus:ring-2 focus:ring-ba-blue-300"
              aria-label={`並び順を${sortOrder === 'asc' ? '降順' : '昇順'}に変更`}
              onClick={() => handleSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            type="button"
            className="rounded-full bg-ba-yellow-400 px-4 py-1.5 text-sm font-bold text-ba-navy-900 transition hover:bg-ba-yellow-300 focus:outline-none focus:ring-2 focus:ring-ba-yellow-500"
            onClick={clearFilters}
          >
            フィルターをクリア
          </button>
        </div>
        <div className="text-sm text-ba-navy-500" aria-live="polite">
          {totalCount}件の生徒が見つかりました
        </div>
      </div>
    </form>
  );
}

export default memo(SearchAndFilter);
