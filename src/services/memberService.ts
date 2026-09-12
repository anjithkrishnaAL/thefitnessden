/**
 * Member Service — TheFitnessDen
 *
 * All Supabase queries for the Members module live here.
 * Photo uploads go through Supabase Storage (bucket: member-photos).
 */

import { supabase } from '../lib/supabase';
import { getActiveMembership } from './membershipService';
import type {
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MemberFilters,
  MemberStats,
  MemberPage,
} from '../types';

const BUCKET = 'member-photos';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getMemberStats(): Promise<MemberStats> {
  const empty: MemberStats = { total: 0, active: 0, inactive: 0, suspended: 0, newThisMonth: 0 };

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [totalRes, activeRes, inactiveRes, suspendedRes, newRes] = await Promise.allSettled([
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'inactive'),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabase.from('members').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    ]);

    return {
      total:        totalRes.status === 'fulfilled'     ? (totalRes.value.count     ?? 0) : 0,
      active:       activeRes.status === 'fulfilled'    ? (activeRes.value.count    ?? 0) : 0,
      inactive:     inactiveRes.status === 'fulfilled'  ? (inactiveRes.value.count  ?? 0) : 0,
      suspended:    suspendedRes.status === 'fulfilled' ? (suspendedRes.value.count ?? 0) : 0,
      newThisMonth: newRes.status === 'fulfilled'       ? (newRes.value.count       ?? 0) : 0,
    };
  } catch (err) {
    console.error('[memberService.getMemberStats]', err);
    return empty;
  }
}

// ─── List members with filters + pagination ────────────────────────────────────

export async function getMembers(
  filters: MemberFilters,
  page: number,
  pageSize: number
): Promise<MemberPage> {
  try {
    let query = supabase
      .from('members')
      .select('*', { count: 'exact' });

    // Search across name, email, phone, member_id
    if (filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,member_id.ilike.%${q}%`
      );
    }

    if (filters.status)       query = query.eq('status', filters.status);
    if (filters.gender)       query = query.eq('gender', filters.gender);
    if (filters.fitness_goal) query = query.eq('fitness_goal', filters.fitness_goal);
    if (filters.trainer_id) query = query.eq('trainer_id', filters.trainer_id);

    // Server-side pagination
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[memberService.getMembers]', error.message);
      throw new Error('Unable to load members.');
    }

    const rows = (data as Member[]) ?? [];
    const trainerIds = [...new Set(rows.map(m => m.trainer_id).filter(Boolean))] as string[];
    const { data: trainerRows } = trainerIds.length ? await supabase.from('trainers').select('id,trainer_id,full_name,specialization,profile_photo_url').in('id', trainerIds) : { data: [] };
    const trainers = new Map((trainerRows ?? []).map(t => [t.id, t]));
    const hydratedMemberships = await Promise.all(rows.map(async member => {
      try { return { ...member, current_membership: await getActiveMembership(member.id) }; }
      catch (membershipError) { console.error('[memberService.getMembers] membership lookup:', membershipError); return member; }
    }));
    const hydrated = hydratedMemberships.map(member => ({ ...member, trainer: member.trainer_id ? trainers.get(member.trainer_id) ?? null : null }));

    return {
      data: hydrated,
      total: count ?? 0,
      page,
      pageSize,
    };
  } catch (err) {
    console.error('[memberService.getMembers]', err);
    throw err instanceof Error ? err : new Error('Unable to load members.');
  }
}

/** Fetch all rows matching the current filters for CSV export. */
export async function exportMembers(filters: MemberFilters): Promise<Member[]> {
  try {
    let query = supabase.from('members').select('*');

    if (filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,member_id.ilike.%${q}%`
      );
    }
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.gender) query = query.eq('gender', filters.gender);
    if (filters.fitness_goal) query = query.eq('fitness_goal', filters.fitness_goal);
    if (filters.trainer_id) query = query.eq('trainer_id', filters.trainer_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('[memberService.exportMembers]', error.message);
      throw new Error('Could not export members. Please try again.');
    }
    return (data as Member[]) ?? [];
  } catch (err) {
    console.error('[memberService.exportMembers]', err);
    throw err instanceof Error ? err : new Error('Could not export members. Please try again.');
  }
}

// ─── Single member ────────────────────────────────────────────────────────────

export async function getMember(id: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[memberService.getMember]', error.message);
      return null;
    }
    return data as Member;
  } catch (err) {
    console.error('[memberService.getMember]', err);
    return null;
  }
}

// ─── Create member ────────────────────────────────────────────────────────────

export async function createMember(input: CreateMemberInput): Promise<Member> {
  // Strip undefined values — Supabase doesn't want them
  const payload: Record<string, unknown> = {};
  Object.entries(input).forEach(([k, v]) => {
    if (v !== undefined && v !== '') payload[k] = v;
  });

  const { data, error } = await supabase
    .from('members')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[memberService.createMember]', error.message);
    throw new Error('Could not create member. Please try again.');
  }

  return data as Member;
}

// ─── Update member ────────────────────────────────────────────────────────────

export async function updateMember({ id, ...input }: UpdateMemberInput): Promise<Member> {
  const payload: Record<string, unknown> = {};
  Object.entries(input).forEach(([k, v]) => {
    // Allow explicit null to clear fields
    if (v !== undefined) payload[k] = v === '' ? null : v;
  });

  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[memberService.updateMember]', error.message);
    throw new Error('Could not update member. Please try again.');
  }

  return data as Member;
}

// ─── Delete member ────────────────────────────────────────────────────────────

export async function deleteMember(id: string): Promise<void> {
  // Delete photo from storage first (best-effort)
  try {
    const member = await getMember(id);
    if (member?.profile_photo_url) {
      const path = extractStoragePath(member.profile_photo_url);
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
  } catch {
    // Non-fatal — continue with member deletion
  }

  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) {
    console.error('[memberService.deleteMember]', error.message);
    throw new Error('Could not delete member. Please try again.');
  }
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

export interface PhotoUploadResult {
  url: string;
  path: string;
}

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export async function uploadMemberPhoto(
  file: File,
  memberId: string
): Promise<PhotoUploadResult> {
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `members/${memberId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error('[memberService.uploadMemberPhoto]', uploadError.message);
    throw new Error('Could not upload photo. Please try again.');
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractStoragePath(publicUrl: string): string | null {
  // Extract the path after /storage/v1/object/public/member-photos/
  const match = publicUrl.match(/member-photos\/(.+)$/);
  return match ? match[1] : null;
}

// Label helpers (used in UI)

export const GENDER_LABELS: Record<string, string> = {
  male:             'Male',
  female:           'Female',
  other:            'Other',
  prefer_not_to_say:'Prefer not to say',
};

export const FITNESS_GOAL_LABELS: Record<string, string> = {
  weight_loss:     'Weight Loss',
  muscle_gain:     'Muscle Gain',
  general_fitness: 'General Fitness',
  strength:        'Strength',
  endurance:       'Endurance',
};

export const STATUS_LABELS: Record<string, string> = {
  active:    'Active',
  inactive:  'Inactive',
  suspended: 'Suspended',
};
