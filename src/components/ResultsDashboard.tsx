import { useState } from "react";
import { AnalysisResult, PropertyInputs, formatNIS } from "@/lib/calculator";
import { generateDealPDF } from "@/lib/generatePDF";

interface Props {
  result: AnalysisResult;
  inputs: PropertyInputs;
  motivations: string[];
}

const MOTIVATION_RESPONSES: Record<string, string> = {
  family_pressure: "לחץ מהמשפחה זה לא סיבה לקנות דירה. זו ההחלטה הכלכלית הגדולה ביותר שלך — לא שלהם.",
  fomo: "״המחירים יעלו״ — אולי. אבל אם העסקה לא עומדת בפני עצמה היום, היא לא תעמוד מחר.",
  stability: "יציבות זה לגיטימי. אבל יציבות עם חוב כבד זה לא באמת יציבות.",
  investment: "תשואה טובה על נדל״ן? אולי. אבל תבדוק את המספרים — לא את הסיפורים.",
  status: "דירה משלך = הצלחה? בדוק שוב. הצלחה זה שקט נפשי, לא משכנתא.",
  rent_waste: "״שכירות זה בזבוז״ — מיתוס. גם ריבית, מס רכישה, ותחזוקה הם ״בזבוז״.",
};

function VerdictBanner({ result }: { result: AnalysisResult }) {
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

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 backdrop-blur-sm ${bgMap[result.verdictLevel]}`}>
      <div className={`font-heading font-extrabold text-lg sm:text-xl ${textMap[result.verdictLevel]}`}>
        {result.verdict}
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 sm:gap-x-6 sm:gap-y-2 mt-2 sm:mt-3 text-sm">
        <div>
          <span className="text-muted-foreground">סיכון: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{result.riskScore}</span>
        </div>
        <div>
          <span className="text-muted-foreground">לחץ צפוי: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{result.stressLevel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">כרית ביטחון מינימלית: </span>
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
      <div
        className={`text-xl sm:text-2xl font-heading font-extrabold mt-0.5 sm:mt-1 tracking-tight ${colorMap[level || "neutral"]}`}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: AnalysisResult["scenarios"][0] }) {
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
          <span className="text-muted-foreground">החזר חודשי</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">שכ״ד אפקטיבי</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyRent)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">הוצאות</span>
          <span className="text-foreground font-medium font-mono">{formatNIS(scenario.monthlyExpenses)}</span>
        </div>
        <div className="border-t border-border/30 my-1" />
        <div className="flex justify-between font-semibold">
          <span className="text-muted-foreground">תזרים חודשי</span>
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
            ? "✓ תזרים חיובי"
            : `⚠ שורד ~${scenario.monthsBeforeBroke} חודשים על כרית הביטחון`
          : scenario.monthsBeforeBroke === 0
            ? "✗ נגמר הכסף מיד"
            : `✗ נשבר אחרי ${scenario.monthsBeforeBroke} חודשים`}
      </div>
    </div>
  );
}

function ApprovalScoreSection({ result, inputs }: { result: AnalysisResult; inputs: PropertyInputs }) {
  const { approvalScore } = result;
  const colorMap = { safe: "text-safe", warning: "text-warning", danger: "text-danger" };
  const bgMap = { safe: "bg-safe", warning: "bg-warning", danger: "bg-danger" };
  const bgLightMap = { safe: "bg-safe/10", warning: "bg-warning/10", danger: "bg-danger/10" };
  const borderMap = { safe: "border-safe/20", warning: "border-warning/20", danger: "border-danger/20" };

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-sm ${borderMap[approvalScore.level]} ${bgLightMap[approvalScore.level]}`}>
      <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <span>🏦</span>
        <span>סיכויי אישור משכנתא</span>
      </h3>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className={`text-2xl sm:text-3xl font-heading font-extrabold ${colorMap[approvalScore.level]}`}>
            {approvalScore.score}/100
          </span>
          <span className={`text-sm font-heading font-bold ${colorMap[approvalScore.level]}`}>
            {approvalScore.label}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${bgMap[approvalScore.level]}`}
            style={{ width: `${approvalScore.score}%` }}
          />
        </div>
      </div>

      {/* Insight */}
      <p className="text-[13px] sm:text-sm text-foreground/80 mb-3">{approvalScore.insight}</p>

      {/* Dual borrower improvement */}
      {inputs.borrowerMode === 'dual' && approvalScore.improvement > 0 && (
        <div className="rounded-xl bg-safe/10 border border-safe/20 px-3 py-2 text-[13px] sm:text-sm text-safe font-heading font-semibold mb-3">
          👥 הוספת לווה נוסף שיפרה את הציון ב-{approvalScore.improvement}+ נקודות
        </div>
      )}

      {/* Tips */}
      {approvalScore.tips.length > 0 && (
        <div>
          <h4 className="text-[11px] sm:text-xs text-muted-foreground font-heading font-semibold mb-2">💡 איך לשפר את הסיכוי:</h4>
          <div className="space-y-1.5">
            {approvalScore.tips.map((tip, i) => (
              <div key={i} className="flex items-center justify-between text-[13px] sm:text-sm bg-background/30 rounded-lg px-3 py-2 border border-border/20">
                <span className="text-foreground">{tip.action}</span>
                <span className="text-safe font-heading font-bold text-xs">+{tip.points} נק׳</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BorrowerComparisonSection({ result }: { result: AnalysisResult }) {
  const comparison = result.borrowerComparison;
  if (!comparison) return null;

  const colorMap = { safe: "text-safe", warning: "text-warning", danger: "text-danger" };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 sm:p-5">
      <h3 className="font-heading font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <span>👥</span>
        <span>השפעת לווה נוסף</span>
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Single */}
        <div className="rounded-xl border border-border/30 bg-background/40 p-3">
          <div className="text-[11px] text-muted-foreground font-heading mb-1">👤 לווה יחיד</div>
          <div className="text-lg font-heading font-bold text-foreground">{formatNIS(comparison.single.totalIncome)}</div>
          <div className={`text-xs font-heading font-semibold mt-1 ${colorMap[comparison.single.riskLevel]}`}>
            נטל: {comparison.single.burdenPercent.toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            נשאר: {formatNIS(comparison.single.monthlyRemaining)}
          </div>
        </div>
        {/* Dual */}
        <div className="rounded-xl border border-safe/30 bg-safe/5 p-3">
          <div className="text-[11px] text-muted-foreground font-heading mb-1">👥 שני לווים</div>
          <div className="text-lg font-heading font-bold text-foreground">{formatNIS(comparison.dual.totalIncome)}</div>
          <div className={`text-xs font-heading font-semibold mt-1 ${colorMap[comparison.dual.riskLevel]}`}>
            נטל: {comparison.dual.burdenPercent.toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            נשאר: {formatNIS(comparison.dual.monthlyRemaining)}
          </div>
        </div>
      </div>

      {/* Summary insight */}
      <div className="rounded-xl bg-safe/10 border border-safe/20 px-3 py-2.5 text-[13px] sm:text-sm text-foreground">
        <span className="text-safe font-bold">✓</span> {comparison.insight}
      </div>

      {comparison.savedRiskPoints > 0 && (
        <div className="mt-2 text-[11px] sm:text-xs text-safe font-heading font-semibold">
          📉 הפחתת סיכון: -{comparison.savedRiskPoints} נקודות סיכון
        </div>
      )}
    </div>
  );
}

function CostBreakdownSection({ result }: { result: AnalysisResult }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
      <h3 className="font-heading font-bold text-sm text-foreground mb-1">העלות האמיתית — לא רק המשכנתא</h3>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">הון עצמי + מס רכישה + עלויות נלוות</p>
      
      <div className="text-xl sm:text-2xl font-heading font-bold text-foreground font-mono mb-3">
        {formatNIS(result.totalRealCost)}
      </div>

      {/* Detailed breakdown */}
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
  const tips = result.approvalScore.tips;
  const hasWarnings = result.warningBanners.length > 0;
  const hasDangerScenarios = result.scenarios.some(s => !s.survives);
  
  if (tips.length === 0 && !hasWarnings && !hasDangerScenarios) return null;

  // Build actionable recommendations
  const recommendations: { icon: string; text: string; severity: 'safe' | 'warning' | 'danger' }[] = [];

  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = (result.monthlyPayment / totalIncome) * 100;

  if (inputs.borrowerMode === 'single') {
    recommendations.push({
      icon: '👥',
      text: 'הוספת לווה נוסף (בן/בת זוג או ערב) תשפר משמעותית את סיכויי האישור ותקטין את רמת הסיכון.',
      severity: 'safe',
    });
  }

  if (burdenPercent > 35) {
    recommendations.push({
      icon: '📉',
      text: `נטל ההחזר שלך עומד על ${burdenPercent.toFixed(0)}% מההכנסה. שקול להגדיל הון עצמי או להקטין את סכום ההלוואה.`,
      severity: burdenPercent > 40 ? 'danger' : 'warning',
    });
  }

  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const equityPercent = ((inputs.downPayment + parentCont) / inputs.price) * 100;
  if (equityPercent < 25) {
    recommendations.push({
      icon: '💰',
      text: `ההון העצמי שלך עומד על ${equityPercent.toFixed(0)}% ממחיר הנכס. הגדלה ל-25%+ תשפר את תנאי המשכנתא ותפחית ריבית.`,
      severity: equityPercent < 15 ? 'danger' : 'warning',
    });
  }

  if (inputs.cashBuffer < result.monthlyPayment * 6) {
    recommendations.push({
      icon: '🛡️',
      text: `כרית הביטחון שלך (${formatNIS(inputs.cashBuffer)}) נמוכה מ-6 חודשי החזר. מומלץ לשמור לפחות ${formatNIS(result.monthlyPayment * 6)}.`,
      severity: 'danger',
    });
  }

  if (inputs.fixedMonthlyExpenses > totalIncome * 0.4) {
    recommendations.push({
      icon: '📋',
      text: `ההוצאות הקבועות שלך (${formatNIS(inputs.fixedMonthlyExpenses)}) מהוות ${((inputs.fixedMonthlyExpenses / totalIncome) * 100).toFixed(0)}% מההכנסה — שקול לצמצם לפני לקיחת משכנתא.`,
      severity: 'warning',
    });
  }

  if (hasDangerScenarios) {
    const dangerScenario = result.scenarios.find(s => !s.survives);
    if (dangerScenario) {
      recommendations.push({
        icon: '⚡',
        text: `בתרחיש "${dangerScenario.name}" אתה לא שורד. ודא שיש לך תוכנית גיבוי.`,
        severity: 'danger',
      });
    }
  }

  if (recommendations.length === 0) return null;

  const borderColorMap = { safe: "border-safe/20", warning: "border-warning/20", danger: "border-danger/20" };
  const bgColorMap = { safe: "bg-safe/5", warning: "bg-warning/5", danger: "bg-danger/5" };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
      <h3 className="font-heading font-bold text-sm text-foreground mb-1 flex items-center gap-2">
        <span>🎯</span>
        <span>המלצות לשיפור העסקה</span>
      </h3>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3">
        מה אפשר לשנות כדי לשפר את הסיכוי לאישור ולהקטין סיכון
      </p>

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

function DownloadPDFButton({ result, inputs, motivations }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      await generateDealPDF(result, inputs, motivations);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full py-3.5 rounded-xl border border-border/50 bg-card/80 hover:bg-card text-foreground font-heading font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          <span>מכין דוח...</span>
        </>
      ) : (
        <>
          <span>📄</span>
          <span>הורד דוח PDF</span>
        </>
      )}
    </button>
  );
}

export function ResultsDashboard({ result, inputs, motivations }: Props) {
  const cashFlowLevel = result.netCashFlow >= 0 ? "safe" : result.netCashFlow > -1000 ? "warning" : "danger";
  const yieldLevel = result.annualYield >= 5 ? "safe" : result.annualYield >= 3 ? "warning" : "danger";
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burdenPercent = (result.monthlyPayment / totalIncome) * 100;
  const burdenLevel = burdenPercent <= 30 ? "safe" : burdenPercent <= 40 ? "warning" : "danger";

  const cashFlowLabel = inputs.propertyType === 'investment' ? 'תזרים חודשי' : 'כמה זה עולה לך כל חודש';

  return (
    <div className="space-y-4 sm:space-y-5">
      <VerdictBanner result={result} />

      {/* Key metrics — 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <MetricCard
          label="החזר חודשי"
          value={formatNIS(result.monthlyPayment)}
          sub={`${burdenPercent.toFixed(0)}% מההכנסה`}
          level={burdenLevel}
        />
        <MetricCard
          label={cashFlowLabel}
          value={formatNIS(result.netCashFlow)}
          sub="אחרי כל ההוצאות"
          level={cashFlowLevel}
        />
        {inputs.propertyType === "investment" && (
          <MetricCard label="תשואה שנתית" value={`${result.annualYield.toFixed(1)}%`} sub="ברוטו" level={yieldLevel} />
        )}
        <MetricCard
          label="מס רכישה"
          value={formatNIS(result.purchaseTax)}
          sub="כסף שנעלם ביום 1"
          level={result.purchaseTax > 50000 ? "danger" : "neutral"}
        />
      </div>

      {/* Approval score */}
      <ApprovalScoreSection result={result} inputs={inputs} />

      {/* Borrower comparison (only when dual) */}
      {result.borrowerComparison && <BorrowerComparisonSection result={result} />}

      {/* Parent help impact */}
      {inputs.parentHelp && inputs.parentHelpAmount > 0 && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 backdrop-blur-sm p-4 sm:p-5">
          <h3 className="font-heading font-bold text-sm text-foreground mb-2 flex items-center gap-2">
            <span>🤝</span>
            <span>השפעת עזרה מההורים</span>
          </h3>
          <div className="space-y-1.5 text-[13px] sm:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">הון עצמי אישי</span>
              <span className="font-mono font-medium text-foreground">{formatNIS(inputs.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">עזרה מההורים</span>
              <span className="font-mono font-medium text-warning">{formatNIS(inputs.parentHelpAmount)}</span>
            </div>
            <div className="border-t border-border/30 my-1" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">סה״כ הון עצמי זמין</span>
              <span className="font-mono font-bold text-foreground">{formatNIS(inputs.downPayment + inputs.parentHelpAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">אחוז מימון בפועל</span>
              <span className="font-mono font-medium text-foreground">{inputs.financingPercent}%</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-2.5">
            💡 עזרה מההורים מקטינה את סכום ההלוואה, מורידה את אחוז המימון, ומשפרת את סיכויי אישור המשכנתא.
          </p>
        </div>
      )}

      {/* Real cost breakdown */}
      <CostBreakdownSection result={result} />

      {/* Mortgage breakdown */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-foreground mb-2 sm:mb-3">פירוט המשכנתא</h3>
        <div className="space-y-2.5 sm:space-y-3">
          {result.mortgageBreakdown.map((track) => (
            <div key={track.label} className="flex items-start justify-between text-[13px] sm:text-sm gap-2">
              <div className="min-w-0">
                <span className="text-foreground font-medium">{track.label}</span>
                <div className="text-[11px] sm:text-xs text-muted-foreground">{track.desc}</div>
              </div>
              <div className="text-left flex-shrink-0">
                <span className="text-foreground font-medium font-mono">{formatNIS(track.monthly)}/חודש</span>
                <div className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                  {formatNIS(track.amount)} על {track.rate}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning banners */}
      {result.warningBanners.map((banner, i) => (
        <div
          key={i}
          className="rounded-2xl bg-danger/8 border border-danger/20 px-4 sm:px-5 py-3 sm:py-4 text-[13px] sm:text-sm text-danger font-heading font-semibold"
        >
          🚨 {banner}
        </div>
      ))}

      {/* Improvement tips / recommendations */}
      <ImprovementTipsSection result={result} inputs={inputs} />

      {/* Scenarios — always stacked */}
      <div>
        <h3 className="font-heading font-bold text-sm text-foreground mb-1">תרחישי לחץ — מה הטווח האמיתי?</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mb-2.5 sm:mb-3">מהאופטימי ועד הגרוע — כדי שתבין מה באמת אפשרי</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {result.scenarios.map((s) => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </div>

      {/* Psychology insights */}
      {(result.psychologyInsights.length > 0 || motivations.length > 0) && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 backdrop-blur-sm p-4 sm:p-6">
          <h3 className="font-heading font-bold text-sm text-warning mb-2.5 sm:mb-3">🧠 מה באמת מניע אותך?</h3>

          {motivations.length > 0 && (
            <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
              {motivations.map(
                (m) =>
                  MOTIVATION_RESPONSES[m] && (
                    <div
                      key={m}
                      className="text-[13px] sm:text-sm text-foreground bg-background/40 rounded-xl p-3 border border-border/30"
                    >
                      👉 {MOTIVATION_RESPONSES[m]}
                    </div>
                  ),
              )}
            </div>
          )}

          {result.psychologyInsights.map((insight, i) => {
            const severityMap = {
              info: "border-primary/20 bg-primary/5",
              warning: "border-warning/20 bg-warning/5",
              danger: "border-danger/20 bg-danger/5",
            };
            const textMap = {
              info: "text-primary",
              warning: "text-warning",
              danger: "text-danger",
            };

            return (
              <div key={i} className={`rounded-xl p-3 border mb-2 ${severityMap[insight.severity]}`}>
                <div className={`text-[11px] sm:text-xs font-heading font-bold mb-1 ${textMap[insight.severity]}`}>
                  {insight.trigger}
                </div>
                <div className="text-[13px] sm:text-sm text-foreground">{insight.message}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Download PDF */}
      <DownloadPDFButton result={result} inputs={inputs} motivations={motivations} />

      {/* Inline disclaimer */}
      <div className="text-center text-[11px] text-muted-foreground/60 pt-2 border-t border-border/20">
        ⚠️ הערכה בלבד — לא התחייבות הבנק
      </div>
    </div>
  );
}
