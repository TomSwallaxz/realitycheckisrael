import { PropertyInputs, REGIONS } from '@/lib/calculator';

interface Props {
  inputs: PropertyInputs;
  onChange: (inputs: PropertyInputs) => void;
}

function Field({ label, value, onChange, prefix, suffix, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground font-heading mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>}
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

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-4">
        פרטי הנכס
      </h2>

      <div className="space-y-3">
        <Field label="מחיר הנכס" value={inputs.price} onChange={v => update('price', v)} prefix="₪" />
        
        <div>
          <label className="block text-xs text-muted-foreground font-heading mb-1.5">אזור</label>
          <select
            value={inputs.region}
            onChange={e => update('region', e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground font-heading mb-1.5">סוג נכס</label>
          <div className="flex gap-2">
            {(['investment', 'primary'] as const).map(type => (
              <button
                key={type}
                onClick={() => update('propertyType', type)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-heading font-medium transition-all ${
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
          <Field label="שכר דירה צפוי (חודשי)" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} prefix="₪" />
        )}

        <div className="flex items-center gap-3">
          <label className="block text-xs text-muted-foreground font-heading">דירה ראשונה?</label>
          <button
            onClick={() => update('isFirstApartment', !inputs.isFirstApartment)}
            className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
              inputs.isFirstApartment
                ? 'bg-safe/15 text-safe border border-safe/30'
                : 'bg-secondary/50 text-secondary-foreground border border-border/40'
            }`}
          >
            {inputs.isFirstApartment ? 'כן' : 'לא'}
          </button>
        </div>
      </div>

      <h2 className="font-heading font-bold text-foreground text-sm mt-6 mb-4">
        נתונים פיננסיים
      </h2>

      <div className="space-y-3">
        <Field label="הון עצמי" value={inputs.downPayment} onChange={v => update('downPayment', v)} prefix="₪" />
        <Field
          label="אחוז מימון"
          value={inputs.financingPercent}
          onChange={v => update('financingPercent', v)}
          suffix="%"
          hint={inputs.financingPercent > 75 ? '⚠️ מעל 75% — הבנק כנראה לא יאשר' : undefined}
        />
        <Field label="הכנסה חודשית נטו" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} prefix="₪" />
        <Field
          label="כרית ביטחון אחרי הרכישה"
          value={inputs.cashBuffer}
          onChange={v => update('cashBuffer', v)}
          prefix="₪"
          hint="כמה כסף נשאר לך אחרי כל העלויות"
        />

        <div className="border-t border-border/30 pt-3 mt-3">
          <div className="flex items-center gap-3 mb-2">
            <label className="block text-xs text-muted-foreground font-heading">עזרה מההורים?</label>
            <button
              onClick={() => update('parentHelp', !inputs.parentHelp)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-medium transition-all ${
                inputs.parentHelp
                  ? 'bg-warning/15 text-warning border border-warning/30'
                  : 'bg-secondary/50 text-secondary-foreground border border-border/40'
              }`}
            >
              {inputs.parentHelp ? 'כן' : 'לא'}
            </button>
          </div>
          {inputs.parentHelp && (
            <Field label="סכום העזרה" value={inputs.parentHelpAmount} onChange={v => update('parentHelpAmount', v)} prefix="₪" />
          )}
        </div>
      </div>
    </div>
  );
}
