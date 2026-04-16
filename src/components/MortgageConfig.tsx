import { useState, useRef, useEffect } from 'react';
import { MortgageStructure, Strategy, DEFAULT_RATES, formatNIS } from '@/lib/calculator';
import { Info, ChevronDown, X, Sparkles } from 'lucide-react';
import { useI18n, TranslationKey } from '@/lib/i18n';

interface Props {
  mortgage: MortgageStructure;
  strategy: Strategy;
  loanAmount?: number;
  onMortgageChange: (m: MortgageStructure) => void;
  onStrategyChange: (s: Strategy) => void;
}

export function MortgageConfig({ mortgage, strategy, loanAmount = 0, onMortgageChange, onStrategyChange }: Props) {
  const { t } = useI18n();
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!openPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        const clickedTrigger = Object.values(triggerRefs.current).some(
          ref => ref && ref.contains(e.target as Node)
        );
        if (!clickedTrigger) setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPopover]);

  const update = (key: keyof MortgageStructure, value: number) => {
    onMortgageChange({ ...mortgage, [key]: value });
  };

  const strategies: { key: Strategy; label: TranslationKey; desc: TranslationKey }[] = [
    { key: 'conservative', label: 'strategy_conservative', desc: 'strategy_conservative_desc' },
    { key: 'balanced', label: 'strategy_balanced', desc: 'strategy_balanced_desc' },
    { key: 'aggressive', label: 'strategy_aggressive', desc: 'strategy_aggressive_desc' },
  ];

  const tracks = [
    { label: t('rate_prime'), key: 'primePercent' as const, rateKey: 'primeRate' as const, color: 'bg-primary', desc: t('rate_prime_desc'), tooltipKey: 'prime_tooltip_short' as const },
    { label: t('rate_fixed'), key: 'fixedPercent' as const, rateKey: 'fixedRate' as const, color: 'bg-safe', desc: t('rate_fixed_desc'), tooltipKey: 'fixed_tooltip_short' as const },
    { label: t('rate_variable'), key: 'variablePercent' as const, rateKey: 'variableRate' as const, color: 'bg-warning', desc: t('rate_variable_desc'), tooltipKey: 'variable_tooltip_short' as const },
  ];

  const explanationKeys: Record<string, { title: TranslationKey; items: { label: TranslationKey; text: TranslationKey }[] }> = {
    primeRate: {
      title: 'prime_title',
      items: [
        { label: 'what_is', text: 'prime_what' },
        { label: 'how_calculated', text: 'prime_how' },
        { label: 'impact_on_payment', text: 'prime_impact' },
        { label: 'advantages', text: 'prime_pros' },
        { label: 'disadvantages', text: 'prime_cons' },
      ],
    },
    fixedRate: {
      title: 'fixed_title',
      items: [
        { label: 'what_is', text: 'fixed_what' },
        { label: 'how_calculated', text: 'fixed_how' },
        { label: 'impact_on_payment', text: 'fixed_impact' },
        { label: 'advantages', text: 'fixed_pros' },
        { label: 'disadvantages', text: 'fixed_cons' },
      ],
    },
    variableRate: {
      title: 'variable_title',
      items: [
        { label: 'what_is', text: 'variable_what' },
        { label: 'how_calculated', text: 'variable_how' },
        { label: 'impact_on_payment', text: 'variable_impact' },
        { label: 'advantages', text: 'variable_pros' },
        { label: 'disadvantages', text: 'variable_cons' },
      ],
    },
  };

  const labelColors: Record<string, string> = {
    [t('what_is')]: 'text-primary',
    [t('how_calculated')]: 'text-primary',
    [t('impact_on_payment')]: 'text-warning',
    [t('advantages')]: 'text-safe',
    [t('disadvantages')]: 'text-danger',
  };

  const togglePopover = (key: string) => {
    setOpenPopover(prev => (prev === key ? null : key));
  };

  const getArrowPosition = () => {
    if (!openPopover) return '50%';
    const idx = tracks.findIndex(tr => tr.rateKey === openPopover);
    const positions = ['83%', '50%', '17%'];
    return positions[idx] || '50%';
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      <h2 className="font-heading font-bold text-foreground text-sm mb-3 sm:mb-4">
        {t('mortgage_built_title')}
      </h2>

      {/* Strategy selector */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5">
        {strategies.map(s => (
          <button
            key={s.key}
            onClick={() => onStrategyChange(s.key)}
            className={`flex-1 py-2.5 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-heading font-medium transition-all active:scale-[0.97] ${
              strategy === s.key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-accent border border-border/40'
            }`}
          >
            <div className="font-bold leading-tight">{t(s.label)}</div>
            <div className="text-[9px] sm:text-[10px] opacity-70 mt-0.5 leading-tight">{t(s.desc)}</div>
          </button>
        ))}
      </div>

      {/* Allocation pills */}
      <div className="mb-4 sm:mb-5">
        <div className="flex gap-1.5" style={{ direction: 'rtl' }}>
          {tracks.map(tr => (
            <div
              key={tr.key}
              className={`${tr.color} h-3.5 sm:h-4 rounded-full shadow-sm transition-all duration-500 ease-out hover:brightness-110`}
              style={{ width: `${mortgage[tr.key]}%` }}
            />
          ))}
        </div>

        <div className="flex gap-1.5 mt-2.5 sm:mt-3" style={{ direction: 'rtl' }}>
          {tracks.map(tr => (
            <div
              key={tr.key}
              className="text-center transition-all duration-500 min-w-0"
              style={{ width: `${mortgage[tr.key]}%` }}
            >
              <span className="text-sm sm:text-base font-heading font-bold text-foreground">{mortgage[tr.key]}%</span>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground font-heading mt-0.5 truncate">{tr.label}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 truncate hidden xs:block">{tr.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate inputs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-1">
        {tracks.map(tr => {
          const defaultVal = DEFAULT_RATES[tr.rateKey];
          const isDefault = mortgage[tr.rateKey] === defaultVal;
          const isTooltipOpen = openTooltip === tr.rateKey;
          const isPopoverOpen = openPopover === tr.rateKey;

          return (
            <div key={tr.rateKey} className="relative">
              <label className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mb-1">
                <button
                  type="button"
                  ref={el => { triggerRefs.current[tr.rateKey] = el; }}
                  onClick={() => togglePopover(tr.rateKey)}
                  className="truncate text-start hover:text-foreground transition-colors cursor-pointer group flex items-center gap-0.5"
                >
                  <span className={`group-hover:underline underline-offset-2 decoration-primary/40 ${isPopoverOpen ? 'text-primary font-medium' : ''}`}>
                    {t('interest_rate')} {tr.label}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`shrink-0 text-muted-foreground/50 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenTooltip(isTooltipOpen ? null : tr.rateKey); }}
                  onMouseEnter={() => setOpenTooltip(tr.rateKey)}
                  onMouseLeave={() => setOpenTooltip(null)}
                  className="flex-shrink-0 text-muted-foreground/50 hover:text-primary transition-colors"
                  aria-label={`${t('interest_rate')} ${tr.label}`}
                >
                  <Info size={12} />
                </button>
              </label>

              {isTooltipOpen && (
                <div
                  className="absolute z-30 bottom-full mb-1.5 left-0 right-0 sm:left-auto sm:right-0 sm:w-48 rounded-lg border border-border/60 bg-card shadow-lg shadow-black/10 px-2.5 py-2 text-[10px] sm:text-[11px] text-foreground/80 leading-relaxed"
                  onMouseEnter={() => setOpenTooltip(tr.rateKey)}
                  onMouseLeave={() => setOpenTooltip(null)}
                  onClick={() => setOpenTooltip(null)}
                >
                  {t(tr.tooltipKey)}
                </div>
              )}

              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={mortgage[tr.rateKey]}
                onChange={e => update(tr.rateKey, Number(e.target.value))}
                className="w-full rounded-xl border border-border/60 bg-secondary/50 text-foreground text-sm py-2.5 sm:py-2 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-1 leading-tight">
                {isDefault ? t('example') : t('custom')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Wide popover explanation card */}
      {openPopover && explanationKeys[openPopover] && (
        <div className="relative mb-3 animate-in fade-in-0 slide-in-from-top-2 duration-200" ref={popoverRef}>
          <div
            className="absolute -top-[6px] w-3 h-3 rotate-45 border-t border-l border-border/60 bg-card z-10"
            style={{ left: getArrowPosition(), transform: `translateX(-50%) rotate(45deg)` }}
          />

          <div className="rounded-xl border border-border/60 bg-card shadow-lg shadow-black/8 p-3 sm:p-4 mt-1">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs sm:text-sm font-heading font-bold text-foreground">
                {t(explanationKeys[openPopover].title)}
              </h4>
              <button
                type="button"
                onClick={() => setOpenPopover(null)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-secondary/50"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {explanationKeys[openPopover].items.map((item, i) => {
                const labelText = t(item.label);
                return (
                  <div key={i} className="rounded-lg bg-secondary/30 border border-border/20 px-2.5 py-2">
                    <p className={`text-[10px] sm:text-[11px] font-heading font-semibold mb-0.5 ${labelColors[labelText] || 'text-foreground/80'}`}>
                      {labelText}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                      {t(item.text)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-secondary/30 border border-border/30 px-3 py-2 sm:py-2.5 mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
          {t('rates_disclaimer')}
        </p>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">{t('loan_term')}</label>
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
