import { PropertyInputs, REGIONS } from '@/lib/calculator';

interface Props {
  inputs: PropertyInputs;
  onChange: (inputs: PropertyInputs) => void;
}

function formatWithCommas(n: number): string {
  return n.toLocaleString('he-IL');
}

function parseFormattedNumber(s: string): number {
  return Number(s.replace(/[^0-9.-]/g, '')) || 0;
}

function NumericField({ label, value, onChange, prefix, suffix, hint, large }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  large?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={formatWithCommas(value)}
          onChange={e => onChange(parseFormattedNumber(e.target.value))}
          className={`w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground ${large ? 'text-base sm:text-lg font-bold' : 'text-sm'} py-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${prefix ? 'pl-7 sm:pl-8' : 'pl-3'} ${suffix ? 'pr-7 sm:pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  );
}

function SummaryCard({ label, value, sub }: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 sm:p-4 text-center">
      <div className="text-[10px] sm:text-[11px] text-muted-foreground font-heading mb-1">{label}</div>
      <div className="text-lg sm:text-xl font-heading font-bold text-foreground tracking-tight">{value}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function FinancingBar({ equityPercent, financingPercent }: {
  equityPercent: number;
  financingPercent: number;
}) {
  const eq = Math.max(0, Math.min(100, equityPercent));
  const fin = 100 - eq;

  return (
    <div>
      {/* Labels — RTL: equity on right, mortgage on left */}
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-left">
          <span className="text-[11px] sm:text-xs text-muted-foreground font-heading">משכנתא</span>
          <span className="text-sm sm:text-base font-heading font-bold text-primary mr-1.5">{fin}%</span>
        </div>
        <div className="text-right">
          <span className="text-sm sm:text-base font-heading font-bold text-safe ml-1.5">{eq}%</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-heading">הון עצמי</span>
        </div>
      </div>

      {/* Bar — RTL: equity right, mortgage left */}
      <div className="flex h-4 sm:h-5 gap-1 rounded-full overflow-hidden">
        <div
          className="bg-primary rounded-s-full transition-all duration-500 ease-out"
          style={{ width: `${fin}%` }}
        />
        <div
          className="bg-safe rounded-e-full transition-all duration-500 ease-out"
          style={{ width: `${eq}%` }}
        />
      </div>
    </div>
  );
}

export function PropertyForm({ inputs, onChange }: Props) {
  const update = (key: keyof PropertyInputs, value: number | string | boolean) => {
    const newInputs = { ...inputs, [key]: value };
    if (key === 'financingPercent') {
      newInputs.downPayment = Math.round(newInputs.price * (1 - (value as number) / 100));
    }
    if (key === 'downPayment') {
      newInputs.financingPercent = Math.round(((newInputs.price - (value as number)) / newInputs.price) * 100);
    }
    onChange(newInputs);
  };

  const equityPercent = inputs.price > 0 ? Math.round((inputs.downPayment / inputs.price) * 100) : 0;
  const loanAmount = inputs.price - inputs.downPayment;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-3 sm:mb-4">
        פרטי הנכס
      </h2>

      {/* Top summary row — 3 cards */}
      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <SummaryCard label="מחיר הנכס" value={`₪${formatWithCommas(inputs.price)}`} />
        <SummaryCard label="הון עצמי" value={`₪${formatWithCommas(inputs.downPayment)}`} />
        <SummaryCard
          label="אחוז מימון"
          value={`${inputs.financingPercent}%`}
          sub={`₪${formatWithCommas(loanAmount)}`}
        />
      </div>

      {/* Financing bar */}
      <div className="mb-4 sm:mb-5">
        <FinancingBar equityPercent={equityPercent} financingPercent={inputs.financingPercent} />
      </div>

      <div className="space-y-3">
        <NumericField label="מחיר הנכס" value={inputs.price} onChange={v => update('price', v)} prefix="₪" large />
        
        <div>
          <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">אזור</label>
          <select
            value={inputs.region}
            onChange={e => update('region', e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-3 sm:py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">סוג נכס</label>
          <div className="flex gap-2">
            {(['investment', 'primary'] as const).map(type => (
              <button
                key={type}
                onClick={() => update('propertyType', type)}
                className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-heading font-medium transition-all active:scale-[0.97] ${
                  inputs.propertyType === type
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40'
                }`}
              >
                {type === 'investment' ? 'השקעה' : 'מגורים'}
              </button>
            ))}
          </div>
        </div>

        {inputs.propertyType === 'investment' && (
          <NumericField label="שכר דירה צפוי (חודשי)" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} prefix="₪" />
        )}

        <div className="flex items-center gap-3">
          <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading">דירה ראשונה?</label>
          <button
            onClick={() => update('isFirstApartment', !inputs.isFirstApartment)}
            className={`px-4 py-2 sm:py-1.5 rounded-full text-xs font-heading font-medium transition-all active:scale-95 ${
              inputs.isFirstApartment
                ? 'bg-safe/15 text-safe border border-safe/30'
                : 'bg-secondary/50 text-secondary-foreground border border-border/40'
            }`}
          >
            {inputs.isFirstApartment ? 'כן' : 'לא'}
          </button>
        </div>
      </div>

      <h2 className="font-heading font-bold text-foreground text-sm mt-5 sm:mt-6 mb-3 sm:mb-4">
        נתונים פיננסיים
      </h2>

      <div className="space-y-3">
        <NumericField label="הון עצמי" value={inputs.downPayment} onChange={v => update('downPayment', v)} prefix="₪" large />
        <NumericField
          label="אחוז מימון"
          value={inputs.financingPercent}
          onChange={v => update('financingPercent', v)}
          suffix="%"
          hint={inputs.financingPercent > 75 ? '⚠️ מעל 75% — הבנק כנראה לא יאשר' : undefined}
        />

        {/* Borrower structure */}
        <div className="border border-border/40 rounded-xl p-3 sm:p-4 bg-secondary/20">
          <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-2">מבנה לווים</label>
          <div className="flex gap-2 mb-3">
            {([false, true] as const).map(dual => (
              <button
                key={String(dual)}
                onClick={() => update('dualBorrower', dual)}
                className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-heading font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${
                  inputs.dualBorrower === dual
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40'
                }`}
              >
                <span className="text-base">{dual ? '👥' : '👤'}</span>
                {dual ? 'שני לווים' : 'לווה יחיד'}
              </button>
            ))}
          </div>

          <NumericField label="הכנסה חודשית נטו (לווה ראשי)" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} prefix="₪" large />

          {inputs.dualBorrower && (
            <div className="mt-3">
              <NumericField
                label="הכנסה חודשית נטו (לווה נוסף)"
                value={inputs.secondBorrowerIncome}
                onChange={v => update('secondBorrowerIncome', v)}
                prefix="₪"
                large
              />
              {inputs.secondBorrowerIncome > 0 && (
                <div className="mt-2 rounded-lg bg-safe/8 border border-safe/20 px-3 py-2 text-[11px] sm:text-xs text-safe font-heading">
                  סה״כ הכנסה משותפת: ₪{formatWithCommas(inputs.monthlyIncome + inputs.secondBorrowerIncome)}
                </div>
              )}
            </div>
          )}
        </div>

        <NumericField
          label="כרית ביטחון אחרי הרכישה"
          value={inputs.cashBuffer}
          onChange={v => update('cashBuffer', v)}
          prefix="₪"
          hint="כמה כסף נשאר לך אחרי כל העלויות"
        />

        <div className="border-t border-border/30 pt-3 mt-3">
          <div className="flex items-center gap-3 mb-2">
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading">עזרה מההורים?</label>
            <button
              onClick={() => update('parentHelp', !inputs.parentHelp)}
              className={`px-4 py-2 sm:py-1.5 rounded-full text-xs font-heading font-medium transition-all active:scale-95 ${
                inputs.parentHelp
                  ? 'bg-warning/15 text-warning border border-warning/30'
                  : 'bg-secondary/50 text-secondary-foreground border border-border/40'
              }`}
            >
              {inputs.parentHelp ? 'כן' : 'לא'}
            </button>
          </div>
          {inputs.parentHelp && (
            <NumericField label="סכום העזרה" value={inputs.parentHelpAmount} onChange={v => update('parentHelpAmount', v)} prefix="₪" />
          )}
        </div>
      </div>
    </div>
  );
}
