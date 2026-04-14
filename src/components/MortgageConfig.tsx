import { MortgageStructure, Strategy, STRATEGY_INFO, DEFAULT_RATES } from '@/lib/calculator';

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
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-3 sm:mb-4">
        מבנה המשכנתא
      </h2>

      {/* Strategy selector */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5">
        {strategies.map(s => (
          <button
            key={s}
            onClick={() => onStrategyChange(s)}
            className={`flex-1 py-2.5 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-heading font-medium transition-all active:scale-[0.97] ${
              strategy === s
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40'
            }`}
          >
            <div className="font-bold leading-tight">{STRATEGY_INFO[s].label}</div>
            <div className="text-[9px] sm:text-[10px] opacity-70 mt-0.5 leading-tight">{STRATEGY_INFO[s].desc}</div>
          </button>
        ))}
      </div>

      {/* Allocation pills — RTL, stacked labels on mobile for clarity */}
      <div className="mb-4 sm:mb-5">
        <div className="flex gap-1.5" style={{ direction: 'rtl' }}>
          {tracks.map(t => (
            <div
              key={t.key}
              className={`${t.color} h-3.5 sm:h-4 rounded-full shadow-sm transition-all duration-500 ease-out hover:brightness-110`}
              style={{ width: `${mortgage[t.key]}%` }}
            />
          ))}
        </div>

        {/* Labels — horizontal on all sizes, font scales */}
        <div className="flex gap-1.5 mt-2.5 sm:mt-3" style={{ direction: 'rtl' }}>
          {tracks.map(t => (
            <div
              key={t.key}
              className="text-center transition-all duration-500 min-w-0"
              style={{ width: `${mortgage[t.key]}%` }}
            >
              <span className="text-sm sm:text-base font-heading font-bold text-foreground">{mortgage[t.key]}%</span>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground font-heading mt-0.5 truncate">{t.label}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 truncate hidden xs:block">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate inputs — stack on very small screens */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        {tracks.map(t => {
          const defaultVal = DEFAULT_RATES[t.rateKey];
          const isDefault = mortgage[t.rateKey] === defaultVal;
          return (
            <div key={t.rateKey}>
              <label className="block text-[11px] sm:text-xs text-muted-foreground mb-1 truncate">ריבית {t.label}</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={mortgage[t.rateKey]}
                onChange={e => update(t.rateKey, Number(e.target.value))}
                className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2.5 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-1 leading-tight">
                {isDefault ? 'לדוגמה' : 'מותאם'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-secondary/30 border border-border/30 px-3 py-2 sm:py-2.5 mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
          ℹ️ הריביות המוצגות הן <span className="text-foreground/80 font-medium">להמחשה בלבד</span> ואינן מייצגות הצעה בנקאית.
        </p>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">תקופת ההלוואה (שנים)</label>
        <input
          type="number"
          inputMode="numeric"
          value={mortgage.termYears}
          onChange={e => update('termYears', Number(e.target.value))}
          className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2.5 sm:py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>
    </div>
  );
}
