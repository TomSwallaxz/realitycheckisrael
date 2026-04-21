import { useState, useRef } from "react";
import { toast } from "sonner";
import { AnalysisResult, PropertyInputs, formatNIS, calcFirstMonthSplit } from "@/lib/calculator";
import { generateDealPDF } from "@/lib/generatePDF";
import { useI18n } from "@/lib/i18n";

interface Props {
  result: AnalysisResult;
  inputs: PropertyInputs;
  motivations: string[];
}

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const bgMap = {
    safe: "bg-safe/8 border-safe/20",
    warning: "bg-warning/8 border-warning/20",
    danger: "bg-danger/8 border-danger/20",
  };
  const textMap = {
    safe: "text-safe",
    warning: "text-warning",
    danger: "text-danger",
  };

  const verdictText = result.verdictLevel === 'safe' ? t('verdict_safe')
    : result.verdictLevel === 'warning' ? t('verdict_warning')
    : t('verdict_danger');

  const riskText = result.riskScore === 'נמוך' ? t('risk_low')
    : result.riskScore === 'בינוני' ? t('risk_medium')
    : t('risk_high');

  const stressText = result.stressLevel === 'נמוך' ? t('risk_low')
    : result.stressLevel === 'בינוני' ? t('risk_medium')
    : t('risk_high');

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 backdrop-blur-sm ${bgMap[result.verdictLevel]}`}>
      <div className={`font-heading font-extrabold text-lg sm:text-xl ${textMap[result.verdictLevel]}`}>
        {verdictText}
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 sm:gap-x-6 sm:gap-y-2 mt-2 sm:mt-3 text-sm">
        <div>
          <span className="text-muted-foreground">{t('risk')}: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{riskText}</span>
        </div>
        <div>
          <span className="text-muted-foreground">{t('expected_stress')}: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{stressText}</span>
        </div>
        <div>
          <span className="text-muted-foreground">{t('min_buffer')}: </span>
          <span className="font-semibold text-foreground">{formatNIS(result.minRequiredBuffer)}</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  level,
}: {
  label: string;
  value: string;
  sub?: string;
  level?: "safe" | "warning" | "danger" | "neutral";
}) {
  const colorMap = {
    safe: "text-safe",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-foreground",
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
      <div className="text-[11px] sm:text-xs text-muted-foreground font-heading">{label}</div>
      <div className={`text-xl sm:text-2xl font-heading font-extrabold mt-0.5 sm:mt-1 tracking-tight ${colorMap[level || "neutral"]}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: AnalysisResult["scenarios"][0] }) {
  const { t } = useI18n();
  const level = scenario.survives ? (scenario.monthlyCashFlow >= 0 ? "safe" : "warning") : "danger";
  const borderMap = { safe: "border-safe/20", warning: "border-warning/20", danger: "border-danger/20" };
  const bgMap = { safe: "bg-safe/5", warning: "bg-warning/5", danger: "bg-danger/5" };
  const textMap = { safe: "text-safe", warning: "text-warning", danger: "text-danger" };
  const dotMap = { safe: "bg-safe", warning: "bg-warning", danger: "bg-danger" };

  return (
    <div className={`rounded-2xl border p-3.5 sm:p-4 backdrop-blur-sm ${borderMap[level]} ${bgMap[level]}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotMap[level]}`} />
        <span className="font-heading font-bold text-sm text-foreground">{scenario.name}</span>
      </div>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-2.5 sm:mb-3">{scenario.description}</p>

      <div className="space-y-1.5 sm:space-y-2 text-[13px] sm:text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('monthly_payment_label')}</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('effective_rent')}</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyRent)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('expenses')}</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyExpenses)}</span>
        </div>
        <div className="border-t border-border/30 my-1" />
        <div className="flex justify-between font-semibold">
          <span className="text-muted-foreground">{t('monthly_cashflow')}</span>
          <span className={`font-mono ${textMap[level]}`}>{formatNIS(scenario.monthlyCashFlow)}</span>
        </div>
      </div>

      <div
        className={`mt-2.5 sm:mt-3 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-heading font-bold ${
          scenario.survives
            ? scenario.monthlyCashFlow >= 0
              ? "bg-safe/10 text-safe"
              : "bg-warning/10 text-warning"
            : "bg-danger/10 text-danger"
        }`}
      >
        {scenario.survives
          ? scenario.monthlyCashFlow >= 0
            ? t('positive_flow')
            : `⚠ ${t('survives_months')} ~${scenario.monthsBeforeBroke} ${t('months_on_buffer')}`
          : scenario.monthsBeforeBroke === 0
            ? t('broke_immediately')
            : `${t('breaks_after')} ${scenario.monthsBeforeBroke} ${t('months')}`}
      </div>
    </div>
  );
}

