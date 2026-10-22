import { useState, useEffect } from 'react';

export interface Settings {
  live: boolean;
  token: string;
  userId: number;
  timer: string;
}

const defaultSettings: Settings = {
  live: false,
  token: localStorage.getItem('seatpulse_jwt') || '',
  userId: 8831,
  timer: '522',
};

let currentSettings = { ...defaultSettings };
const listeners = new Set<(settings: Settings) => void>();

export const saveSettings = (newSettings: Partial<Settings>) => {
  currentSettings = { ...currentSettings, ...newSettings };

  if (newSettings.token !== undefined) {
    localStorage.setItem('seatpulse_jwt', newSettings.token);
  }

  listeners.forEach((listener) => listener(currentSettings));
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(currentSettings);

  useEffect(() => {
    listeners.add(setSettings);
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
};