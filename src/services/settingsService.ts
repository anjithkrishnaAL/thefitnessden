import { supabase } from '../lib/supabase';

export interface GymSettings { id: string; singleton_key: string; gym_name: string; tagline: string | null; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null; country: string | null; postal_code: string | null; website: string | null; logo_url: string | null; logo_path?: string | null; logo_display_url?: string | null; currency: string; timezone: string; default_membership_duration: number; default_payment_method: string; default_member_status: string; created_at: string; updated_at: string; }
export interface NotificationPreferences { id?: string; user_id: string; membership_expiry: boolean; payment_notifications: boolean; new_member_notifications: boolean; workout_plan_notifications: boolean; progress_notifications: boolean; reminder_notifications: boolean; }
export const defaultGymSettings: Omit<GymSettings, 'id'|'created_at'|'updated_at'> = { singleton_key: 'default', gym_name: 'TheFitnessDen', tagline: 'Train. Track. Transform.', email: null, phone: null, address: null, city: null, state: null, country: null, postal_code: null, website: null, logo_url: null, currency: 'INR', timezone: 'Asia/Kolkata', default_membership_duration: 1, default_payment_method: 'cash', default_member_status: 'active' };

function describeError(error: { message: string; code?: string; details?: string; hint?: string }) { return `${error.message}${error.code ? ` [${error.code}]` : ''}${error.details ? ` Details: ${error.details}` : ''}${error.hint ? ` Hint: ${error.hint}` : ''}`; }
const settingsPayload = (input: Partial<GymSettings>) => ({ singleton_key: 'default', gym_name: input.gym_name ?? defaultGymSettings.gym_name, tagline: input.tagline ?? defaultGymSettings.tagline, email: input.email ?? null, phone: input.phone ?? null, address: input.address ?? null, city: input.city ?? null, state: input.state ?? null, country: input.country ?? null, postal_code: input.postal_code ?? null, website: input.website ?? null, logo_url: input.logo_path ?? input.logo_url ?? null, currency: input.currency ?? defaultGymSettings.currency, timezone: input.timezone ?? defaultGymSettings.timezone, default_membership_duration: input.default_membership_duration ?? defaultGymSettings.default_membership_duration, default_payment_method: input.default_payment_method ?? defaultGymSettings.default_payment_method, default_member_status: input.default_member_status ?? defaultGymSettings.default_member_status });

