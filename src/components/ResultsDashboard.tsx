import { AnalysisResult, PropertyInputs, formatNIS } from '@/lib/calculator';

interface Props {
  result: AnalysisResult;
  inputs: PropertyInputs;
  motivations: string[];
}

const MOTIVATION_RESPONSES: Record<string, string> = {
  family_pressure: 'לחץ מהמשפחה זה לא סיבה לקנות דירה. זו ההחלטה הכלכלית הגדולה ביותר שלך — לא שלהם.',
  fomo: '״המחירים יעלו״ — אולי. אבל אם העסקה לא עומדת בפני עצמה היום, היא לא תעמוד מחר.',
  stability: 'יציבות זה לגיטימי. אבל יציבות עם חוב כבד זה לא באמת יציבות.',
  investment: 'תשואה טובה על נדל״ן? אולי. אבל תבדוק את המספרים — לא את הסיפורים.',
  status: 'דירה משלך = הצלחה? בדוק שוב. הצלחה זה שקט נפשי, לא משכנתא.',
  rent_waste: '״שכירות זה בזבוז״ — מיתוס. גם ריבית, מס רכישה, ותחזוקה הם ״בזבוז״.',
};

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const bgMap = {
    safe: 'bg-safe/8 border-safe/20',
    warning: 'bg-warning/8 border-warning/20',
    danger: 'bg-danger/8 border-danger/20',
  };
  const textMap = {
    safe: 'text-safe',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-sm ${bgMap[result.verdictLevel]}`}>
      <div className={`font-heading font-extrabold text-xl ${textMap[result.verdictLevel]}`}>
        {result.verdict}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
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

function MetricCard({ label, value, sub, level }: {
  label: string;
  value: string;
  sub?: string;
  level?: 'safe' | 'warning' | 'danger' | 'neutral';
}) {
  const colorMap = {
    safe: 'text-safe',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-foreground',
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 shadow-sm">
      <div className="text-xs text-muted-foreground font-heading">{label}</div>
      <div className={`text-2xl font-heading font-bold mt-1 font-mono ${colorMap[level || 'neutral']}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ scenario }: {
  scenario: AnalysisResult['scenarios'][0];
}) {
  const level = scenario.survives
    ? scenario.monthlyCashFlow >= 0 ? 'safe' : 'warning'
    : 'danger';

  const borderMap = { safe: 'border-safe/20', warning: 'border-warning/20', danger: 'border-danger/20' };
  const bgMap = { safe: 'bg-safe/5', warning: 'bg-warning/5', danger: 'bg-danger/5' };
  const textMap = { safe: 'text-safe', warning: 'text-warning', danger: 'text-danger' };
  const dotMap = { safe: 'bg-safe', warning: 'bg-warning', danger: 'bg-danger' };

  return (
    <div className={`rounded-2xl border p-4 backdrop-blur-sm ${borderMap[level]} ${bgMap[level]}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${dotMap[level]}`} />
        <span className="font-heading font-bold text-sm text-foreground">{scenario.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>

      <div className="space-y-2 text-sm">
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

      <div className={`mt-3 rounded-xl px-3 py-2 text-xs font-heading font-bold ${
        scenario.survives
          ? scenario.monthlyCashFlow >= 0
            ? 'bg-safe/10 text-safe'
            : 'bg-warning/10 text-warning'
          : 'bg-danger/10 text-danger'
      }`}>
        {scenario.survives
          ? scenario.monthlyCashFlow >= 0
            ? '✓ תזרים חיובי'
            : `⚠ שורד ~${scenario.monthsBeforeBroke} חודשים על כרית הביטחון`
          : scenario.monthsBeforeBroke === 0
            ? '✗ נגמר הכסף מיד'
            : `✗ נשבר אחרי ${scenario.monthsBeforeBroke} חודשים`
        }
      </div>
    </div>
  );
}

export function ResultsDashboard({ result, inputs, motivations }: Props) {
  const cashFlowLevel = result.netCashFlow >= 0 ? 'safe' : result.netCashFlow > -1000 ? 'warning' : 'danger';
  const yieldLevel = result.annualYield >= 5 ? 'safe' : result.annualYield >= 3 ? 'warning' : 'danger';
  const burdenPercent = (result.monthlyPayment / inputs.monthlyIncome * 100);
  const burdenLevel = burdenPercent <= 30 ? 'safe' : burdenPercent <= 40 ? 'warning' : 'danger';

  return (
    <div className="space-y-5">
      <VerdictBanner result={result} />

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="החזר חודשי"
          value={formatNIS(result.monthlyPayment)}
          sub={`${burdenPercent.toFixed(0)}% מההכנסה`}
          level={burdenLevel}
        />
        <MetricCard
          label="תזרים נטו"
          value={formatNIS(result.netCashFlow)}
          sub="אחרי כל ההוצאות"
          level={cashFlowLevel}
        />
        {inputs.propertyType === 'investment' && (
          <MetricCard
            label="תשואה שנתית"
            value={`${result.annualYield.toFixed(1)}%`}
            sub="ברוטו"
            level={yieldLevel}
          />
        )}
        <MetricCard
          label="מס רכישה"
          value={formatNIS(result.purchaseTax)}
          sub="כסף שנעלם ביום 1"
          level={result.purchaseTax > 50000 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Real cost */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-foreground mb-1">
          העלות האמיתית — לא רק המשכנתא
        </h3>
        <p className="text-xs text-muted-foreground mb-3">הון עצמי + מס רכישה + עלויות נלוות</p>
        <div className="text-2xl font-heading font-bold text-foreground font-mono">
          {formatNIS(result.totalRealCost)}
        </div>
      </div>

      {/* Mortgage breakdown */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-foreground mb-3">
          פירוט המשכנתא
        </h3>
        <div className="space-y-3">
          {result.mortgageBreakdown.map(track => (
            <div key={track.label} className="flex items-start justify-between text-sm">
              <div>
                <span className="text-foreground font-medium">{track.label}</span>
                <div className="text-xs text-muted-foreground">{track.desc}</div>
              </div>
              <div className="text-left">
                <span className="text-foreground font-medium font-mono">{formatNIS(track.monthly)}/חודש</span>
                <div className="text-xs text-muted-foreground font-mono">{formatNIS(track.amount)} @ {track.rate}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning banners - shown after data, not before */}
      {result.warningBanners.map((banner, i) => (
        <div key={i} className="rounded-2xl bg-danger/8 border border-danger/20 px-5 py-4 text-sm text-danger font-heading font-semibold">
          🚨 {banner}
        </div>
      ))}

      {/* Scenarios */}
      <div>
        <h3 className="font-heading font-bold text-sm text-foreground mb-1">
          תרחישי לחץ — מה קורה כשדברים משתבשים?
        </h3>
        <p className="text-xs text-muted-foreground mb-3">זה לא ״אם״ — זה ״מתי״</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.scenarios.map(s => (
            <ScenarioCard key={s.name} scenario={s} />
          ))}
        </div>
      </div>

      {/* Psychology insights */}
      {(result.psychologyInsights.length > 0 || motivations.length > 0) && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 backdrop-blur-sm p-6">
          <h3 className="font-heading font-bold text-sm text-warning mb-3">
            🧠 מה באמת מניע אותך?
          </h3>

          {motivations.length > 0 && (
            <div className="space-y-3 mb-4">
              {motivations.map(m => MOTIVATION_RESPONSES[m] && (
                <div key={m} className="text-sm text-foreground bg-background/40 rounded-xl p-3 border border-border/30">
                  👉 {MOTIVATION_RESPONSES[m]}
                </div>
              ))}
            </div>
          )}

          {result.psychologyInsights.map((insight, i) => {
            const severityMap = {
              info: 'border-primary/20 bg-primary/5',
              warning: 'border-warning/20 bg-warning/5',
              danger: 'border-danger/20 bg-danger/5',
            };
            const textMap = {
              info: 'text-primary',
              warning: 'text-warning',
              danger: 'text-danger',
            };

            return (
              <div key={i} className={`rounded-xl p-3 border mb-2 ${severityMap[insight.severity]}`}>
                <div className={`text-xs font-heading font-bold mb-1 ${textMap[insight.severity]}`}>
                  {insight.trigger}
                </div>
                <div className="text-sm text-foreground">
                  {insight.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
