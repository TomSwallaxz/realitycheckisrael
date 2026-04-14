import { MortgageStructure, Strategy } from '@/lib/calculator';

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

  const strategies: { key: Strategy; label: string; desc: string }[] = [
    { key: 'conservative', label: 'Conservative', desc: 'More fixed, less risk' },
    { key: 'balanced', label: 'Balanced', desc: 'Default mix' },
    { key: 'aggressive', label: 'Aggressive', desc: 'More prime/variable' },
  ];

  const tracks = [
    { label: 'Prime', key: 'primePercent' as const, rateKey: 'primeRate' as const, color: 'bg-primary' },
    { label: 'Fixed', key: 'fixedPercent' as const, rateKey: 'fixedRate' as const, color: 'bg-safe' },
    { label: 'Variable', key: 'variablePercent' as const, rateKey: 'variableRate' as const, color: 'bg-warning' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
        Mortgage Structure
      </h2>

      {/* Strategy selector */}
      <div className="flex gap-2 mb-5">
        {strategies.map(s => (
          <button
            key={s.key}
            onClick={() => onStrategyChange(s.key)}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-heading font-medium transition-colors ${
              strategy === s.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <div>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Track bars */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden">
          {tracks.map(t => (
            <div
              key={t.key}
              className={`${t.color} transition-all`}
              style={{ width: `${mortgage[t.key]}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {tracks.map(t => (
            <span key={t.key} className="text-xs text-muted-foreground">
              {t.label} {mortgage[t.key]}%
            </span>
          ))}
        </div>
      </div>

      {/* Rate inputs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {tracks.map(t => (
          <div key={t.rateKey}>
            <label className="block text-xs text-muted-foreground mb-1">{t.label} Rate</label>
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

      {/* Term */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Loan Term (years)</label>
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
