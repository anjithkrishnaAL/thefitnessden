import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { MemberFilters, MemberStatus, MemberGender, FitnessGoal } from '../../types';

interface MemberFiltersBarProps {
  filters: MemberFilters;
  onChange: (f: MemberFilters) => void;
  onClear: () => void;
  trainerOptions?: { value: string; label: string }[];
  workoutPlanOptions?: { value: string; label: string }[];
}

const statusOptions: { value: MemberStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const genderOptions: { value: MemberGender | ''; label: string }[] = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const goalOptions: { value: FitnessGoal | ''; label: string }[] = [
  { value: '', label: 'All Goals' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
];

const isFiltered = (f: MemberFilters) =>
  f.search.trim() || f.status || f.gender || f.fitness_goal || f.trainer_id || f.workout_plan_id;

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | '';
  options: { value: T | ''; label: string }[];
  onChange: (v: T | '') => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value as T | '')}
        className={cn(
          'h-9 bg-den-surface border border-den-border rounded-xl',
          'text-sm text-den-text pl-3 pr-8 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60',
          'hover:border-den-borderHover transition-colors',
          value && 'border-den-accent/50 text-den-accent'
        )}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-den-card text-den-text">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-den-muted pointer-events-none" />
    </div>
  );
}

export function MemberFiltersBar({ filters, onChange, onClear, trainerOptions = [], workoutPlanOptions = [] }: MemberFiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-den-muted pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search name, ID, email, phone…"
          className={cn(
            'w-full h-9 bg-den-surface border border-den-border rounded-xl',
            'pl-9 pr-3.5 text-sm text-den-text placeholder:text-den-muted',
            'focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60',
            'hover:border-den-borderHover transition-colors'
          )}
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-den-muted hover:text-den-text transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect<MemberStatus>
          value={filters.status}
          options={statusOptions}
          onChange={v => onChange({ ...filters, status: v })}
        />
        <FilterSelect<MemberGender>
          value={filters.gender}
          options={genderOptions}
          onChange={v => onChange({ ...filters, gender: v })}
        />
        <FilterSelect<FitnessGoal>
          value={filters.fitness_goal}
          options={goalOptions}
          onChange={v => onChange({ ...filters, fitness_goal: v })}
        />
        {trainerOptions.length > 0 && <FilterSelect<string> value={filters.trainer_id} options={[{ value: '', label: 'All Trainers' }, { value: '__unassigned__', label: 'Unassigned' }, ...trainerOptions]} onChange={v => onChange({ ...filters, trainer_id: v })} />}
        {workoutPlanOptions.length > 0 && <FilterSelect<string> value={filters.workout_plan_id ?? ''} options={[{ value: '', label: 'All Plans' }, { value: '__unassigned__', label: 'No Workout Plan' }, ...workoutPlanOptions]} onChange={v => onChange({ ...filters, workout_plan_id: v })} />}
        {isFiltered(filters) && (
          <button
            onClick={onClear}
            className="h-9 px-3 text-sm text-den-muted hover:text-den-text border border-den-border rounded-xl hover:border-den-borderHover transition-colors flex items-center gap-1.5"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
