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
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading font-bold text-foreground text-sm mb-1">
        למה אתה קונה? 🤔
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        בחר את מה שמניע אותך — בלי לשקר לעצמך
      </p>

      <div className="grid grid-cols-2 gap-2">
        {MOTIVATIONS.map(m => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={`py-2.5 px-3 rounded-md text-xs font-heading font-medium text-right transition-colors ${
              motivations.includes(m.id)
                ? 'bg-warning/15 text-warning border border-warning/30'
                : 'bg-secondary text-secondary-foreground border border-transparent hover:bg-accent'
            }`}
          >
            <span className="ml-1">{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
