'use client';

import { FormEvent, useId, useState } from 'react';
import { Student } from '@/types/student';
import RarityStars from '@/components/RarityStars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  ATTACK_TYPES,
  DEFENSE_TYPES,
  POSITIONS,
  RARITIES,
  ROLE_CLASSES,
  ROLE_TYPES,
  TERRAIN_GRADES,
  WEAPON_TYPES,
} from '@/lib/student-options';

export type StudentFormValues = Student;

interface StudentFormProps {
  initialValue?: Student;
  schools?: string[];
  mode: 'create' | 'edit';
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: StudentFormValues) => void;
}

const EMPTY_VALUES: StudentFormValues = {
  id: '',
  name: '',
  rarity: 3,
  weapon: { type: 'HG', cover: false },
  role: { type: 'STRIKER', class: 'アタッカー', position: 'FRONT' },
  school: '',
  combat: { attackType: '神秘', defenseType: '軽装備' },
  terrainAdaptation: { city: 'B', outdoor: 'B', indoor: 'B' },
};

export default function StudentForm({
  initialValue,
  schools = [],
  mode,
  submitLabel,
  submitting = false,
  error,
  onSubmit,
}: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(() =>
    initialValue ? { ...initialValue } : { ...EMPTY_VALUES }
  );
  const formId = useId();
  const schoolListId = `${formId}-schools`;

  const updateField = <K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateWeapon = (patch: Partial<Student['weapon']>) => {
    setValues((prev) => ({ ...prev, weapon: { ...prev.weapon, ...patch } }));
  };

  const updateRole = (patch: Partial<Student['role']>) => {
    setValues((prev) => ({ ...prev, role: { ...prev.role, ...patch } }));
  };

  const updateCombat = (patch: Partial<Student['combat']>) => {
    setValues((prev) => ({ ...prev, combat: { ...prev.combat, ...patch } }));
  };

  const updateTerrain = (patch: Partial<Student['terrainAdaptation']>) => {
    setValues((prev) => ({ ...prev, terrainAdaptation: { ...prev.terrainAdaptation, ...patch } }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-ba-blue-100 bg-white p-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* プレビュー */}
      <div className="flex items-center gap-3 rounded-lg bg-ba-blue-50 px-4 py-3">
        <RarityStars rarity={values.rarity} size="lg" />
        <span className="font-rounded text-lg font-bold text-ba-navy-900">
          {values.name || '生徒名未設定'}
        </span>
      </div>

      {/* 基本情報 */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">基本情報</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${formId}-name`}>生徒名</Label>
            <Input
              id={`${formId}-name`}
              type="text"
              required
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${formId}-school`}>学校</Label>
            <Input
              id={`${formId}-school`}
              type="text"
              required
              list={schoolListId}
              value={values.school}
              onChange={(e) => updateField('school', e.target.value)}
            />
            <datalist id={schoolListId}>
              {schools.map((school) => (
                <option key={school} value={school} />
              ))}
            </datalist>
          </div>
          {mode === 'create' && (
            <div>
              <Label htmlFor={`${formId}-id`}>ID（任意・未入力で自動生成）</Label>
              <Input
                id={`${formId}-id`}
                type="text"
                value={values.id}
                onChange={(e) => updateField('id', e.target.value)}
                placeholder="自動生成されます"
              />
            </div>
          )}
          <div>
            <Label htmlFor={`${formId}-rarity`}>レア度</Label>
            <Select
              id={`${formId}-rarity`}
              value={values.rarity}
              onChange={(e) => updateField('rarity', Number(e.target.value))}
            >
              {RARITIES.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {'★'.repeat(rarity)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      {/* 戦闘情報 */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">戦闘情報</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${formId}-weapon-type`}>武器タイプ</Label>
            <Select
              id={`${formId}-weapon-type`}
              value={values.weapon.type}
              onChange={(e) => updateWeapon({ type: e.target.value })}
            >
              {WEAPON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ba-navy-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ba-blue-300 text-ba-blue-500 focus:ring-ba-blue-300"
                checked={values.weapon.cover}
                onChange={(e) => updateWeapon({ cover: e.target.checked })}
              />
              カバー対象
            </label>
          </div>
          <div>
            <Label htmlFor={`${formId}-attack-type`}>攻撃タイプ</Label>
            <Select
              id={`${formId}-attack-type`}
              value={values.combat.attackType}
              onChange={(e) => updateCombat({ attackType: e.target.value })}
            >
              {ATTACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formId}-defense-type`}>防御タイプ</Label>
            <Select
              id={`${formId}-defense-type`}
              value={values.combat.defenseType}
              onChange={(e) => updateCombat({ defenseType: e.target.value })}
            >
              {DEFENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      {/* 役割・ポジション */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">役割・ポジション</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${formId}-role-type`}>タイプ</Label>
            <Select
              id={`${formId}-role-type`}
              value={values.role.type}
              onChange={(e) => updateRole({ type: e.target.value })}
            >
              {ROLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formId}-role-class`}>クラス</Label>
            <Select
              id={`${formId}-role-class`}
              value={values.role.class}
              onChange={(e) => updateRole({ class: e.target.value })}
            >
              {ROLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formId}-role-position`}>ポジション</Label>
            <Select
              id={`${formId}-role-position`}
              value={values.role.position}
              onChange={(e) => updateRole({ position: e.target.value })}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      {/* 地形適応度 */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">地形適応度</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${formId}-terrain-city`}>市街地</Label>
            <Select
              id={`${formId}-terrain-city`}
              value={values.terrainAdaptation.city}
              onChange={(e) => updateTerrain({ city: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formId}-terrain-outdoor`}>屋外</Label>
            <Select
              id={`${formId}-terrain-outdoor`}
              value={values.terrainAdaptation.outdoor}
              onChange={(e) => updateTerrain({ outdoor: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formId}-terrain-indoor`}>屋内</Label>
            <Select
              id={`${formId}-terrain-indoor`}
              value={values.terrainAdaptation.indoor}
              onChange={(e) => updateTerrain({ indoor: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end border-t border-ba-blue-100 pt-4">
        <Button type="submit" disabled={submitting} className="px-6 font-bold">
          {submitting ? '送信中...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
