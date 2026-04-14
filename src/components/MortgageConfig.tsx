import { useState, useRef, useEffect } from 'react';
import { MortgageStructure, Strategy, STRATEGY_INFO, DEFAULT_RATES } from '@/lib/calculator';
import { Info, ChevronDown, X } from 'lucide-react';

interface Props {
  mortgage: MortgageStructure;
  strategy: Strategy;
  onMortgageChange: (m: MortgageStructure) => void;
  onStrategyChange: (s: Strategy) => void;
}

const shortTooltips: Record<string, string> = {
  primeRate: 'ריבית שמשתנה לפי ריבית בנק ישראל.',
  fixedRate: 'ריבית קבועה לאורך כל התקופה.',
  variableRate: 'ריבית שמתעדכנת כל כמה שנים.',
};

const fullExplanations: Record<string, { title: string; content: { label: string; text: string }[] }> = {
  primeRate: {
    title: 'ריבית פריים',
    content: [
      { label: 'מה זה?', text: 'ריבית שמבוססת על ריבית בנק ישראל בתוספת מרווח קבוע (בדרך כלל 1.5%).' },
      { label: 'איך זה מחושב?', text: 'ריבית פריים = ריבית בנק ישראל + מרווח הבנק. כשבנק ישראל מעלה ריבית, גם הפריים עולה.' },
      { label: 'השפעה על ההחזר', text: 'ההחזר החודשי יכול לעלות או לרדת בהתאם לשינויים בריבית בנק ישראל.' },
      { label: 'יתרונות', text: 'בדרך כלל הריבית הנמוכה ביותר בהתחלה. גמישות גבוהה — אפשר לסגור בכל עת בלי קנס.' },
      { label: 'חסרונות', text: 'חשיפה לעליות ריבית. חוסר ודאות לגבי גובה ההחזר העתידי.' },
    ],
  },
  fixedRate: {
    title: 'ריבית קבועה',
    content: [
      { label: 'מה זה?', text: 'ריבית שנקבעת ביום לקיחת המשכנתא ונשארת זהה לאורך כל התקופה.' },
      { label: 'איך זה מחושב?', text: 'הבנק קובע ריבית קבועה על בסיס תשואות אג"ח ממשלתיות ותנאי השוק.' },
      { label: 'השפעה על ההחזר', text: 'ההחזר החודשי קבוע ולא משתנה — מה שנותן יציבות מלאה.' },
      { label: 'יתרונות', text: 'ודאות מלאה. שקט נפשי. קל לתכנן תקציב לטווח ארוך.' },
      { label: 'חסרונות', text: 'בדרך כלל יקרה יותר מפריים. יציאה מוקדמת עלולה לכלול עמלת פירעון.' },
    ],
  },
  variableRate: {
    title: 'ריבית משתנה',
    content: [
      { label: 'מה זה?', text: 'ריבית שמתעדכנת אחת לתקופה קבועה (למשל כל 5 שנים) לפי תנאי השוק.' },
      { label: 'איך זה מחושב?', text: 'הריבית נקבעת מחדש בכל תקופת עדכון על בסיס מדדים כלכליים כמו אג"ח או מדד המחירים.' },
      { label: 'השפעה על ההחזר', text: 'ההחזר יכול להשתנות בכל תקופת עדכון — לעלות או לרדת.' },
      { label: 'יתרונות', text: 'ריבית התחלתית נוחה יחסית. מאפשרת ליהנות מירידות ריבית.' },
      { label: 'חסרונות', text: 'חוסר ודאות לגבי עלויות עתידיות. הפתעות אפשריות בנקודות העדכון.' },
    ],
  },
};

const labelColors: Record<string, string> = {
  'מה זה?': 'text-primary',
  'איך זה מחושב?': 'text-primary',
  'השפעה על ההחזר': 'text-warning',
  'יתרונות': 'text-safe',
  'חסרונות': 'text-danger',
};

