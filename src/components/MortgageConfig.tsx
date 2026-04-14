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
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-4">
        מבנה המשכנתא
      </h2>

      <div className="flex gap-2 mb-5">
        {strategies.map(s => (
          <button
            key={s}
            onClick={() => onStrategyChange(s)}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-heading font-medium transition-all ${
              strategy === s
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40'
            }`}
          >
            <div className="font-bold">{STRATEGY_INFO[s].label}</div>
            <div className="text-[10px] opacity-70 mt-0.5">{STRATEGY_INFO[s].desc}</div>
          </button>
        ))}
      </div>

      {/* Allocation pills – RTL: Prime on the right */}
      <div className="mb-5">
        <div className="flex gap-1.5" style={{ direction: 'rtl' }}>
          {tracks.map(t => (
            <div
              key={t.key}
              className={`${t.color} h-4 rounded-full shadow-sm transition-all duration-500 ease-out hover:brightness-110`}
              style={{ width: `${mortgage[t.key]}%` }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mt-3" style={{ direction: 'rtl' }}>
          {tracks.map(t => (
            <div
              key={t.key}
              className="text-center transition-all duration-500"
              style={{ width: `${mortgage[t.key]}%` }}
            >
              <span className="text-base font-heading font-bold text-foreground">{mortgage[t.key]}%</span>
              <div className="text-[11px] text-muted-foreground font-heading mt-0.5">{t.label}</div>
              <div className="text-[10px] text-muted-foreground/60">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {tracks.map(t => (
          <div key={t.rateKey}>
            <label className="block text-xs text-muted-foreground mb-1">ריבית {t.label}</label>
            <input
              type="number"
              step="0.1"
              value={mortgage[t.rateKey]}
              onChange={e => update(t.rateKey, Number(e.target.value))}
              className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
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
          className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>
    </div>
  );
}
