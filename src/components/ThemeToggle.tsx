import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function ThemeToggle() {
  const { t } = useI18n();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.remove('light');
      setIsDark(true);
    } else {
      document.documentElement.classList.add('light');
      setIsDark(false);
    }
  }, []);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      className="p-2 rounded-full bg-card/60 backdrop-blur-md border border-border/40 hover:bg-card/80 active:scale-95 transition-all duration-200 shadow-sm"
      aria-label={isDark ? t('switch_light') : t('switch_dark')}
    >
      {isDark ? (
        <Sun size={18} className="text-warning" />
      ) : (
        <Moon size={18} className="text-primary" />
      )}
    </button>
  );
}
