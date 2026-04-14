import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
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

  // Apply saved theme on mount
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
      aria-label={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
    >
      {isDark ? (
        <Sun size={18} className="text-warning" />
      ) : (
        <Moon size={18} className="text-primary" />
      )}
    </button>
  );
}
