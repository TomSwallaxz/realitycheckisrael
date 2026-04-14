import { MortgageStructure, Strategy, STRATEGY_INFO } from '@/lib/calculator';

interface Props {
  mortgage: MortgageStructure;
  strategy: Strategy;
  onMortgageChange: (m: MortgageStructure) => void;
  onStrategyChange: (s: Strategy) => void;
}

export function MortgageConfig({ mortgage, strategy, onMortgageChange, onStrategyChange }: Props) {
  const update = (key: keyof MortgageStructure, value: number) => {
    onMortgageChange({ ...mortgage, [key]: value });
  };

  const strategies: Strategy[] = ['conservative', 'balanced', 'aggressive'];

  const tracks = [
    { label: 'פריים', key: 'primePercent' as const, rateKey: 'primeRate' as const, color: 'bg-primary', desc: 'זול אבל מסוכן' },
    { label: 'קבועה', key: 'fixedPercent' as const, rateKey: 'fixedRate' as const, color: 'bg-safe', desc: 'יקר אבל יציב' },
    { label: 'משתנה', key: 'variablePercent' as const, rateKey: 'variableRate' as const, color: 'bg-warning', desc: 'לא צפוי' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading font-bold text-foreground text-sm mb-4">
        מבנה המשכנתא
      </h2>

      <div className="flex gap-2 mb-5">
        {strategies.map(s => (
          <button
            key={s}
            onClick={() => onStrategyChange(s)}
            className={`flex-1 py-2.5 px-2 rounded-md text-xs font-heading font-medium transition-colors ${
              strategy === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <div className="font-bold">{STRATEGY_INFO[s].label}</div>
            <div className="text-[10px] opacity-70 mt-0.5">{STRATEGY_INFO[s].desc}</div>
          </button>
        ))}
      </div>

      {/* Track visual */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden" style={{ direction: 'ltr' }}>
          {tracks.map(t => (
            <div
              key={t.key}
              className={`${t.color} transition-all`}
              style={{ width: `${mortgage[t.key]}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {tracks.map(t => (
            <div key={t.key} className="text-center">
              <span className="text-xs text-foreground font-heading font-medium">{t.label} {mortgage[t.key]}%</span>
              <div className="text-[10px] text-muted-foreground">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate inputs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {tracks.map(t => (
          <div key={t.rateKey}>
            <label className="block text-xs text-muted-foreground mb-1">ריבית {t.label}</label>
            <input
              type="number"
              step="0.1"
              value={mortgage[t.rateKey]}
              onChange={e => update(t.rateKey, Number(e.target.value))}
              className="w-full rounded-md border border-border bg-secondary text-foreground text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">תקופת ההלוואה (שנים)</label>
        <input
          type="number"
          value={mortgage.termYears}
          onChange={e => update('termYears', Number(e.target.value))}
          className="w-full rounded-md border border-border bg-secondary text-foreground text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
