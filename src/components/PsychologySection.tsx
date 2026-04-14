interface Props {
  motivations: string[];
  onChange: (m: string[]) => void;
}

const MOTIVATIONS = [
  { id: 'family_pressure', label: 'לחץ מהמשפחה', emoji: '👨‍👩‍👧' },
  { id: 'fomo', label: 'פחד שהמחירים יעלו', emoji: '📈' },
  { id: 'stability', label: 'רצון ליציבות', emoji: '🏠' },
  { id: 'investment', label: 'הזדמנות השקעה', emoji: '💰' },
  { id: 'status', label: 'סטטוס חברתי', emoji: '👀' },
  { id: 'rent_waste', label: 'הרגשה ש״שכירות זה בזבוז״', emoji: '🗑️' },
];

export function PsychologySection({ motivations, onChange }: Props) {
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
        למה אתה קונה? 🤔
      </h2>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
        בחר את מה שמניע אותך — בלי לשקר לעצמך
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
