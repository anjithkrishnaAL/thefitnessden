import { supabase } from '../lib/supabase';
import { getActiveMembership } from './membershipService';
import type { CreateTrainerInput, Trainer, TrainerFilters, TrainerMember, TrainerPerformance, TrainerStats, UpdateTrainerInput } from '../types';

const BUCKET = 'trainer-photos';
const select = '*';

function clean(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== ''));
}

async function withCounts(rows: Trainer[]): Promise<Trainer[]> {
  if (!rows.length) return rows;
  const { data } = await supabase.from('members').select('trainer_id').in('trainer_id', rows.map(t => t.id));
  const counts = new Map<string, number>();
  (data ?? []).forEach(row => counts.set(row.trainer_id, (counts.get(row.trainer_id) ?? 0) + 1));
  return rows.map(row => ({ ...row, assigned_count: counts.get(row.id) ?? 0 }));
}

export async function getTrainers(filters: TrainerFilters = { search: '', status: '', specialization: '' }): Promise<Trainer[]> {
  let query = supabase.from('trainers').select(select).order('created_at', { ascending: false });
  const q = filters.search.trim();
  if (q) query = query.or(`full_name.ilike.%${q}%,trainer_id.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,specialization.ilike.%${q}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.specialization) query = query.eq('specialization', filters.specialization);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return withCounts((data ?? []) as Trainer[]);
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  const { data, error } = await supabase.from('trainers').select(select).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (await withCounts([data as Trainer]))[0] : null;
}

export async function createTrainer(input: CreateTrainerInput): Promise<Trainer> {
  const { data, error } = await supabase.from('trainers').insert(clean(input as unknown as Record<string, unknown>)).select().single();
  if (error) throw new Error(error.message);
  return data as Trainer;
}

export async function updateTrainer({ id, ...input }: UpdateTrainerInput): Promise<Trainer> {
  const { data, error } = await supabase.from('trainers').update(clean(input)).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Trainer;
}

export async function deleteTrainer(id: string): Promise<void> {
  const { count, error: countError } = await supabase.from('members').select('id', { count: 'exact', head: true }).eq('trainer_id', id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) throw new Error('This trainer is currently assigned to members. Reassign them or deactivate the trainer first.');
  const { error } = await supabase.from('trainers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getTrainerStats(): Promise<TrainerStats> {
  const [{ data: trainers, error: trainerError }, { data: members, error: memberError }] = await Promise.all([
    supabase.from('trainers').select('id,status,experience_years'),
    supabase.from('members').select('id,trainer_id,status').not('trainer_id', 'is', null),
  ]);
  if (trainerError) throw new Error(trainerError.message);
  if (memberError) throw new Error(memberError.message);
  const experience = (trainers ?? []).map(t => Number(t.experience_years)).filter(n => Number.isFinite(n));
  const { count: totalMembers } = await supabase.from('members').select('id', { count: 'exact', head: true });
  return { total: trainers?.length ?? 0, active: trainers?.filter(t => t.status === 'active').length ?? 0, assignedMembers: members?.length ?? 0, unassignedMembers: Math.max(0, (totalMembers ?? 0) - (members?.length ?? 0)), averageExperience: experience.length ? experience.reduce((a, b) => a + b, 0) / experience.length : 0 };
}

export async function getTrainerMembers(trainerId: string): Promise<TrainerMember[]> {
  const { data, error } = await supabase.from('members').select('id,member_id,full_name,email,phone,profile_photo_url,status').eq('trainer_id', trainerId).order('full_name');
  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(async member => ({ ...member, current_membership: await getActiveMembership(member.id).catch(() => null) }))) as Promise<TrainerMember[]>;
}

export async function assignMemberToTrainer(memberId: string, trainerId: string): Promise<void> {
  const { data: trainer, error: trainerError } = await supabase.from('trainers').select('status').eq('id', trainerId).single();
  if (trainerError) throw new Error(trainerError.message);
  if (trainer.status !== 'active') throw new Error('Only active trainers can receive new member assignments.');
  const { error } = await supabase.from('members').update({ trainer_id: trainerId }).eq('id', memberId);
  if (error) throw new Error(error.message);
}

export async function removeMemberFromTrainer(memberId: string): Promise<void> {
  const { error } = await supabase.from('members').update({ trainer_id: null }).eq('id', memberId);
  if (error) throw new Error(error.message);
}

export async function getTrainerPerformance(trainerId: string): Promise<TrainerPerformance> {
  const members = await getTrainerMembers(trainerId);
  if (!members.length) return { assignedMembers: 0, activeAssignedMembers: 0, attendanceCount: 0, averageMemberAttendance: 0 };
  const { data, error } = await supabase.from('attendance').select('member_id').in('member_id', members.map(m => m.id));
  if (error) throw new Error(error.message);
  return { assignedMembers: members.length, activeAssignedMembers: members.filter(m => m.status === 'active').length, attendanceCount: data?.length ?? 0, averageMemberAttendance: data?.length ? (data.length / members.length) : 0 };
}

export async function uploadTrainerPhoto(file: File, trainerId: string): Promise<{ url: string; path: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Please upload a JPEG, PNG, WebP, or GIF image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB.');
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `trainers/${trainerId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  if (!data?.signedUrl) throw new Error('Photo uploaded but could not create a secure URL.');
  return { url: data.signedUrl, path };
}
