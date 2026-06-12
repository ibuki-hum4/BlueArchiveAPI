'use client';

import { memo, useId, useState } from 'react';
import { StudentFilter, SortOptions, SortField, SortOrder } from '@/types/student';
import { ATTACK_TYPES, DEFENSE_TYPES, POSITIONS, WEAPON_TYPES } from '@/lib/student-options';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
          <Label htmlFor={nameId}>生徒名で検索</Label>
          <Input
            type="text"
            id={nameId}
            placeholder="生徒名を入力..."
            value={filter.name || ''}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor={schoolId}>学校</Label>
          <Select
            id={schoolId}
            value={filter.school || ''}
            onChange={(e) => handleFilterChange({ school: e.target.value || undefined })}
          >
            <option value="">すべての学校</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* フィルター */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ba-navy-700">詳細フィルター</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <Label htmlFor={rarityId}>レア度</Label>
            <Select
              id={rarityId}
              value={filter.rarity || ''}
              onChange={(e) => handleFilterChange({ rarity: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">すべて</option>
              <option value="3">★3</option>
              <option value="2">★2</option>
              <option value="1">★1</option>
            </Select>
          </div>

          <div>
            <Label htmlFor={weaponId}>武器タイプ</Label>
            <Select
              id={weaponId}
              value={filter.weaponType || ''}
              onChange={(e) => handleFilterChange({ weaponType: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {displayWeaponTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor={attackId}>攻撃タイプ</Label>
            <Select
              id={attackId}
              value={filter.attackType || ''}
              onChange={(e) => handleFilterChange({ attackType: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {ATTACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor={defenseId}>防御タイプ</Label>
            <Select
              id={defenseId}
              value={filter.defenseType || ''}
              onChange={(e) => handleFilterChange({ defenseType: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {DEFENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor={positionId}>ポジション</Label>
            <Select
              id={positionId}
              value={filter.position || ''}
              onChange={(e) => handleFilterChange({ position: e.target.value || undefined })}
            >
              <option value="">すべて</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      {/* ソート・アクション */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor={sortFieldId} className="mb-0">並び替え:</Label>
            <Select
              id={sortFieldId}
              className="h-9 w-auto px-3 py-1.5"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as SortField, sortOrder)}
            >
              <option value="name">生徒名</option>
              <option value="rarity">レア度</option>
              <option value="school">学校</option>
              <option value="weapon.type">武器タイプ</option>
              <option value="combat.attackType">攻撃タイプ</option>
            </Select>
            <Button
              type="button"
              variant="secondary"
              className="h-9 border border-ba-blue-200 px-3"
              aria-label={`並び順を${sortOrder === 'asc' ? '降順' : '昇順'}に変更`}
              onClick={() => handleSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-ba-navy-200 px-4 text-ba-navy-600 hover:bg-ba-navy-50"
            onClick={clearFilters}
          >
            フィルターをクリア
          </Button>
        </div>
        <div className="text-sm text-ba-navy-500" aria-live="polite">
          {totalCount}件の生徒が見つかりました
        </div>
      </div>
    </form>
  );
}

export default memo(SearchAndFilter);
