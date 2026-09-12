import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getGymSettings, type GymSettings } from '../services/settingsService';
import { useAuth } from './AuthContext';

interface GymSettingsContextValue { settings: GymSettings | null; loading: boolean; refreshSettings: () => Promise<void>; }
const GymSettingsContext = createContext<GymSettingsContextValue | null>(null);
export function GymSettingsProvider({ children }: { children: React.ReactNode }) { const { user, loading: authLoading } = useAuth(); const [settings, setSettings] = useState<GymSettings | null>(null); const [loading, setLoading] = useState(true); const refreshSettings = useCallback(async () => { if (!user) { setSettings(null); setLoading(false); return; } setLoading(true); try { setSettings(await getGymSettings()); } catch (error) { console.error('[GymSettingsProvider]', error); } finally { setLoading(false); } }, [user]); useEffect(() => { if (!authLoading) void refreshSettings(); }, [authLoading, refreshSettings]); return <GymSettingsContext.Provider value={{ settings, loading: loading || authLoading, refreshSettings }}>{children}</GymSettingsContext.Provider>; }
export function useGymSettings() { const context = useContext(GymSettingsContext); if (!context) throw new Error('useGymSettings must be used inside GymSettingsProvider'); return context; }
