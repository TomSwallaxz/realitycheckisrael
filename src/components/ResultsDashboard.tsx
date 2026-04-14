import { AnalysisResult, PropertyInputs } from '@/lib/calculator';

interface Props {
  result: AnalysisResult;
  inputs: PropertyInputs;
}

function formatCurrency(n: number): string {
  return '₪' + Math.round(n).toLocaleString();
}

function VerdictBanner({ result }: { result: AnalysisResult }) {
  const bgMap = {
    safe: 'bg-safe/10 border-safe/30',
    warning: 'bg-warning/10 border-warning/30',
    danger: 'bg-danger/10 border-danger/30',
  };
  const textMap = {
    safe: 'text-safe',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <div className={`rounded-lg border p-5 ${bgMap[result.verdictLevel]}`}>
      <div className={`font-heading font-bold text-lg ${textMap[result.verdictLevel]}`}>
        {result.verdict}
      </div>
      <div className="flex gap-6 mt-3 text-sm">
        <div>
          <span className="text-muted-foreground">Risk: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{result.riskScore}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Stress: </span>
          <span className={`font-semibold ${textMap[result.verdictLevel]}`}>{result.stressLevel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Min Buffer: </span>
          <span className="font-semibold text-foreground">{formatCurrency(result.minRequiredBuffer)}</span>
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground font-heading uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-heading font-bold mt-1 ${colorMap[level || 'neutral']}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ scenario, cashBuffer }: {
  scenario: AnalysisResult['scenarios'][0];
  cashBuffer: number;
}) {
  const level = scenario.survives
    ? scenario.monthlyCashFlow >= 0 ? 'safe' : 'warning'
    : 'danger';

  const borderMap = {
    safe: 'border-safe/30',
    warning: 'border-warning/30',
    danger: 'border-danger/30',
  };
  const bgMap = {
    safe: 'bg-safe/5',
    warning: 'bg-warning/5',
    danger: 'bg-danger/5',
  };
  const textMap = {
    safe: 'text-safe',
    warning: 'text-warning',
    danger: 'text-danger',
  };
  const dotMap = {
    safe: 'bg-safe',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={`rounded-lg border p-4 ${borderMap[level]} ${bgMap[level]}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${dotMap[level]}`} />
        <span className="font-heading font-semibold text-sm text-foreground">{scenario.name}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Monthly Payment</span>
          <span className="text-foreground font-medium">{formatCurrency(scenario.monthlyPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effective Rent</span>
          <span className="text-foreground font-medium">{formatCurrency(scenario.monthlyRent)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Expenses</span>
          <span className="text-foreground font-medium">{formatCurrency(scenario.monthlyExpenses)}</span>
        </div>
        <div className="border-t border-border my-1" />
        <div className="flex justify-between font-semibold">
          <span className="text-muted-foreground">Cash Flow</span>
          <span className={textMap[level]}>{formatCurrency(scenario.monthlyCashFlow)}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Annual Cash Burn</span>
          <span className="text-foreground">{formatCurrency(scenario.annualCashBurn)}</span>
        </div>
      </div>

      <div className={`mt-3 rounded-md px-3 py-2 text-xs font-heading font-semibold ${
        scenario.survives
          ? 'bg-safe/10 text-safe'
          : 'bg-danger/10 text-danger'
      }`}>
        {scenario.survives
          ? scenario.monthlyCashFlow >= 0
            ? '✓ Positive cash flow'
            : `⚠ Survives ~${scenario.monthsBeforeBroke} months on buffer`
          : scenario.monthsBeforeBroke === 0
            ? '✗ Broke immediately'
            : `✗ Broke in ${scenario.monthsBeforeBroke} months`
        }
      </div>
    </div>
  );
}

export function ResultsDashboard({ result, inputs }: Props) {
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
          label="Monthly Payment"
          value={formatCurrency(result.monthlyPayment)}
          sub={`${burdenPercent.toFixed(0)}% of income`}
          level={burdenLevel}
        />
        <MetricCard
          label="Net Cash Flow"
          value={formatCurrency(result.netCashFlow)}
          sub="After all expenses"
          level={cashFlowLevel}
        />
        <MetricCard
          label="Gross Yield"
          value={`${result.annualYield.toFixed(1)}%`}
          sub="Annual return"
          level={yieldLevel}
        />
        <MetricCard
          label="Risk Score"
          value={result.riskScore}
          level={result.verdictLevel}
        />
      </div>

      {/* Mortgage breakdown */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-3">
          Mortgage Breakdown
        </h3>
        <div className="space-y-2">
          {result.mortgageBreakdown.map(track => (
            <div key={track.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{track.label}</span>
              <div className="text-right">
                <span className="text-foreground font-medium">{formatCurrency(track.monthly)}/mo</span>
                <span className="text-muted-foreground ml-2">({formatCurrency(track.amount)} @ {track.rate}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div>
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-3">
          Stress Scenarios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.scenarios.map(s => (
            <ScenarioCard key={s.name} scenario={s} cashBuffer={inputs.cashBuffer} />
          ))}
        </div>
      </div>
    </div>
  );
}
