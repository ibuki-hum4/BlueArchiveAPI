'use client';

import { memo, useId, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search, X } from 'lucide-react';
import { StudentFilter, SortOptions, SortField, SortOrder } from '@/types/student';
import { ATTACK_TYPES, DEFENSE_TYPES, POSITIONS, WEAPON_TYPES } from '@/lib/student-options';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const hasActiveFilter = Object.values(filter).some((value) => value !== undefined && value !== '');
  // 未選択のセレクトは控えめに、選択中は強調して見分けやすくする
  const selectClass = (active: boolean) =>
    cn('h-10', active ? 'border-gray-900 font-medium text-gray-900' : 'text-gray-500');

  return (
    <form
      className="space-y-3"
      role="search"
      aria-label="生徒の検索とフィルター"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Label htmlFor={nameId} className="sr-only">生徒名で検索</Label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            type="search"
            id={nameId}
            placeholder="生徒名で検索"
            value={filter.name || ''}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            autoComplete="off"
            className="h-11 rounded-xl pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Label htmlFor={sortFieldId} className="sr-only">並び替え</Label>
          <Select
            id={sortFieldId}
            className="h-11 rounded-xl"
            value={sortField}
            onChange={(e) => handleSortChange(e.target.value as SortField, sortOrder)}
          >
            <option value="name">名前順</option>
            <option value="rarity">レア度順</option>
            <option value="school">学校順</option>
            <option value="weapon.type">武器タイプ順</option>
            <option value="combat.attackType">攻撃タイプ順</option>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            aria-label={`並び順を${sortOrder === 'asc' ? '降順' : '昇順'}に変更`}
            onClick={() => handleSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <ArrowUpNarrowWide aria-hidden="true" /> : <ArrowDownWideNarrow aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <legend className="sr-only">詳細フィルター</legend>
        <div>
          <Label htmlFor={schoolId} className="sr-only">学校</Label>
          <Select
            id={schoolId}
            className={selectClass(!!filter.school)}
            value={filter.school || ''}
            onChange={(e) => handleFilterChange({ school: e.target.value || undefined })}
          >
            <option value="">学校</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={rarityId} className="sr-only">レア度</Label>
          <Select
            id={rarityId}
            className={selectClass(filter.rarity !== undefined)}
            value={filter.rarity || ''}
            onChange={(e) => handleFilterChange({ rarity: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">レア度</option>
            <option value="3">★3</option>
            <option value="2">★2</option>
            <option value="1">★1</option>
          </Select>
        </div>
        <div>
          <Label htmlFor={weaponId} className="sr-only">武器タイプ</Label>
          <Select
            id={weaponId}
            className={selectClass(!!filter.weaponType)}
            value={filter.weaponType || ''}
            onChange={(e) => handleFilterChange({ weaponType: e.target.value || undefined })}
          >
            <option value="">武器タイプ</option>
            {displayWeaponTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={attackId} className="sr-only">攻撃タイプ</Label>
          <Select
            id={attackId}
            className={selectClass(!!filter.attackType)}
            value={filter.attackType || ''}
            onChange={(e) => handleFilterChange({ attackType: e.target.value || undefined })}
          >
            <option value="">攻撃タイプ</option>
            {ATTACK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={defenseId} className="sr-only">防御タイプ</Label>
          <Select
            id={defenseId}
            className={selectClass(!!filter.defenseType)}
            value={filter.defenseType || ''}
            onChange={(e) => handleFilterChange({ defenseType: e.target.value || undefined })}
          >
            <option value="">防御タイプ</option>
            {DEFENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={positionId} className="sr-only">ポジション</Label>
          <Select
            id={positionId}
            className={selectClass(!!filter.position)}
            value={filter.position || ''}
            onChange={(e) => handleFilterChange({ position: e.target.value || undefined })}
          >
            <option value="">ポジション</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <div className="flex h-8 items-center justify-between text-sm text-gray-500">
        <p aria-live="polite">
          <span className="font-semibold text-gray-900">{totalCount}</span> 件
        </p>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            条件をクリア
          </button>
        )}
      </div>
    </form>
  );
}

export default memo(SearchAndFilter);
