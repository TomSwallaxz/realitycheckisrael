import { useI18n } from '@/lib/i18n';

interface Props {
  motivations: string[];
  onChange: (m: string[]) => void;
}

export function PsychologySection({ motivations, onChange }: Props) {
  const { t } = useI18n();

  const MOTIVATIONS = [
    { id: 'family_pressure', label: t('mot_family'), emoji: '👨‍👩‍👧' },
    { id: 'fomo', label: t('mot_fomo'), emoji: '📈' },
    { id: 'stability', label: t('mot_stability'), emoji: '🏠' },
    { id: 'investment', label: t('mot_investment'), emoji: '💰' },
    { id: 'status', label: t('mot_status'), emoji: '👀' },
    { id: 'rent_waste', label: t('mot_rent_waste'), emoji: '🗑️' },
  ];

  const toggle = (id: string) => {
    if (motivations.includes(id)) {
      onChange(motivations.filter(m => m !== id));
    } else {
      onChange([...motivations, id]);
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-1">
        {t('why_buying')}
      </h2>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
        {t('why_buying_sub')}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {MOTIVATIONS.map(m => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={`py-2.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-heading font-medium text-right transition-all active:scale-[0.97] ${
              motivations.includes(m.id)
                ? 'bg-warning/12 text-warning border border-warning/25 shadow-sm'
                : 'bg-secondary/50 text-secondary-foreground border border-border/40 hover:bg-accent'
            }`}
          >
            <span className="ml-0.5 sm:ml-1">{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
