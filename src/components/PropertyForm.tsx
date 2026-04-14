import { PropertyInputs } from '@/lib/calculator';

interface Props {
  inputs: PropertyInputs;
  onChange: (inputs: PropertyInputs) => void;
}

function Field({ label, value, onChange, prefix, suffix }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1.5">
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
          className={`w-full rounded-md border border-border bg-secondary text-foreground text-sm py-2.5 focus:outline-none focus:ring-1 focus:ring-ring ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function PropertyForm({ inputs, onChange }: Props) {
  const update = (key: keyof PropertyInputs, value: number | string) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
        Property Details
      </h2>

      <div className="space-y-3">
        <Field label="Property Price" value={inputs.price} onChange={v => update('price', v)} prefix="₪" />
        <Field label="Expected Monthly Rent" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} prefix="₪" />

        <div>
          <label className="block text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1.5">
            Property Type
          </label>
          <div className="flex gap-2">
            {(['investment', 'primary'] as const).map(type => (
              <button
                key={type}
                onClick={() => update('propertyType', type)}
                className={`flex-1 py-2 rounded-md text-sm font-heading font-medium transition-colors ${
                  inputs.propertyType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {type === 'investment' ? 'Investment' : 'Primary Residence'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wider mt-6 mb-4">
        Financial Inputs
      </h2>

      <div className="space-y-3">
        <Field label="Down Payment (Equity)" value={inputs.downPayment} onChange={v => update('downPayment', v)} prefix="₪" />
        <Field label="Net Monthly Income" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} prefix="₪" />
        <Field label="Cash Buffer After Purchase" value={inputs.cashBuffer} onChange={v => update('cashBuffer', v)} prefix="₪" />
      </div>
    </div>
  );
}
