/* Design philosophy: Diagnostic Terminal. Sound is an optional instrument cue: short, quiet, local, and subordinate to the investigation. */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SoundContextValue = { enabled: boolean; highSound: boolean; setEnabled: (enabled: boolean) => void; setHighSound: (highSound: boolean) => void; playClick: () => void };
const SoundContext = createContext<SoundContextValue | null>(null);
const ENABLED_KEY = 'codesight.sound.enabled';
const HIGH_KEY = 'codesight.sound.high';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(() => localStorage.getItem(ENABLED_KEY) !== 'false');
  const [highSound, setHighSoundState] = useState(() => localStorage.getItem(HIGH_KEY) === 'true');
  const contextRef = useRef<AudioContext | null>(null);

  const playClick = () => {
    if (!enabled || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    if (context.state === 'suspended') void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(highSound ? 690 : 540, now);
    oscillator.frequency.exponentialRampToValueAtTime(highSound ? 430 : 360, now + 0.055);
    gain.gain.setValueAtTime(highSound ? 0.035 : 0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (highSound ? 0.095 : 0.065));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + (highSound ? 0.1 : 0.07));
  };

  const setEnabled = (next: boolean) => { setEnabledState(next); localStorage.setItem(ENABLED_KEY, String(next)); };
  const setHighSound = (next: boolean) => { setHighSoundState(next); localStorage.setItem(HIGH_KEY, String(next)); };

  useEffect(() => {
    const handleIntent = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('button, a, select, [role="button"]')) return;
      playClick();
    };
    document.addEventListener('click', handleIntent, true);
    return () => document.removeEventListener('click', handleIntent, true);
  });

  const value = useMemo(() => ({ enabled, highSound, setEnabled, setHighSound, playClick }), [enabled, highSound]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used inside SoundProvider');
  return context;
}