async function addLogoDisplayUrl(row: GymSettings) { if (!row.logo_url) return { ...row, logo_path: null, logo_display_url: null }; const path = storagePathFromLogoUrl(row.logo_url); if (!path) return { ...row, logo_path: row.logo_url, logo_display_url: row.logo_url }; const { data, error } = await supabase.storage.from('gym-assets').createSignedUrl(path, 60 * 60); if (error || !data?.signedUrl) { console.error('[settingsService.logo]', error); return { ...row, logo_path: path, logo_display_url: null }; } return { ...row, logo_url: data.signedUrl, logo_path: path, logo_display_url: data.signedUrl }; }
export async function getGymSettings(): Promise<GymSettings> { const { data, error } = await supabase.from('gym_settings').select('*').eq('singleton_key', 'default').limit(1).maybeSingle(); if (error) { console.error('[settingsService.getGymSettings]', { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw new Error(describeError(error)); } const settings = data ? await addLogoDisplayUrl(data as GymSettings) : defaultGymSettings as GymSettings; if (typeof window !== 'undefined') localStorage.setItem('tfd-currency', settings.currency); return settings; }
export async function saveGymSettings(input: Partial<GymSettings>) {
  const payload = settingsPayload(input);
  console.log('Saving gym settings payload:', JSON.stringify(payload, null, 2));
  const existing = await supabase.from('gym_settings').select('id').eq('singleton_key', 'default').limit(1).maybeSingle();
  if (existing.error) { console.error('Gym settings lookup failed', { message: existing.error.message, code: existing.error.code, details: existing.error.details, hint: existing.error.hint }); throw new Error(describeError(existing.error)); }
  const result = existing.data?.id
    ? await supabase.from('gym_settings').update(payload).eq('id', existing.data.id).select().single()
    : await supabase.from('gym_settings').insert(payload).select().single();
  console.log('Gym settings save result:', JSON.stringify({ data: result.data, error: result.error ? { message: result.error.message, code: result.error.code, details: result.error.details, hint: result.error.hint } : null }, null, 2));
  if (result.error) throw new Error(describeError(result.error));
  if (!result.data) throw new Error('Gym settings save returned no row. Check the authenticated RLS UPDATE/INSERT policies.');
  return addLogoDisplayUrl(result.data as GymSettings);
}
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> { const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle(); if (error) throw new Error(error.message); if (data) return data as NotificationPreferences; const { data: created, error: createError } = await supabase.from('notification_preferences').insert({ user_id: userId }).select().single(); if (createError) throw new Error(createError.message); return created as NotificationPreferences; }
export async function saveNotificationPreferences(userId: string, input: Partial<NotificationPreferences>) { const { data, error } = await supabase.from('notification_preferences').upsert({ ...input, user_id: userId }, { onConflict: 'user_id' }).select().single(); if (error) throw new Error(error.message); return data as NotificationPreferences; }
const ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

export function validateGymLogoFile(file: File) {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) return 'Use a PNG, JPG, JPEG, or WEBP image.';
  if (file.size > MAX_LOGO_SIZE) return 'Logo must be 5 MB or smaller.';
  return null;
}

export async function uploadGymLogo(file: File) {
  const validationError = validateGymLogoFile(file);
  if (validationError) throw new Error(validationError);
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `branding/logo-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('gym-assets').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Logo upload failed: ${error.message}`);
  const { data, error: urlError } = await supabase.storage.from('gym-assets').createSignedUrl(path, 60 * 60 * 24 * 365);
  if (urlError || !data?.signedUrl) throw new Error(urlError?.message ?? 'Could not create a secure logo URL.');
  return path;
}

function storagePathFromLogoUrl(logoUrl: string) {
  try {
    const url = new URL(logoUrl);
    const marker = '/storage/v1/object/sign/gym-assets/';
    const publicMarker = '/storage/v1/object/public/gym-assets/';
    const markerIndex = url.pathname.indexOf(marker);
    const publicIndex = url.pathname.indexOf(publicMarker);
    const start = markerIndex >= 0 ? markerIndex + marker.length : publicIndex >= 0 ? publicIndex + publicMarker.length : -1;
    return start >= 0 ? decodeURIComponent(url.pathname.slice(start)) : null;
  } catch { return logoUrl.startsWith('branding/') ? logoUrl : null; }
}

export async function removeGymLogo(logoUrl: string | null) {
  const path = logoUrl ? storagePathFromLogoUrl(logoUrl) : null;
  if (path) {
    const { error } = await supabase.storage.from('gym-assets').remove([path]);
    if (error) throw new Error(`Logo removal failed: ${error.message}`);
  }
  return saveGymSettings({ logo_url: null });
}
export function formatConfiguredCurrency(amount: number, currency = 'INR') { return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount); }

export async function exportAllData() { const tables = ['members','trainers','memberships','payments','attendance','workout_plans','progress_records','expenses','notifications','reminders']; const files: Record<string, unknown[]> = {}; await Promise.all(tables.map(async table => { const { data, error } = await supabase.from(table).select('*'); if (error) throw new Error(`${table}: ${error.message}`); files[table] = data ?? []; })); Object.entries(files).forEach(([name, data]) => { const keys = Array.from(new Set(data.flatMap(row => Object.keys(row as Record<string, unknown>)))); const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`; const csv = [keys, ...data.map(row => keys.map(key => quote((row as Record<string, unknown>)[key])))].map(row => row.join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `thefitnessden-${name}.csv`; link.click(); URL.revokeObjectURL(link.href); }); }
