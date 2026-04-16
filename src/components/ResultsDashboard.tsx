import { useState, useRef } from "react";
import { AnalysisResult, PropertyInputs, formatNIS } from "@/lib/calculator";
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
  const [step, setStep] = useState<'cta' | 'email' | 'sent'>('cta');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) return;
    setLoading(true);
    // Simulate email send (no backend yet)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('sent');
    // Auto-download the PDF as well
    await generateDealPDF(result, inputs, motivations);
  };

  const handleDirectDownload = async () => {
    setDownloading(true);
    try {
      await generateDealPDF(result, inputs, motivations);
    } finally {
      setDownloading(false);
    }
  };

  if (step === 'sent') {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/8 p-4 sm:p-5 text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="font-heading font-bold text-sm text-safe">{t('bank_report_success')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6 shadow-sm">
      <h3 className="font-heading font-extrabold text-base sm:text-lg text-foreground mb-3">
        🏦 {t('bank_report_title')}
      </h3>

      <ul className="space-y-1.5 mb-4 text-[13px] sm:text-sm text-foreground/80">
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> {t('bank_report_bullet1')}</li>
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> {t('bank_report_bullet2')}</li>
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> {t('bank_report_bullet3')}</li>
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> {t('bank_report_bullet4')}</li>
      </ul>

      {step === 'cta' && (
        <div className="space-y-2.5">
          <button
            onClick={() => setStep('email')}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            📩 {t('bank_report_cta')}
          </button>
          <button
            onClick={handleDirectDownload}
            disabled={downloading}
            className="w-full py-2.5 rounded-xl border border-border/50 bg-card/80 hover:bg-card text-foreground font-heading font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {downloading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                <span>{t('preparing')}</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>{t('bank_report_download_too')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {step === 'email' && (
        <div className="space-y-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('bank_report_email_placeholder')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            dir="ltr"
          />
          <button
            onClick={handleSendEmail}
            disabled={loading || !email.includes('@')}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>{t('preparing')}</span>
              </>
            ) : (
              <>📩 {t('bank_report_send')}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function MonthlyCostCard({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { t } = useI18n();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const isInvestment = inputs.propertyType === 'investment';
  const effectiveRent = isInvestment ? inputs.monthlyRent : 0;
  const fixedExpenses = Math.max(0, inputs.fixedMonthlyExpenses || 0);
  // Net out of pocket = mortgage + fixed expenses - rent (for investment view)
  const netFromPocket = result.monthlyPayment + (isInvestment ? fixedExpenses : 0) - effectiveRent;
  // Positive surplus = property generates money (netFromPocket < 0)
  const cashflowSurplus = -netFromPocket;

  let level: 'safe' | 'warning' | 'danger';
  let verdict: string;
  let explain: string;

  if (isInvestment) {
    const borderlineThreshold = Math.max(300, effectiveRent * 0.05);
    if (cashflowSurplus > borderlineThreshold) {
      level = 'safe';
      verdict = t('cf_verdict_positive');
      explain = t('cf_explain_positive');
    } else if (Math.abs(cashflowSurplus) <= borderlineThreshold) {
      level = 'warning';
      verdict = netFromPocket === 0 ? t('cf_verdict_balanced') : t('cf_verdict_borderline');
      explain = t('cf_explain_borderline');
    } else {
      const burdenPct = (netFromPocket / totalIncome) * 100;
      level = burdenPct > 35 ? 'danger' : 'warning';
      verdict = t('cf_verdict_negative');
      explain = t('cf_explain_negative');
    }
  } else {
    const burdenPct = (result.monthlyPayment / totalIncome) * 100;
    if (burdenPct <= 30) level = 'safe';
    else if (burdenPct <= 40) level = 'warning';
    else level = 'danger';
    verdict = level === 'safe' ? t('burden_safe') : level === 'warning' ? t('burden_warning') : t('burden_danger');
    explain = '';
  }

  const colorMap = { safe: 'text-safe', warning: 'text-warning', danger: 'text-danger' };
  const bgMap = { safe: 'bg-safe/8', warning: 'bg-warning/10', danger: 'bg-danger/8' };
  const borderMap = { safe: 'border-safe/30', warning: 'border-warning/30', danger: 'border-danger/30' };
  const headerBgMap = { safe: 'bg-safe/15', warning: 'bg-warning/20', danger: 'bg-danger/15' };

  const title = isInvestment ? t('net_monthly_investment') : t('net_monthly_primary');
  const displayValue = isInvestment
    ? (cashflowSurplus > 0 ? `+${formatNIS(cashflowSurplus)}` : netFromPocket === 0 ? formatNIS(0) : `-${formatNIS(Math.abs(cashflowSurplus))}`)
    : formatNIS(result.monthlyPayment);

  return (
    <div className={`col-span-2 rounded-2xl border overflow-hidden shadow-sm backdrop-blur-sm ${borderMap[level]} ${bgMap[level]}`}>
      {/* Dynamic verdict header */}
      <div className={`px-3 sm:px-4 py-2 ${headerBgMap[level]} flex items-center justify-between gap-2`}>
        <div className={`text-xs sm:text-sm font-heading font-bold ${colorMap[level]}`}>{verdict}</div>
        <div className="relative shrink-0">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="w-4 h-4 rounded-full bg-background/60 text-muted-foreground text-[10px] flex items-center justify-center hover:bg-background transition-colors"
            aria-label="?"
          >?</button>
          {showTooltip && (
            <div
              ref={tooltipRef}
              className="absolute z-50 top-full mt-2 end-0 w-56 sm:w-64 rounded-xl border border-border bg-popover p-3 shadow-lg text-[11px] sm:text-xs text-popover-foreground"
            >
              {isInvestment ? t('tooltip_investment') : t('tooltip_primary')}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="text-[11px] sm:text-xs text-muted-foreground font-heading mb-1">{title}</div>

        {/* Big central number */}
        <div className={`text-3xl sm:text-4xl font-heading font-extrabold tracking-tight ${colorMap[level]} leading-tight`}>
          {displayValue}
        </div>
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{t('cf_net_label')}</div>

        {isInvestment && (
          <>
            <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5 text-[12px] sm:text-[13px]">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 min-w-0">
                  <span aria-hidden>🏠</span><span className="truncate">{t('rental_income')}</span>
                </span>
                <span className="font-mono font-semibold text-safe whitespace-nowrap">+{formatNIS(effectiveRent)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground flex items-center gap-1.5 min-w-0">
                  <span aria-hidden>🏦</span><span className="truncate">{t('mortgage_payment')}</span>
                </span>
                <span className="font-mono font-semibold text-danger whitespace-nowrap">-{formatNIS(result.monthlyPayment)}</span>
              </div>
              {fixedExpenses > 0 && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 min-w-0">
                    <span aria-hidden>💳</span><span className="truncate">{t('fixed_expenses')}</span>
                  </span>
                  <span className="font-mono font-semibold text-danger whitespace-nowrap">-{formatNIS(fixedExpenses)}</span>
                </div>
              )}
              <div className="border-t border-border/30 my-1.5" />
              <div className="flex justify-between items-center gap-2">
                <span className={`font-heading font-bold ${colorMap[level]}`}>{t('cf_result_net')}</span>
                <span className={`font-mono font-extrabold text-base ${colorMap[level]} whitespace-nowrap`}>{displayValue}</span>
              </div>
            </div>

            {explain && (
              <div className={`mt-3 text-[11px] sm:text-xs font-heading font-semibold ${colorMap[level]}`}>
                {explain}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
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

export function ResultsDashboard({ result, inputs, motivations }: Props) {
  const { t } = useI18n();
  const yieldLevel = result.annualYield >= 5 ? "safe" : result.annualYield >= 3 ? "warning" : "danger";
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = (result.monthlyPayment / totalIncome) * 100;
  const burdenLevel = burdenPercent <= 30 ? "safe" : burdenPercent <= 40 ? "warning" : "danger";

  return (
    <div className="space-y-4 sm:space-y-5">
      <VerdictBanner result={result} />
      <MonthlyCostCard result={result} inputs={inputs} />
      <TotalMortgageCostBlock result={result} />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <MetricCard
          label={t('monthly_payment')}
          value={formatNIS(result.monthlyPayment)}
          sub={`${burdenPercent.toFixed(0)}% ${t('of_income')}`}
          level={burdenLevel}
        />
        {inputs.propertyType === "investment" && (
          <MetricCard label={t('annual_yield')} value={`${result.annualYield.toFixed(1)}%`} sub={t('gross')} level={yieldLevel} />
        )}
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

      <BankReportCTA result={result} inputs={inputs} motivations={motivations} />

      <div className="text-center text-[11px] text-muted-foreground/60 pt-2 border-t border-border/20">
        {t('inline_disclaimer')}
      </div>
    </div>
  );
}