export function MortgageConfig({ mortgage, strategy, onMortgageChange, onStrategyChange }: Props) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close popover on click outside
  useEffect(() => {
    if (!openPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Check if click was on a trigger button
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

  const strategies: Strategy[] = ['conservative', 'balanced', 'aggressive'];

  const tracks = [
    { label: 'פריים', key: 'primePercent' as const, rateKey: 'primeRate' as const, color: 'bg-primary', desc: 'זול אבל מסוכן' },
    { label: 'קבועה', key: 'fixedPercent' as const, rateKey: 'fixedRate' as const, color: 'bg-safe', desc: 'יקר אבל יציב' },
    { label: 'משתנה', key: 'variablePercent' as const, rateKey: 'variableRate' as const, color: 'bg-warning', desc: 'לא צפוי' },
  ];

  const togglePopover = (key: string) => {
    setOpenPopover(prev => (prev === key ? null : key));
  };

  // Calculate arrow position based on which track is open
  const getArrowPosition = () => {
    if (!openPopover) return '50%';
    const idx = tracks.findIndex(t => t.rateKey === openPopover);
    // Each column is ~33%, position arrow at center of that column
    // RTL: first track is rightmost
    const positions = ['83%', '50%', '17%'];
    return positions[idx] || '50%';
  };

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

      {/* Allocation pills */}
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

      {/* Rate inputs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-1">
        {tracks.map(t => {
          const defaultVal = DEFAULT_RATES[t.rateKey];
          const isDefault = mortgage[t.rateKey] === defaultVal;
          const isTooltipOpen = openTooltip === t.rateKey;
          const isPopoverOpen = openPopover === t.rateKey;

          return (
            <div key={t.rateKey} className="relative">
              <label className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mb-1">
                <button
                  type="button"
                  ref={el => { triggerRefs.current[t.rateKey] = el; }}
                  onClick={() => togglePopover(t.rateKey)}
                  className="truncate text-start hover:text-foreground transition-colors cursor-pointer group flex items-center gap-0.5"
                >
                  <span className={`group-hover:underline underline-offset-2 decoration-primary/40 ${isPopoverOpen ? 'text-primary font-medium' : ''}`}>
                    ריבית {t.label}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`shrink-0 text-muted-foreground/50 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpenTooltip(isTooltipOpen ? null : t.rateKey); }}
                  onMouseEnter={() => setOpenTooltip(t.rateKey)}
                  onMouseLeave={() => setOpenTooltip(null)}
                  className="flex-shrink-0 text-muted-foreground/50 hover:text-primary transition-colors"
                  aria-label={`מידע על ריבית ${t.label}`}
                >
                  <Info size={12} />
                </button>
              </label>

              {/* Short tooltip */}
              {isTooltipOpen && (
                <div
                  className="absolute z-30 bottom-full mb-1.5 left-0 right-0 sm:left-auto sm:right-0 sm:w-48 rounded-lg border border-border/60 bg-card shadow-lg shadow-black/10 px-2.5 py-2 text-[10px] sm:text-[11px] text-foreground/80 leading-relaxed"
                  onMouseEnter={() => setOpenTooltip(t.rateKey)}
                  onMouseLeave={() => setOpenTooltip(null)}
                  onClick={() => setOpenTooltip(null)}
                >
                  {shortTooltips[t.rateKey]}
                </div>
              )}

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

      {/* Wide popover explanation card */}
      {openPopover && fullExplanations[openPopover] && (
        <div className="relative mb-3 animate-in fade-in-0 slide-in-from-top-2 duration-200" ref={popoverRef}>
          {/* Arrow */}
          <div
            className="absolute -top-[6px] w-3 h-3 rotate-45 border-t border-l border-border/60 bg-card z-10"
            style={{ left: getArrowPosition(), transform: `translateX(-50%) rotate(45deg)` }}
          />

          <div className="rounded-xl border border-border/60 bg-card shadow-lg shadow-black/8 p-3 sm:p-4 mt-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs sm:text-sm font-heading font-bold text-foreground">
                {fullExplanations[openPopover].title}
              </h4>
              <button
                type="button"
                onClick={() => setOpenPopover(null)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-secondary/50"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content blocks — horizontal on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              {fullExplanations[openPopover].content.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/30 border border-border/20 px-2.5 py-2">
                  <p className={`text-[10px] sm:text-[11px] font-heading font-semibold mb-0.5 ${labelColors[item.label] || 'text-foreground/80'}`}>
                    {item.label}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
