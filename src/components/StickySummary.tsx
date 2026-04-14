import { PropertyInputs, AnalysisResult, formatNIS } from '@/lib/calculator';

interface Props {
  inputs: PropertyInputs;
  result: AnalysisResult | null;
  visible: boolean;
  onEditClick: () => void;
}

export function StickySummary({ inputs, result, visible, onEditClick }: Props) {
  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const totalEquity = inputs.downPayment + parentCont;
  const loanAmount = inputs.price - totalEquity;

  const verdictBadge = result ? (
    <span className={`text-[10px] sm:text-xs font-heading font-bold px-2 py-0.5 rounded-full border ${
      result.verdictLevel === 'safe'
        ? 'bg-safe/10 text-safe border-safe/30'
        : result.verdictLevel === 'warning'
        ? 'bg-warning/10 text-warning border-warning/30'
        : 'bg-danger/10 text-danger border-danger/30'
    }`}>
      {result.verdictLevel === 'safe' ? '✅ Deal' : result.verdictLevel === 'warning' ? '⚠️ גבולי' : '🚫 No Deal'}
    </span>
  ) : null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-3">
        <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 px-3 sm:px-5 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Data items — horizontal scroll on mobile */}
            <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-hide min-w-0 flex-1">
              <StickyItem label="מחיר" value={formatNIS(inputs.price)} />
              <Divider />
              <StickyItem label="הון עצמי" value={formatNIS(totalEquity)} />
              <Divider />
              <StickyItem label="מימון" value={`${inputs.financingPercent}%`} />
              <Divider />
              <StickyItem label="משכנתא" value={formatNIS(loanAmount)} />
              {verdictBadge && (
                <>
                  <Divider />
                  {verdictBadge}
                </>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={onEditClick}
              className="shrink-0 text-[10px] sm:text-xs font-heading font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 active:scale-95 whitespace-nowrap"
            >
              ✏️ ערוך
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-heading leading-none">{label}</span>
      <span className="text-xs sm:text-sm font-heading font-bold text-foreground tracking-tight whitespace-nowrap">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 sm:h-6 bg-border/40 shrink-0" />;
}
