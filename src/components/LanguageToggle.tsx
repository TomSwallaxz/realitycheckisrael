import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      className="px-2.5 py-1.5 rounded-full bg-card/60 backdrop-blur-md border border-border/40 hover:bg-card/80 active:scale-95 transition-all duration-200 shadow-sm text-xs font-heading font-bold text-foreground"
      aria-label={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
    >
      {lang === 'he' ? 'EN' : 'HE'}
    </button>
  );
}
