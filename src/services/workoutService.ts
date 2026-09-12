import { supabase } from '../lib/supabase';
import type { Exercise, WorkoutDay, WorkoutDayExercise, WorkoutPlan, WorkoutPlanFilters } from '../types';

export async function getWorkoutPlans(filters: WorkoutPlanFilters): Promise<WorkoutPlan[]> {
  let query = supabase.from('workout_plans').select('*').order('created_at', { ascending: false });
  if (filters.search.trim()) query = query.or(`name.ilike.%${filters.search.trim()}%,plan_id.ilike.%${filters.search.trim()}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.goal) query = query.eq('goal', filters.goal);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  const { data, error } = await query; if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(async plan => { const [{ count: day_count }, { count: assigned_count }] = await Promise.all([supabase.from('workout_days').select('id', { count: 'exact', head: true }).eq('workout_plan_id', plan.id), supabase.from('workout_plan_members').select('id', { count: 'exact', head: true }).eq('workout_plan_id', plan.id).eq('status', 'active')]); return { ...plan, day_count: day_count ?? 0, assigned_count: assigned_count ?? 0 } as WorkoutPlan; }));
}
export async function createWorkoutPlan(input: Pick<WorkoutPlan, 'name' | 'description' | 'goal' | 'difficulty' | 'duration_weeks' | 'status'>): Promise<WorkoutPlan> { const { data, error } = await supabase.from('workout_plans').insert(input).select().single(); if (error) throw new Error(error.message); return data as WorkoutPlan; }
export async function updateWorkoutPlan(id: string, input: Partial<WorkoutPlan>): Promise<WorkoutPlan> { const { data, error } = await supabase.from('workout_plans').update(input).eq('id', id).select().single(); if (error) throw new Error(error.message); return data as WorkoutPlan; }
export async function deleteWorkoutPlan(id: string) { const { error } = await supabase.from('workout_plans').delete().eq('id', id); if (error) throw new Error(error.message); }
export async function getWorkoutDays(planId: string): Promise<WorkoutDay[]> { const { data, error } = await supabase.from('workout_days').select('*').eq('workout_plan_id', planId).order('day_number'); if (error) throw new Error(error.message); return Promise.all((data ?? []).map(async day => { const { data: links } = await supabase.from('workout_day_exercises').select('*, exercise:exercises(*)').eq('workout_day_id', day.id).order('order_index'); return { ...day, exercises: links as WorkoutDayExercise[] ?? [] }; })); }
export async function createWorkoutDay(planId: string, day: Pick<WorkoutDay, 'day_number' | 'day_name' | 'focus'>) { const { data, error } = await supabase.from('workout_days').insert({ workout_plan_id: planId, ...day }).select().single(); if (error) throw new Error(error.message); return data as WorkoutDay; }
export async function deleteWorkoutDay(id: string) { const { error } = await supabase.from('workout_days').delete().eq('id', id); if (error) throw new Error(error.message); }
export async function getExercises(search = ''): Promise<Exercise[]> { let q = supabase.from('exercises').select('*').order('name'); if (search.trim()) q = q.ilike('name', `%${search.trim()}%`); const { data, error } = await q; if (error) throw new Error(error.message); return (data ?? []) as Exercise[]; }
export async function createExercise(input: Omit<Exercise, 'id'>) { const { data, error } = await supabase.from('exercises').insert(input).select().single(); if (error) throw new Error(error.message); return data as Exercise; }
export async function addDayExercise(input: Omit<WorkoutDayExercise, 'id' | 'exercise'>) { const { data, error } = await supabase.from('workout_day_exercises').insert(input).select().single(); if (error) throw new Error(error.message); return data as WorkoutDayExercise; }
export async function removeDayExercise(id: string) { const { error } = await supabase.from('workout_day_exercises').delete().eq('id', id); if (error) throw new Error(error.message); }
export async function assignWorkoutPlan(memberId: string, planId: string, startDate: string, endDate: string | null) { const { error } = await supabase.from('workout_plan_members').upsert({ member_id: memberId, workout_plan_id: planId, start_date: startDate, end_date: endDate, status: 'active' }, { onConflict: 'workout_plan_id,member_id' }); if (error) throw new Error(error.message); }
export async function removeWorkoutPlan(memberId: string, planId?: string) { let q = supabase.from('workout_plan_members').update({ status: 'cancelled' }).eq('member_id', memberId); if (planId) q = q.eq('workout_plan_id', planId); const { error } = await q; if (error) throw new Error(error.message); }
export async function getMemberWorkoutPlan(memberId: string) {
  const { data: assignment, error: assignmentError } = await supabase.from('workout_plan_members').select('id, workout_plan_id, member_id, start_date, end_date, status').eq('member_id', memberId).eq('status', 'active').maybeSingle();
  if (assignmentError) throw new Error(assignmentError.message);
  if (!assignment) return null;
  const { data: plan, error: planError } = await supabase.from('workout_plans').select('id, plan_id, name, goal, difficulty, duration_weeks, status').eq('id', assignment.workout_plan_id).single();
  if (planError) throw new Error(planError.message);
  return { ...plan, start_date: assignment.start_date, end_date: assignment.end_date, assignment_id: assignment.id };
}
