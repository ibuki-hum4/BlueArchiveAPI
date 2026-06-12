'use client';

import { FormEvent, useId, useState } from 'react';
import { Student } from '@/types/student';
import RarityStars from '@/components/RarityStars';
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

const inputClass =
  'w-full rounded-full border border-ba-blue-200 bg-white px-4 py-2 text-ba-navy-900 placeholder:text-ba-navy-300 focus:outline-none focus:ring-2 focus:ring-ba-blue-300 focus:border-ba-blue-400';
const labelClass = 'block text-sm font-semibold text-ba-navy-700 mb-2';

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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-ba-blue-100 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* プレビュー */}
      <div className="flex items-center gap-3 rounded-2xl bg-ba-blue-50 px-4 py-3">
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
            <label htmlFor={`${formId}-name`} className={labelClass}>
              生徒名
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              required
              className={inputClass}
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-school`} className={labelClass}>
              学校
            </label>
            <input
              id={`${formId}-school`}
              type="text"
              required
              list={schoolListId}
              className={inputClass}
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
              <label htmlFor={`${formId}-id`} className={labelClass}>
                ID（任意・未入力で自動生成）
              </label>
              <input
                id={`${formId}-id`}
                type="text"
                className={inputClass}
                value={values.id}
                onChange={(e) => updateField('id', e.target.value)}
                placeholder="自動生成されます"
              />
            </div>
          )}
          <div>
            <label htmlFor={`${formId}-rarity`} className={labelClass}>
              レア度
            </label>
            <select
              id={`${formId}-rarity`}
              className={inputClass}
              value={values.rarity}
              onChange={(e) => updateField('rarity', Number(e.target.value))}
            >
              {RARITIES.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {'★'.repeat(rarity)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* 戦闘情報 */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">戦闘情報</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`${formId}-weapon-type`} className={labelClass}>
              武器タイプ
            </label>
            <select
              id={`${formId}-weapon-type`}
              className={inputClass}
              value={values.weapon.type}
              onChange={(e) => updateWeapon({ type: e.target.value })}
            >
              {WEAPON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
            <label htmlFor={`${formId}-attack-type`} className={labelClass}>
              攻撃タイプ
            </label>
            <select
              id={`${formId}-attack-type`}
              className={inputClass}
              value={values.combat.attackType}
              onChange={(e) => updateCombat({ attackType: e.target.value })}
            >
              {ATTACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${formId}-defense-type`} className={labelClass}>
              防御タイプ
            </label>
            <select
              id={`${formId}-defense-type`}
              className={inputClass}
              value={values.combat.defenseType}
              onChange={(e) => updateCombat({ defenseType: e.target.value })}
            >
              {DEFENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* 役割・ポジション */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">役割・ポジション</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`${formId}-role-type`} className={labelClass}>
              タイプ
            </label>
            <select
              id={`${formId}-role-type`}
              className={inputClass}
              value={values.role.type}
              onChange={(e) => updateRole({ type: e.target.value })}
            >
              {ROLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${formId}-role-class`} className={labelClass}>
              クラス
            </label>
            <select
              id={`${formId}-role-class`}
              className={inputClass}
              value={values.role.class}
              onChange={(e) => updateRole({ class: e.target.value })}
            >
              {ROLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${formId}-role-position`} className={labelClass}>
              ポジション
            </label>
            <select
              id={`${formId}-role-position`}
              className={inputClass}
              value={values.role.position}
              onChange={(e) => updateRole({ position: e.target.value })}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* 地形適応度 */}
      <fieldset className="space-y-4">
        <legend className="font-rounded text-base font-bold text-ba-navy-900">地形適応度</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`${formId}-terrain-city`} className={labelClass}>
              市街地
            </label>
            <select
              id={`${formId}-terrain-city`}
              className={inputClass}
              value={values.terrainAdaptation.city}
              onChange={(e) => updateTerrain({ city: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${formId}-terrain-outdoor`} className={labelClass}>
              屋外
            </label>
            <select
              id={`${formId}-terrain-outdoor`}
              className={inputClass}
              value={values.terrainAdaptation.outdoor}
              onChange={(e) => updateTerrain({ outdoor: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${formId}-terrain-indoor`} className={labelClass}>
              屋内
            </label>
            <select
              id={`${formId}-terrain-indoor`}
              className={inputClass}
              value={values.terrainAdaptation.indoor}
              onChange={(e) => updateTerrain({ indoor: e.target.value })}
            >
              {TERRAIN_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end border-t border-ba-blue-100 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ba-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ba-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '送信中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
