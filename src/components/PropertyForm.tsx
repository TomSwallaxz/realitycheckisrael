import { useState, useEffect, useRef } from "react";
import { BorrowerMode, PropertyInputs, REGIONS } from "@/lib/calculator";
import { useI18n } from "@/lib/i18n";

interface Props {
  inputs: PropertyInputs;
  onChange: (inputs: PropertyInputs) => void;
}

function formatWithCommas(n: number): string {
  return n.toLocaleString("he-IL");
}

function parseFormattedNumber(s: string): number {
  return Number(s.replace(/[^0-9.-]/g, "")) || 0;
}

function NumericField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  large,
}: {
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
      <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={formatWithCommas(value)}
          onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
          className={`w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground ${large ? "text-base sm:text-lg font-bold" : "text-sm"} py-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${prefix ? "pl-7 sm:pl-8" : "pl-3"} ${suffix ? "pr-7 sm:pr-8" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  );
}

function SummaryItem({ label, value, sub, prominent }: { label: string; value: string; sub?: string; prominent?: boolean }) {
  return (
    <div className={`text-center ${prominent ? 'py-4 mb-2' : 'py-2'}`}>
      <div className={`text-muted-foreground font-heading ${prominent ? 'text-sm sm:text-base mb-1' : 'text-[10px] sm:text-[11px] mb-0.5'}`}>{label}</div>
      <div
        className={`font-heading font-bold text-foreground whitespace-nowrap leading-tight ${
          prominent ? 'text-[32px] sm:text-[44px] font-extrabold tracking-[-0.03em]' : 'text-sm sm:text-lg tracking-tight'
        }`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">{sub}</div>}
    </div>
  );
}

function FinancingBar({ equityPercent, mortgageLabel, equityLabel }: { equityPercent: number; mortgageLabel: string; equityLabel: string }) {
  const eq = Math.max(0, Math.min(100, equityPercent));
  const fin = 100 - eq;

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-left">
          <span className="text-[11px] sm:text-xs text-muted-foreground font-heading">{mortgageLabel}</span>
          <span className="text-sm sm:text-base font-heading font-bold text-primary mr-1.5">{fin}%</span>
        </div>
        <div className="text-right">
          <span className="text-sm sm:text-base font-heading font-bold text-safe ml-1.5">{eq}%</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-heading">{equityLabel}</span>
        </div>
      </div>
      <div className="flex h-4 sm:h-5 gap-1 rounded-full overflow-hidden">
        <div className="bg-primary rounded-s-full transition-all duration-500 ease-out" style={{ width: `${fin}%` }} />
        <div className="bg-safe rounded-e-full transition-all duration-500 ease-out" style={{ width: `${eq}%` }} />
      </div>
    </div>
  );
}

// Map Hebrew region names to translation keys
const REGION_KEYS: Record<string, string> = {
  'מרכז (תל אביב, גוש דן)': 'region_center',
  'ירושלים': 'region_jerusalem',
  'חיפה והצפון': 'region_haifa',
  'באר שבע והדרום': 'region_beer_sheva',
  'השרון': 'region_sharon',
  'שפלה': 'region_shfela',
  'אחר': 'region_other',
};

export function PropertyForm({ inputs, onChange }: Props) {
  const { t } = useI18n();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('onboarding_dismissed');
    }
    return true;
  });
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOnboarding && priceInputRef.current) {
      const timer = setTimeout(() => priceInputRef.current?.focus(), 600);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('onboarding_dismissed', '1');
  };

  const update = (key: keyof PropertyInputs, value: number | string) => {
    const newInputs = { ...inputs, [key]: value };
    if (key === "financingPercent") {
      newInputs.downPayment = Math.round(newInputs.price * (1 - (value as number) / 100));
    }
    if (key === "downPayment") {
      newInputs.financingPercent = Math.round(((newInputs.price - (value as number)) / newInputs.price) * 100);
    }
    onChange(newInputs);
  };

  const borrowerMode: BorrowerMode = inputs.borrowerMode;
  const isDualBorrower = borrowerMode === "dual";

  const setBorrowerMode = (mode: BorrowerMode) => {
    onChange({
      ...inputs,
      borrowerMode: mode,
      secondBorrowerIncome: mode === "single" ? 0 : inputs.secondBorrowerIncome,
    });
  };

  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const totalEquity = inputs.downPayment + parentCont;
  const equityPercent = inputs.price > 0 ? Math.round((totalEquity / inputs.price) * 100) : 0;
  const loanAmount = Math.max(0, inputs.price - totalEquity);

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="border-b border-border/30 mb-3 pb-1">
          <SummaryItem label={t('summary_price')} value={`₪${formatWithCommas(inputs.price)}`} prominent />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center py-2">
            <div className="text-muted-foreground font-heading text-[10px] sm:text-[11px] mb-0.5">
              {parentCont > 0 ? t('equity_available') : t('equity')}
            </div>
            <div className="font-heading font-bold text-foreground text-sm sm:text-lg tracking-tight whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ₪{formatWithCommas(totalEquity)}
            </div>
            {parentCont > 0 && (
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 space-y-0">
                <div>{t('personal')}: ₪{formatWithCommas(inputs.downPayment)}</div>
                <div>{t('parents')}: ₪{formatWithCommas(parentCont)}</div>
              </div>
            )}
          </div>
          <SummaryItem
            label={t('financing_percent')}
            value={`${inputs.financingPercent}%`}
            sub={`₪${formatWithCommas(loanAmount)}`}
          />
        </div>

        <FinancingBar equityPercent={equityPercent} mortgageLabel={t('mortgage_label')} equityLabel={t('financing_bar_equity')} />
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="space-y-3">
          {/* Price field with onboarding */}
          <div className="relative">
            {showOnboarding && (
              <div className="mb-3 animate-in fade-in-0 slide-in-from-top-2 duration-500">
                <div className="relative bg-primary/10 border border-primary/25 rounded-xl p-3 sm:p-3.5">
                  <p className="text-xs sm:text-sm text-foreground font-heading font-semibold leading-relaxed">
                    {t('onboarding_step1')}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    {t('onboarding_hint')}
                  </p>
                  <div className="absolute -bottom-2 right-6 w-4 h-4 bg-primary/10 border-b border-r border-primary/25 rotate-45" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">{t('property_price')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">₪</span>
                <input
                  ref={priceInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder={t('price_placeholder')}
                  value={formatWithCommas(inputs.price)}
                  onFocus={() => {}}
                  onInput={() => { if (showOnboarding) dismissOnboarding(); }}
                  onChange={(e) => update("price", parseFormattedNumber(e.target.value))}
                  className={`w-full rounded-xl border bg-secondary/50 text-foreground text-base sm:text-lg font-bold py-3 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all pl-7 sm:pl-8 pr-3 ${
                    showOnboarding
                      ? 'border-primary/50 shadow-[0_0_12px_hsl(var(--primary)/0.15)] ring-1 ring-primary/20'
                      : 'border-border/60'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">{t('region')}</label>
            <select
              value={inputs.region}
              onChange={(e) => update("region", e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-3 sm:py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {REGION_KEYS[r] ? t(REGION_KEYS[r] as any) : r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading mb-1.5">{t('property_type')}</label>
            <div className="flex gap-2">
              {(["investment", "primary"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ ...inputs, propertyType: type })}
                  className={`flex-1 py-3 sm:py-2.5 rounded-xl text-sm font-heading font-medium transition-all active:scale-[0.97] ${
                    inputs.propertyType === type
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40"
                  }`}
                >
                  {type === "investment" ? t('investment') : t('primary')}
                </button>
              ))}
            </div>
          </div>

          {inputs.propertyType === "investment" && (
            <NumericField
              label={t('monthly_rent')}
              value={inputs.monthlyRent}
              onChange={(v) => update("monthlyRent", v)}
              prefix="₪"
            />
          )}

          <div className="flex items-center gap-3">
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading">{t('first_apartment')}</label>
            <button
              type="button"
              onClick={() => onChange({ ...inputs, isFirstApartment: !inputs.isFirstApartment })}
              className={`px-4 py-2 sm:py-1.5 rounded-full text-xs font-heading font-medium transition-all active:scale-95 ${
                inputs.isFirstApartment
                  ? "bg-safe/15 text-safe border border-safe/30"
                  : "bg-secondary/50 text-secondary-foreground border border-border/40"
              }`}
            >
              {inputs.isFirstApartment ? t('yes') : t('no')}
            </button>
          </div>
        </div>

        <h2 className="font-heading font-bold text-foreground text-sm mt-5 sm:mt-6 mb-3 sm:mb-4">{t('financial_data')}</h2>

        <div className="space-y-3">
          <NumericField
            label={t('equity')}
            value={inputs.downPayment}
            onChange={(v) => update("downPayment", v)}
            prefix="₪"
            large
          />

          <div className="flex items-center gap-3 mt-2">
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading">{t('parent_help_q')}</label>
            <button
              type="button"
              onClick={() => onChange({ ...inputs, parentHelp: !inputs.parentHelp })}
              className={`px-4 py-2 sm:py-1.5 rounded-full text-xs font-heading font-medium transition-all active:scale-95 ${
                inputs.parentHelp
                  ? "bg-warning/15 text-warning border border-warning/30"
                  : "bg-secondary/50 text-secondary-foreground border border-border/40"
              }`}
            >
              {inputs.parentHelp ? t('yes') : t('no')}
            </button>
          </div>
          {inputs.parentHelp && (
            <NumericField
              label={t('parent_help_amount')}
              value={inputs.parentHelpAmount}
              onChange={(v) => update("parentHelpAmount", v)}
              prefix="₪"
            />
          )}

          <NumericField
            label={t('financing_percent')}
            value={inputs.financingPercent}
            onChange={(v) => update("financingPercent", v)}
            suffix="%"
            hint={inputs.financingPercent > 75 ? t('financing_warn') : undefined}
          />
          <div className="flex items-center justify-between gap-3">
            <label className="block text-[11px] sm:text-xs text-muted-foreground font-heading">{t('borrower_structure')}</label>
            <div className="flex gap-1.5 rounded-xl bg-secondary/30 p-1">
              <button
                type="button"
                onClick={() => setBorrowerMode("single")}
                aria-pressed={borrowerMode === "single"}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-heading font-medium transition-all active:scale-95 ${
                  borrowerMode === "single"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-secondary-foreground border border-transparent"
                }`}
              >
                {t('single_borrower')}
              </button>
              <button
                type="button"
                onClick={() => setBorrowerMode("dual")}
                aria-pressed={borrowerMode === "dual"}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-heading font-medium transition-all active:scale-95 ${
                  borrowerMode === "dual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-secondary-foreground border border-transparent"
                }`}
              >
                {t('dual_borrower')}
              </button>
            </div>
          </div>

          <NumericField
            label={isDualBorrower ? t('monthly_income_b1') : t('monthly_income')}
            value={inputs.monthlyIncome}
            onChange={(v) => update("monthlyIncome", v)}
            prefix="₪"
            large
          />
          {isDualBorrower && (
            <NumericField
              label={t('monthly_income_b2')}
              value={inputs.secondBorrowerIncome}
              onChange={(v) => update("secondBorrowerIncome", v)}
              prefix="₪"
              large
              hint={t('b2_hint')}
            />
          )}
          <NumericField
            label={t('fixed_expenses')}
            value={inputs.fixedMonthlyExpenses}
            onChange={(v) => update("fixedMonthlyExpenses", v)}
            prefix="₪"
            hint={t('expenses_hint')}
          />
          <NumericField
            label={t('cash_buffer')}
            value={inputs.cashBuffer}
            onChange={(v) => update("cashBuffer", v)}
            prefix="₪"
            hint={t('cash_buffer_hint')}
          />
        </div>
      </div>
    </div>
  );
}
