import React, { useState, useEffect, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import type {
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  MemberStatus,
  MemberGender,
  FitnessGoal,
} from '../../types';
import {
  createMember,
  updateMember,
  uploadMemberPhoto,
  validatePhotoFile,
} from '../../services/memberService';

interface MemberFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (member: Member) => void;
  member?: Member | null; // null = add mode, Member = edit mode
}

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: MemberGender | '';
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  height: string;
  weight: string;
  fitness_goal: FitnessGoal | '';
  medical_notes: string;
  status: MemberStatus;
}

const EMPTY: FormState = {
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  height: '',
  weight: '',
  fitness_goal: '',
  medical_notes: '',
  status: 'active',
};

function fromMember(m: Member): FormState {
  return {
    full_name: m.full_name,
    email: m.email ?? '',
    phone: m.phone ?? '',
    date_of_birth: m.date_of_birth ?? '',
    gender: (m.gender as MemberGender) ?? '',
    address: m.address ?? '',
    emergency_contact_name: m.emergency_contact_name ?? '',
    emergency_contact_phone: m.emergency_contact_phone ?? '',
    height: m.height?.toString() ?? '',
    weight: m.weight?.toString() ?? '',
    fitness_goal: (m.fitness_goal as FitnessGoal) ?? '',
    medical_notes: m.medical_notes ?? '',
    status: m.status,
  };
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-px flex-1 bg-den-border" />
        <p className="text-xs font-semibold text-den-muted uppercase tracking-widest shrink-0">
          {title}
        </p>
        <div className="h-px flex-1 bg-den-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function FullWidth({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

export function MemberForm({ open, onClose, onSuccess, member }: MemberFormProps) {
  const isEdit = !!member;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setForm(member ? fromMember(member) : EMPTY);
      setErrors({});
      setPhotoFile(null);
      setPhotoPreview(member?.profile_photo_url ?? null);
      setPhotoError('');
      setFormError('');
    }
  }, [open, member]);

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePhotoFile(file);
    if (err) { setPhotoError(err); return; }
    setPhotoError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};

    if (!form.full_name.trim()) e.full_name = 'Full name is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (form.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone)) {
      e.phone = 'Please enter a valid phone number.';
    }
    if (form.emergency_contact_phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.emergency_contact_phone)) {
      e.emergency_contact_phone = 'Please enter a valid phone number.';
    }
    if (form.date_of_birth && new Date(form.date_of_birth) > new Date()) {
      e.date_of_birth = 'Date of birth cannot be in the future.';
    }
    if (form.height && (isNaN(Number(form.height)) || Number(form.height) <= 0)) {
      e.height = 'Height must be a positive number.';
    }
    if (form.weight && (isNaN(Number(form.weight)) || Number(form.weight) <= 0)) {
      e.weight = 'Weight must be a positive number.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSaving(true);
    setFormError('');

    try {
      let photoUrl: string | undefined;

      // Upload photo if selected
      if (photoFile) {
        const tempId = member?.id ?? `temp-${Date.now()}`;
        const result = await uploadMemberPhoto(photoFile, tempId);
        photoUrl = result.url;
      } else if (member && !photoPreview) {
        // Photo was cleared
        photoUrl = '';
      }

      if (isEdit && member) {
        const input: UpdateMemberInput = {
          id: member.id,
          full_name: form.full_name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          date_of_birth: form.date_of_birth || undefined,
          gender: (form.gender || undefined) as MemberGender | undefined,
          address: form.address.trim() || undefined,
          emergency_contact_name: form.emergency_contact_name.trim() || undefined,
          emergency_contact_phone: form.emergency_contact_phone.trim() || undefined,
          height: form.height ? Number(form.height) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
          fitness_goal: (form.fitness_goal || undefined) as FitnessGoal | undefined,
          medical_notes: form.medical_notes.trim() || undefined,
          status: form.status,
          ...(photoUrl !== undefined ? { profile_photo_url: photoUrl } : {}),
        };
        const updated = await updateMember(input);
        onSuccess(updated);
      } else {
        const input: CreateMemberInput = {
          full_name: form.full_name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          date_of_birth: form.date_of_birth || undefined,
          gender: (form.gender || undefined) as MemberGender | undefined,
          address: form.address.trim() || undefined,
          emergency_contact_name: form.emergency_contact_name.trim() || undefined,
          emergency_contact_phone: form.emergency_contact_phone.trim() || undefined,
          height: form.height ? Number(form.height) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
          fitness_goal: (form.fitness_goal || undefined) as FitnessGoal | undefined,
          medical_notes: form.medical_notes.trim() || undefined,
          profile_photo_url: photoUrl,
          status: 'active',
        };
        const created = await createMember(input);
        onSuccess(created);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex items-center gap-2 justify-end">
      {formError && (
        <p className="text-sm text-red-400 flex-1">{formError}</p>
      )}
      <Button variant="outline" size="md" onClick={onClose} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" size="md" loading={saving} onClick={handleSubmit}>
        {isEdit ? 'Save Changes' : 'Create Member'}
      </Button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Member' : 'Add New Member'}
      description={isEdit ? `Editing ${member?.full_name}` : 'Fill in the details below to register a new member.'}
      footer={footer}
      width="lg"
    >
      {/* Photo upload */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-den-border">
        <div className="relative shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-den-border"
            />
          ) : (
            <Avatar name={form.full_name || 'Member'} size="xl" />
          )}
          {photoPreview && (
            <button
              onClick={clearPhoto}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X size={10} className="text-white" />
            </button>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoChange}
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center gap-2 h-8 px-3 text-sm text-den-muted border border-den-border rounded-xl hover:border-den-borderHover hover:text-den-text transition-colors cursor-pointer"
          >
            <Camera size={13} /> Upload photo
          </label>
          <p className="text-xs text-den-muted mt-1.5">JPEG, PNG, WebP or GIF · Max 5 MB</p>
          {photoError && <p className="text-xs text-red-400 mt-1">{photoError}</p>}
        </div>
      </div>

      {/* Section 1: Personal */}
      <FormSection title="Personal Information">
        <FullWidth>
          <Input
            label="Full Name *"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            error={errors.full_name}
            placeholder="e.g. Arjun Sharma"
            autoFocus
          />
        </FullWidth>
        <Input
          label="Date of Birth"
          type="date"
          value={form.date_of_birth}
          onChange={e => set('date_of_birth', e.target.value)}
          error={errors.date_of_birth}
          max={new Date().toISOString().split('T')[0]}
        />
        <Select
          label="Gender"
          value={form.gender}
          onChange={v => set('gender', v)}
          options={[
            { value: '', label: 'Select gender' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ]}
        />
      </FormSection>

      {/* Section 2: Contact */}
      <FormSection title="Contact Information">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          error={errors.email}
          placeholder="arjun@example.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          error={errors.phone}
          placeholder="+91 98765 43210"
        />
        <FullWidth>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-den-text">Address</label>
            <textarea
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Street, City, State, PIN"
              rows={2}
              className="w-full bg-den-surface border border-den-border rounded-xl text-sm text-den-text placeholder:text-den-muted px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60 hover:border-den-borderHover transition-all"
            />
          </div>
        </FullWidth>
      </FormSection>

      {/* Section 3: Emergency Contact */}
      <FormSection title="Emergency Contact">
        <Input
          label="Contact Name"
          value={form.emergency_contact_name}
          onChange={e => set('emergency_contact_name', e.target.value)}
          placeholder="e.g. Priya Sharma"
        />
        <Input
          label="Contact Phone"
          type="tel"
          value={form.emergency_contact_phone}
          onChange={e => set('emergency_contact_phone', e.target.value)}
          error={errors.emergency_contact_phone}
          placeholder="+91 98765 43210"
        />
      </FormSection>

      {/* Section 4: Fitness Info */}
      <FormSection title="Fitness Information">
        <Input
          label="Height (cm)"
          type="number"
          value={form.height}
          onChange={e => set('height', e.target.value)}
          error={errors.height}
          placeholder="175"
          min="0"
        />
        <Input
          label="Weight (kg)"
          type="number"
          value={form.weight}
          onChange={e => set('weight', e.target.value)}
          error={errors.weight}
          placeholder="70"
          min="0"
        />
        <Select
          label="Fitness Goal"
          value={form.fitness_goal}
          onChange={v => set('fitness_goal', v)}
          options={[
            { value: '', label: 'Select goal' },
            { value: 'weight_loss', label: 'Weight Loss' },
            { value: 'muscle_gain', label: 'Muscle Gain' },
            { value: 'general_fitness', label: 'General Fitness' },
            { value: 'strength', label: 'Strength' },
            { value: 'endurance', label: 'Endurance' },
          ]}
        />
        {isEdit && (
          <Select
            label="Status"
            value={form.status}
            onChange={v => set('status', v)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
        )}
        <FullWidth>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-den-text">Medical Notes</label>
            <textarea
              value={form.medical_notes}
              onChange={e => set('medical_notes', e.target.value)}
              placeholder="Any medical conditions, allergies, or notes relevant to training…"
              rows={3}
              className="w-full bg-den-surface border border-den-border rounded-xl text-sm text-den-text placeholder:text-den-muted px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-den-accent/40 focus:border-den-accent/60 hover:border-den-borderHover transition-all"
            />
          </div>
        </FullWidth>
      </FormSection>

      {/* Section 5: Membership (future) */}
      <div className="rounded-xl border border-den-border/50 bg-den-surface/40 p-4 text-center">
        <p className="text-xs font-medium text-den-muted">
          Membership &amp; Trainer assignment will be available once those modules are set up.
        </p>
      </div>
    </Drawer>
  );
}
