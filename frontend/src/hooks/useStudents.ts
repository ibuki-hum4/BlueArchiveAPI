'use client';

import { useState, useEffect, useMemo } from 'react';
import { Student, StudentFilter, SortOptions } from '@/types/student';
import { fetchStudents } from '@/lib/api';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StudentFilter>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    order: 'asc'
  });

  // 生徒データの取得
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();
        setStudents(data);
      } catch (err) {
        console.error('Error loading students:', err);
        setError('生徒データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // フィルターとソートの適用
  const filteredAndSortedStudents = useMemo(() => {
    let result = students;

    // フィルター適用
    if (filter.name) {
      result = result.filter(student =>
        student.name.toLowerCase().includes(filter.name!.toLowerCase())
      );
    }
    if (filter.school) {
      result = result.filter(student => student.school === filter.school);
    }
    if (filter.rarity !== undefined) {
      result = result.filter(student => student.rarity === filter.rarity);
    }
    if (filter.weaponType) {
      result = result.filter(student => student.weapon.type === filter.weaponType);
    }
    if (filter.attackType) {
      result = result.filter(student => student.combat.attackType === filter.attackType);
    }
    if (filter.defenseType) {
      result = result.filter(student => student.combat.defenseType === filter.defenseType);
    }
    if (filter.position) {
      result = result.filter(student => student.role.position === filter.position);
    }

    // ソート適用
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rarity':
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        case 'school':
          aValue = a.school;
          bValue = b.school;
          break;
        case 'weapon.type':
          aValue = a.weapon.type;
          bValue = b.weapon.type;
          break;
        case 'combat.attackType':
          aValue = a.combat.attackType;
          bValue = b.combat.attackType;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, filter, sortOptions]);

  const handleFilterChange = (newFilter: StudentFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: SortOptions) => {
    setSortOptions(newSort);
  };

  // ユニークな学校名を取得（あいうえお順）
  const uniqueSchools = useMemo(() => {
    const schoolSet = new Set(students.map(student => student.school));
    return Array.from(schoolSet).sort((a, b) => a.localeCompare(b, 'ja-JP'));
  }, [students]);

  // ユニークな武器タイプを取得
  const uniqueWeaponTypes = useMemo(() => {
    const weaponSet = new Set(students.map(student => student.weapon.type));
    return Array.from(weaponSet).sort();
  }, [students]);

  return {
    students: filteredAndSortedStudents,
    totalCount: filteredAndSortedStudents.length,
    allStudents: students,
    uniqueSchools,
    uniqueWeaponTypes,
    loading,
    error,
    handleFilterChange,
    handleSortChange,
    refetch: () => {
      setLoading(true);
      fetchStudents()
        .then(setStudents)
        .catch(err => {
          console.error('Error refetching students:', err);
          setError('生徒データの再取得に失敗しました');
        })
        .finally(() => setLoading(false));
    }
  };
}