function ApprovalScoreSection({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { t } = useI18n();
  const { approvalScore } = result;
  const colorMap = { safe: "text-safe", warning: "text-warning", danger: "text-danger" };
  const bgMap = { safe: "bg-safe", warning: "bg-warning", danger: "bg-danger" };
  const bgLightMap = { safe: "bg-safe/10", warning: "bg-warning/10", danger: "bg-danger/10" };
  const borderMap = { safe: "border-safe/20", warning: "border-warning/20", danger: "border-danger/20" };

  const labelText = approvalScore.level === 'safe' ? t('approval_high')
    : approvalScore.level === 'warning' ? t('approval_borderline')
    : t('approval_low');

  const insightText = approvalScore.level === 'safe' ? t('approval_safe_insight')
    : approvalScore.level === 'warning' ? t('approval_warn_insight')
    : t('approval_danger_insight');

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-sm ${borderMap[approvalScore.level]} ${bgLightMap[approvalScore.level]}`}>
      <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <span>🏦</span>
        <span>{t('approval_title')}</span>
      </h3>

      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className={`text-2xl sm:text-3xl font-heading font-extrabold ${colorMap[approvalScore.level]}`}>
            {approvalScore.score}/100
          </span>
          <span className={`text-sm font-heading font-bold ${colorMap[approvalScore.level]}`}>
            {labelText}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${bgMap[approvalScore.level]}`}
            style={{ width: `${approvalScore.score}%` }}
          />
        </div>
      </div>

      <p className="text-[13px] sm:text-sm text-foreground/80 mb-3">{insightText}</p>

      {inputs.borrowerMode === 'dual' && approvalScore.improvement > 0 && (
        <div className="rounded-xl bg-safe/10 border border-safe/20 px-3 py-2 text-[13px] sm:text-sm text-safe font-heading font-semibold mb-3">
          👥 {t('dual_improved')}{approvalScore.improvement}+ {t('points')}
        </div>
      )}

      {approvalScore.tips.length > 0 && (
        <div>
          <h4 className="text-[11px] sm:text-xs text-muted-foreground font-heading font-semibold mb-2">{t('improve_tips')}</h4>
          <div className="space-y-1.5">
            {approvalScore.tips.map((tip, i) => (
              <div key={i} className="flex items-center justify-between text-[13px] sm:text-sm bg-background/30 rounded-lg px-3 py-2 border border-border/20">
                <span className="text-foreground">{tip.action}</span>
                <span className="text-safe font-heading font-bold text-xs">+{tip.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BorrowerComparisonSection({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const comparison = result.borrowerComparison;
  if (!comparison) return null;

  const colorMap = { safe: "text-safe", warning: "text-warning", danger: "text-danger" };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 sm:p-5">
      <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <span>👥</span>
        <span>{t('borrower_impact')}</span>
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl border border-border/30 bg-background/40 p-3">
          <div className="text-[11px] text-muted-foreground font-heading mb-1">{t('single_label')}</div>
          <div className="text-lg font-heading font-bold text-foreground">{formatNIS(comparison.single.totalIncome)}</div>
          <div className={`text-xs font-heading font-semibold mt-1 ${colorMap[comparison.single.riskLevel]}`}>
            {t('burden')}: {comparison.single.burdenPercent.toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t('remaining')}: {formatNIS(comparison.single.monthlyRemaining)}
          </div>
        </div>
        <div className="rounded-xl border border-safe/30 bg-safe/5 p-3">
          <div className="text-[11px] text-muted-foreground font-heading mb-1">{t('dual_label')}</div>
          <div className="text-lg font-heading font-bold text-foreground">{formatNIS(comparison.dual.totalIncome)}</div>
          <div className={`text-xs font-heading font-semibold mt-1 ${colorMap[comparison.dual.riskLevel]}`}>
            {t('burden')}: {comparison.dual.burdenPercent.toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t('remaining')}: {formatNIS(comparison.dual.monthlyRemaining)}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-safe/10 border border-safe/20 px-3 py-2.5 text-[13px] sm:text-sm text-foreground">
        <span className="text-safe font-bold">✓</span> {comparison.insight}
      </div>

      {comparison.savedRiskPoints > 0 && (
        <div className="mt-2 text-[11px] sm:text-xs text-safe font-heading font-semibold">
          {t('risk_reduction')} -{comparison.savedRiskPoints} {t('risk_points')}
        </div>
      )}
    </div>
  );
}

function CostBreakdownSection({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
      <h3 className="font-heading font-bold text-sm text-foreground mb-1">{t('real_cost_title')}</h3>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">{t('real_cost_sub')}</p>
      
      <div className="text-xl sm:text-2xl font-heading font-bold text-foreground font-mono mb-3">
        {formatNIS(result.totalRealCost)}
      </div>

      <div className="space-y-1.5 border-t border-border/30 pt-3">
        {result.costBreakdown.map((item, i) => {
          const isIndented = item.label.startsWith('  ');
          return (
            <div key={i} className={`flex justify-between text-[13px] sm:text-sm ${isIndented ? 'pr-4' : ''}`}>
              <span className={`${isIndented ? 'text-muted-foreground text-[12px]' : 'text-foreground'}`}>
                {item.label}
              </span>
              <span className="text-foreground font-medium font-mono">{formatNIS(item.amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImprovementTipsSection({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { t } = useI18n();
  const tips = result.approvalScore.tips;
  const hasWarnings = result.warningBanners.length > 0;
  const hasDangerScenarios = result.scenarios.some(s => !s.survives);
  
  if (tips.length === 0 && !hasWarnings && !hasDangerScenarios) return null;

  const recommendations: { icon: string; text: string; severity: 'safe' | 'warning' | 'danger' }[] = [];

  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = (result.monthlyPayment / totalIncome) * 100;

  if (inputs.borrowerMode === 'single') {
    recommendations.push({ icon: '👥', text: t('rec_add_coborrower'), severity: 'safe' });
  }

  if (burdenPercent > 35) {
    recommendations.push({
      icon: '📉',
      text: `${t('rec_high_burden')} (${burdenPercent.toFixed(0)}%)`,
      severity: burdenPercent > 40 ? 'danger' : 'warning',
    });
  }

  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const equityPercent = ((inputs.downPayment + parentCont) / inputs.price) * 100;
  if (equityPercent < 25) {
    recommendations.push({
      icon: '💰',
      text: `${t('rec_low_equity')} (${equityPercent.toFixed(0)}%)`,
      severity: equityPercent < 15 ? 'danger' : 'warning',
    });
  }

  if (inputs.cashBuffer < result.monthlyPayment * 6) {
    recommendations.push({ icon: '🛡️', text: t('rec_low_buffer'), severity: 'danger' });
  }

  if (inputs.fixedMonthlyExpenses > totalIncome * 0.4) {
    recommendations.push({ icon: '📋', text: t('rec_high_expenses'), severity: 'warning' });
  }

  if (hasDangerScenarios) {
    recommendations.push({ icon: '⚡', text: t('rec_danger_scenario'), severity: 'danger' });
  }

  if (recommendations.length === 0) return null;

  const borderColorMap = { safe: "border-safe/20", warning: "border-warning/20", danger: "border-danger/20" };
  const bgColorMap = { safe: "bg-safe/5", warning: "bg-warning/5", danger: "bg-danger/5" };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
      <h3 className="font-heading font-bold text-sm text-foreground mb-1 flex items-center gap-2">
        <span>{t('tips_title')}</span>
      </h3>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">{t('tips_sub')}</p>

      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className={`rounded-xl border px-3 py-2.5 ${borderColorMap[rec.severity]} ${bgColorMap[rec.severity]}`}>
            <div className="text-[13px] sm:text-sm text-foreground">
              {rec.icon} {rec.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankReportCTA({ result, inputs, motivations }: Props) {
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateDealPDF(result, inputs, motivations);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('link_copied'));
    } catch {
      toast.error(t('link_copy_failed'));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {downloading ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>{t('preparing')}</span>
          </>
        ) : (
          <span>{t('download_report')}</span>
        )}
      </button>
      <button
        onClick={handleShare}
        className="flex-1 py-4 rounded-xl border border-border bg-card text-foreground font-heading font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {t('share_link')}
      </button>
    </div>
  );
}

type CFLevel = 'safe' | 'warning' | 'danger';
const cfColor = { safe: 'text-safe', warning: 'text-warning', danger: 'text-danger' } as const;
const cfBg = { safe: 'bg-safe/8', warning: 'bg-warning/10', danger: 'bg-danger/8' } as const;
const cfBorder = { safe: 'border-safe/30', warning: 'border-warning/30', danger: 'border-danger/30' } as const;
const cfHeaderBg = { safe: 'bg-safe/15', warning: 'bg-warning/20', danger: 'bg-danger/15' } as const;

function CashflowCard({
  title, verdict, level, amount, amountLabel, rows,
}: {
  title: string;
  verdict: string;
  level: CFLevel;
  amount: number;
  amountLabel: string;
  rows: { icon: string; label: string; value: number; tone: 'pos' | 'neg' | 'neutral' }[];
}) {
  const display = amount > 0 ? `+${formatNIS(amount)}` : amount === 0 ? formatNIS(0) : `-${formatNIS(Math.abs(amount))}`;
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm backdrop-blur-sm ${cfBorder[level]} ${cfBg[level]}`}>
      <div className={`px-3 sm:px-4 py-2 ${cfHeaderBg[level]}`}>
        <div className="text-[10px] sm:text-[11px] text-muted-foreground font-heading uppercase tracking-wide">{title}</div>
        <div className={`text-xs sm:text-sm font-heading font-bold mt-0.5 ${cfColor[level]}`}>{verdict}</div>
      </div>
      <div className="p-3 sm:p-4">
        <div className={`text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight ${cfColor[level]}`}>
          {display}
        </div>
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{amountLabel}</div>

        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5 text-[12px] sm:text-[13px]">
          {rows.map((r, i) => {
            const toneClass = r.tone === 'pos' ? 'text-safe' : r.tone === 'neg' ? 'text-danger' : 'text-foreground';
            const sign = r.value > 0 ? '+' : r.value < 0 ? '-' : '';
            return (
              <div key={i} className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 min-w-0">
                  <span aria-hidden>{r.icon}</span><span className="truncate">{r.label}</span>
                </span>
                <span className={`font-mono font-semibold whitespace-nowrap ${toneClass}`}>
                  {sign}{formatNIS(Math.abs(r.value))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function YieldCard({ title, sub, value, level }: { title: string; sub: string; value: string; level: CFLevel | 'neutral' }) {
  const colorMap = { safe: 'text-safe', warning: 'text-warning', danger: 'text-danger', neutral: 'text-foreground' } as const;
  const borderMap = { safe: 'border-safe/30', warning: 'border-warning/30', danger: 'border-danger/30', neutral: 'border-border/40' } as const;
  const bgMap = { safe: 'bg-safe/8', warning: 'bg-warning/10', danger: 'bg-danger/8', neutral: 'bg-card/60' } as const;
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-sm shadow-sm ${borderMap[level]} ${bgMap[level]}`}>
      <div className="text-[11px] sm:text-xs text-muted-foreground font-heading">{title}</div>
      <div className={`text-3xl sm:text-4xl font-heading font-extrabold mt-1 tracking-tight ${colorMap[level]}`}>{value}</div>
      <div className="text-[11px] sm:text-xs text-muted-foreground mt-1.5">{sub}</div>
    </div>
  );
}

function InvestmentResults({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { t } = useI18n();
  const rent = Math.max(0, inputs.monthlyRent || 0);
  const price = Math.max(1, inputs.price || 0);
  // Property-only expenses (maintenance + repairs, monthly): mirrors calcPropertyExpenses
  const propertyExpensesMonthly = price * 0.01 / 12 + price * 0.005 / 12;

  const grossYield = (rent * 12 / price) * 100;
  const netYield = ((rent - propertyExpensesMonthly) * 12 / price) * 100;
  const propCashflow = rent - result.monthlyPayment - propertyExpensesMonthly;

  const grossLevel: CFLevel | 'neutral' = grossYield >= 5 ? 'safe' : grossYield >= 3 ? 'warning' : 'danger';
  const netLevel: CFLevel | 'neutral' = netYield >= 4 ? 'safe' : netYield >= 2 ? 'warning' : 'danger';
  const cfLevel: CFLevel = propCashflow > 200 ? 'safe' : propCashflow >= -200 ? 'warning' : 'danger';
  const cfDisplay = propCashflow > 0 ? `+${formatNIS(propCashflow)}` : propCashflow === 0 ? formatNIS(0) : `-${formatNIS(Math.abs(propCashflow))}`;
  const cfVerdict = cfLevel === 'safe' ? t('prop_cf_positive') : cfLevel === 'danger' ? t('prop_cf_negative') : t('asset_verdict_balanced');

  return (
    <div className="col-span-2 space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <YieldCard title={t('yield_gross_title')} sub={t('yield_gross_sub')} value={`${grossYield.toFixed(1)}%`} level={grossLevel} />
        <YieldCard title={t('yield_net_title')} sub={t('yield_net_sub')} value={`${netYield.toFixed(1)}%`} level={netLevel} />
      </div>
      <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-sm shadow-sm ${cfBorder[cfLevel]} ${cfBg[cfLevel]}`}>
        <div className="text-[11px] sm:text-xs text-muted-foreground font-heading">{t('prop_cashflow_title')}</div>
        <div className={`text-3xl sm:text-4xl font-heading font-extrabold mt-1 tracking-tight ${cfColor[cfLevel]}`}>{cfDisplay}</div>
        <div className={`text-xs sm:text-sm font-heading font-bold mt-1 ${cfColor[cfLevel]}`}>{cfVerdict}</div>
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5 text-[12px] sm:text-[13px]">
          <Row icon="🏠" label={t('rental_income')} value={rent} tone="pos" />
          <Row icon="🏦" label={t('mortgage_payment')} value={-result.monthlyPayment} tone="neg" />
          <Row icon="🔧" label={t('expenses')} value={-propertyExpensesMonthly} tone="neg" />
        </div>
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-2">{t('prop_cashflow_sub')}</div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, tone }: { icon: string; label: string; value: number; tone: 'pos' | 'neg' | 'neutral' }) {
  const toneClass = tone === 'pos' ? 'text-safe' : tone === 'neg' ? 'text-danger' : 'text-foreground';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5 min-w-0">
        <span aria-hidden>{icon}</span><span className="truncate">{label}</span>
      </span>
      <span className={`font-mono font-semibold whitespace-nowrap ${toneClass}`}>
        {sign}{formatNIS(Math.abs(value))}
      </span>
    </div>
  );
}

function PrimaryResults({ result, inputs, mortgage }: { result: AnalysisResult; inputs: PropertyInputs; mortgage: number }) {
  const { t } = useI18n();
  const altRent = Math.max(0, inputs.altRent ?? 0);
  const fixedExpenses = Math.max(0, inputs.fixedMonthlyExpenses || 0);

  // Card A: Real cost of living = mortgage + fixed expenses - alt rent
  const livingCost = mortgage + fixedExpenses - altRent;
  const hasAlt = altRent > 0;
  const livingLevel: CFLevel = !hasAlt ? 'warning' : livingCost > 1500 ? 'danger' : livingCost > 0 ? 'warning' : 'safe';
  const livingDisplay = livingCost > 0 ? `+${formatNIS(livingCost)}` : livingCost === 0 ? formatNIS(0) : `-${formatNIS(Math.abs(livingCost))}`;
  const livingMsg = !hasAlt
    ? t('alt_rent_missing')
    : livingCost > 0 ? t('living_cost_positive_msg') : t('living_cost_negative_msg');

  // Card B: Burn vs build — first-month split using weighted avg rate
  const loanAmount = result.loanAmount;
  // Compute weighted avg annual rate from mortgageBreakdown
  const weightedRate = loanAmount > 0
    ? result.mortgageBreakdown.reduce((acc, t) => acc + t.amount * t.rate, 0) / loanAmount
    : 0;
  const split = calcFirstMonthSplit(loanAmount, mortgage, weightedRate);
  const burned = split.interest + fixedExpenses;
  const built = split.principal;

  return (
    <div className="col-span-2 space-y-3 sm:space-y-4">
      {/* Living cost card */}
      <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-sm shadow-sm ${cfBorder[livingLevel]} ${cfBg[livingLevel]}`}>
        <div className="text-[10px] sm:text-[11px] text-muted-foreground font-heading uppercase tracking-wide">{t('living_cost_title')}</div>
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{t('living_cost_sub')}</div>
        {hasAlt ? (
          <>
            <div className={`text-3xl sm:text-4xl font-heading font-extrabold mt-2 tracking-tight ${cfColor[livingLevel]}`}>{livingDisplay}</div>
            <div className={`text-xs sm:text-sm font-heading font-bold mt-1 ${cfColor[livingLevel]}`}>{livingMsg}</div>
          </>
        ) : (
          <div className="mt-3 text-[13px] sm:text-sm text-muted-foreground italic">{livingMsg}</div>
        )}
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5 text-[12px] sm:text-[13px]">
          <Row icon="🏦" label={t('mortgage_payment')} value={mortgage} tone="neg" />
          <Row icon="💳" label={t('fixed_expenses')} value={fixedExpenses} tone="neg" />
          {hasAlt && <Row icon="🏠" label={t('alt_rent')} value={-altRent} tone="pos" />}
        </div>
      </div>

      {/* Burn vs build card */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-foreground">{t('burn_vs_build_title')}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 mb-3">{t('burn_vs_build_sub')}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-danger/25 bg-danger/8 p-3">
            <div className="text-[11px] text-muted-foreground font-heading">🔥 {t('burned_label')}</div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-danger mt-1 font-mono">{formatNIS(burned)}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">{t('burned_hint')}</div>
          </div>
          <div className="rounded-xl border border-safe/25 bg-safe/8 p-3">
            <div className="text-[11px] text-muted-foreground font-heading">🧱 {t('built_label')}</div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-safe mt-1 font-mono">{formatNIS(built)}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">{t('built_hint')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CashflowSection({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const isInvestment = inputs.propertyType === 'investment';
  if (isInvestment) {
    return <InvestmentResults result={result} inputs={inputs} />;
  }
  return <PrimaryResults result={result} inputs={inputs} mortgage={result.monthlyPayment} />;
}

function TotalMortgageCostBlock({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const [showTip, setShowTip] = useState(false);
  const totalMonths = result.termYears * 12;
  const totalPaid = result.monthlyPayment * totalMonths;
  const totalInterest = totalPaid - result.loanAmount;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <h3 className="font-heading font-bold text-sm text-foreground">{t('total_mortgage_title')}</h3>
        <div className="relative">
          <button
            onClick={() => setShowTip(!showTip)}
            className="w-4 h-4 rounded-full bg-muted/50 text-muted-foreground text-[10px] flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="?"
          >
            ?
          </button>
          {showTip && (
            <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 sm:w-64 rounded-xl border border-border bg-popover p-3 shadow-lg text-[11px] sm:text-xs text-popover-foreground">
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
              {t('monthly_payment')} × {totalMonths} ({result.termYears} {t('years')})
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-baseline text-[13px] sm:text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('mortgage_amount')}</span>
            <span className="text-[10px] text-muted-foreground/60">{t('mortgage_amount_sub')}</span>
          </div>
          <span className="font-mono font-semibold text-foreground">{formatNIS(result.loanAmount)}</span>
        </div>
        <div className="flex justify-between items-baseline text-[13px] sm:text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('total_to_bank')} ({result.termYears} {t('years')})</span>
            <span className="text-[10px] text-muted-foreground/60">{t('total_to_bank_sub')}</span>
          </div>
          <span className="font-mono font-bold text-lg sm:text-xl text-foreground">{formatNIS(totalPaid)}</span>
        </div>
        <div className="flex justify-between items-baseline text-[13px] sm:text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('interest_paid')}</span>
            <span className="text-[10px] text-muted-foreground/60">{t('interest_paid_sub')}</span>
          </div>
          <span className="font-mono font-semibold text-warning">{formatNIS(totalInterest)}</span>
        </div>
        <div className="flex justify-between items-baseline text-[13px] sm:text-sm pt-2 border-t border-border/20">
          <span className="text-muted-foreground">{t('monthly_payment')}</span>
          <span className="font-mono font-semibold text-foreground">{formatNIS(result.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  );
}

const MOTIVATION_RESPONSES_KEYS: Record<string, string> = {
  family_pressure: 'resp_family',
  fomo: 'resp_fomo',
  stability: 'resp_stability',
  investment: 'resp_investment',
  status: 'resp_status',
  rent_waste: 'resp_rent_waste',
};


function AppreciationBlock({ price }: { price: number }) {
  const { t } = useI18n();
  const scenarios = [
    { key: 'pessimistic', label: t('appr_pessimistic'), rate: 0, accent: 'text-muted-foreground', border: 'border-border/40', bg: 'bg-card/60' },
    { key: 'realistic', label: t('appr_realistic'), rate: 0.03, accent: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/5' },
    { key: 'optimistic', label: t('appr_optimistic'), rate: 0.05, accent: 'text-safe', border: 'border-safe/30', bg: 'bg-safe/8' },
  ];
  const fv = (rate: number, years: number) => Math.round(price * Math.pow(1 + rate, years));

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
      <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <span aria-hidden>📈</span>
        <span>{t('appr_title')}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {scenarios.map(s => {
          const v5 = fv(s.rate, 5);
          const v10 = fv(s.rate, 10);
          const gain = v10 - price;
          return (
            <div key={s.key} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-xs font-heading font-bold ${s.accent}`}>{s.label}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{(s.rate * 100).toFixed(0)}% {t('appr_per_year')}</span>
              </div>
              <div className="space-y-1.5 text-[12px] sm:text-[13px]">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{t('appr_value_5y')}</span>
                  <span className="font-mono font-semibold text-foreground whitespace-nowrap">{formatNIS(v5)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{t('appr_value_10y')}</span>
                  <span className="font-mono font-semibold text-foreground whitespace-nowrap">{formatNIS(v10)}</span>
                </div>
                <div className="border-t border-border/30 my-1" />
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{t('appr_potential_gain')}</span>
                  <span className={`font-mono font-extrabold whitespace-nowrap ${gain > 0 ? s.accent : 'text-foreground'}`}>
                    {gain > 0 ? `+${formatNIS(gain)}` : formatNIS(0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed flex items-start gap-1.5">
        <span aria-hidden>⚠️</span>
        <span>{t('appr_disclaimer')}</span>
      </p>
    </div>
  );
}


function DecisionLine({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { t } = useI18n();
  const isInvestment = inputs.propertyType === 'investment';
  const totalIncome = inputs.borrowerMode === 'dual'
    ? inputs.monthlyIncome + inputs.secondBorrowerIncome
    : inputs.monthlyIncome;
  const fixedExpenses = Math.max(0, inputs.fixedMonthlyExpenses || 0);
  const rent = isInvestment ? inputs.monthlyRent : 0;
  const mortgage = result.monthlyPayment;
  const assetNet = rent - mortgage;
  const lifeBalance = totalIncome + (isInvestment ? assetNet : -mortgage) - fixedExpenses;

  const lifeBorderline = Math.max(500, totalIncome * 0.05);
  const assetThreshold = Math.max(300, rent * 0.05);

  let level: CFLevel;
  let title: string;
  let sub: string;

  if (isInvestment) {
    const assetBad = assetNet < -assetThreshold;
    const lifeBad = lifeBalance < -lifeBorderline;
    const assetGood = assetNet > assetThreshold;
    const lifeGood = lifeBalance > lifeBorderline;

    if (assetBad || lifeBad) {
      level = 'danger'; title = t('decision_no_deal'); sub = t('decision_no_deal_sub');
    } else if (assetGood && lifeGood) {
      level = 'safe'; title = t('decision_deal'); sub = t('decision_deal_sub');
    } else {
      level = 'warning'; title = t('decision_borderline'); sub = t('decision_borderline_sub');
    }
  } else {
    if (lifeBalance < -lifeBorderline) {
      level = 'danger'; title = t('decision_no_deal'); sub = t('decision_no_deal_primary_sub');
    } else if (lifeBalance > lifeBorderline) {
      level = 'safe'; title = t('decision_deal'); sub = t('decision_deal_primary_sub');
    } else {
      level = 'warning'; title = t('decision_borderline'); sub = t('decision_borderline_sub');
    }
  }

  return (
    <div className={`rounded-2xl border-2 ${cfBorder[level]} ${cfBg[level]} p-5 sm:p-7 text-center shadow-md`}>
      <div className="text-[10px] sm:text-xs text-muted-foreground font-heading uppercase tracking-widest mb-2">
        {t('decision_label')}
      </div>
      <div className={`font-heading font-extrabold tracking-tight leading-none ${cfColor[level]} text-4xl sm:text-5xl lg:text-6xl`}>
        {title}
      </div>
      <div className={`mt-3 sm:mt-4 text-sm sm:text-base font-heading font-semibold ${cfColor[level]}`}>
        {sub}
      </div>
    </div>
  );
}

export function ResultsDashboard({ result, inputs, motivations }: Props) {
  const { t } = useI18n();
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = (result.monthlyPayment / totalIncome) * 100;
  const burdenLevel = burdenPercent <= 30 ? "safe" : burdenPercent <= 40 ? "warning" : "danger";

  return (
    <div className="space-y-4 sm:space-y-5">
      <VerdictBanner result={result} />
      <CashflowSection result={result} inputs={inputs} />
      <TotalMortgageCostBlock result={result} />
      <AppreciationBlock price={inputs.price} />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <MetricCard
          label={t('monthly_payment')}
          value={formatNIS(result.monthlyPayment)}
          sub={`${burdenPercent.toFixed(0)}% ${t('of_income')}`}
          level={burdenLevel}
        />
        <MetricCard
          label={t('purchase_tax')}
          value={formatNIS(result.purchaseTax)}
          sub={t('money_gone_day1')}
          level={result.purchaseTax > 50000 ? "danger" : "neutral"}
        />
      </div>

      <ApprovalScoreSection result={result} inputs={inputs} />
      {result.borrowerComparison && <BorrowerComparisonSection result={result} />}

      {inputs.parentHelp && inputs.parentHelpAmount > 0 && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 backdrop-blur-sm p-4 sm:p-5">
          <h3 className="font-heading font-bold text-sm text-foreground mb-2 flex items-center gap-2">
            <span>🤝</span>
            <span>{t('parent_impact')}</span>
          </h3>
          <div className="space-y-1.5 text-[13px] sm:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('personal_equity')}</span>
              <span className="font-mono font-medium text-foreground">{formatNIS(inputs.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('parent_help')}</span>
              <span className="font-mono font-medium text-warning">{formatNIS(inputs.parentHelpAmount)}</span>
            </div>
            <div className="border-t border-border/30 my-1" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">{t('total_equity')}</span>
              <span className="font-mono font-bold text-foreground">{formatNIS(inputs.downPayment + inputs.parentHelpAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('actual_financing')}</span>
              <span className="font-mono font-medium text-foreground">{inputs.financingPercent}%</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-2.5">{t('parent_help_insight')}</p>
        </div>
      )}

      <CostBreakdownSection result={result} />

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-foreground mb-2 sm:mb-3">{t('mortgage_detail')}</h3>
        <div className="space-y-2.5 sm:space-y-3">
          {result.mortgageBreakdown.map((track) => (
            <div key={track.label} className="flex items-start justify-between text-[13px] sm:text-sm gap-2">
              <div className="min-w-0">
                <span className="text-foreground font-medium">{track.label}</span>
                <div className="text-[11px] sm:text-xs text-muted-foreground">{track.desc}</div>
              </div>
              <div className="text-left flex-shrink-0">
                <span className="text-foreground font-medium font-mono">{formatNIS(track.monthly)}{t('per_month')}</span>
                <div className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                  {formatNIS(track.amount)} {t('on_rate')} {track.rate}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.warningBanners.map((banner, i) => (
        <div
          key={i}
          className="rounded-2xl bg-danger/8 border border-danger/20 px-4 sm:px-5 py-3 sm:py-4 text-[13px] sm:text-sm text-danger font-heading font-semibold"
        >
          🚨 {banner}
        </div>
      ))}

      <ImprovementTipsSection result={result} inputs={inputs} />

      <div>
        <h3 className="font-heading font-bold text-sm text-foreground mb-1">{t('scenarios_title')}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mb-2.5 sm:mb-3">{t('scenarios_sub')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {result.scenarios.map((s) => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </div>

      {(result.psychologyInsights.length > 0 || motivations.length > 0) && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 backdrop-blur-sm p-4 sm:p-6">
          <h3 className="font-heading font-bold text-sm text-warning mb-2.5 sm:mb-3">{t('psychology_title')}</h3>

          {motivations.length > 0 && (
            <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
              {motivations.map((m) => {
                const key = MOTIVATION_RESPONSES_KEYS[m];
                if (!key) return null;
                return (
                  <div key={m} className="text-[13px] sm:text-sm text-foreground bg-background/40 rounded-xl p-3 border border-border/30">
                    👉 {t(key as any)}
                  </div>
                );
              })}
            </div>
          )}

          {result.psychologyInsights.map((insight, i) => {
            const severityMap = {
              info: "border-primary/20 bg-primary/5",
              warning: "border-warning/20 bg-warning/5",
              danger: "border-danger/20 bg-danger/5",
            };
            const textColorMap = {
              info: "text-primary",
              warning: "text-warning",
              danger: "text-danger",
            };

            return (
              <div key={i} className={`rounded-xl p-3 border mb-2 ${severityMap[insight.severity]}`}>
                <div className={`text-[11px] sm:text-xs font-heading font-bold mb-1 ${textColorMap[insight.severity]}`}>
                  {insight.trigger}
                </div>
                <div className="text-[13px] sm:text-sm text-foreground">{insight.message}</div>
              </div>
            );
          })}
        </div>
      )}

      <DecisionLine result={result} inputs={inputs} />

      <BankReportCTA result={result} inputs={inputs} motivations={motivations} />

      <div className="text-center text-[11px] text-muted-foreground/60 pt-2 border-t border-border/20">
        {t('inline_disclaimer')}
      </div>
    </div>
  );
}
