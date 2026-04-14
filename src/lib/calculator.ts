export interface PropertyInputs {
  price: number;
  monthlyRent: number;
  propertyType: 'investment' | 'primary';
  downPayment: number;
  monthlyIncome: number;
  cashBuffer: number;
}

export interface MortgageStructure {
  primePercent: number;
  fixedPercent: number;
  variablePercent: number;
  primeRate: number;
  fixedRate: number;
  variableRate: number;
  termYears: number;
}

export interface ScenarioResult {
  name: string;
  monthlyPayment: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashBurn: number;
  survives: boolean;
  monthsBeforeBroke: number | null;
}

export interface AnalysisResult {
  monthlyPayment: number;
  netCashFlow: number;
  annualYield: number;
  riskScore: 'Low' | 'Medium' | 'High';
  verdict: string;
  verdictLevel: 'safe' | 'warning' | 'danger';
  stressLevel: 'Low' | 'Medium' | 'High';
  minRequiredBuffer: number;
  scenarios: ScenarioResult[];
  mortgageBreakdown: { label: string; amount: number; rate: number; monthly: number }[];
}

const STRATEGY_PRESETS = {
  conservative: { prime: 20, fixed: 60, variable: 20 },
  balanced: { prime: 40, fixed: 40, variable: 20 },
  aggressive: { prime: 50, fixed: 20, variable: 30 },
};

export type Strategy = keyof typeof STRATEGY_PRESETS;

export function getStrategyPreset(strategy: Strategy) {
  return STRATEGY_PRESETS[strategy];
}

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcMonthlyExpenses(price: number): number {
  const maintenance = price * 0.01 / 12; // 1% annual
  const vacancy = 0; // handled per scenario
  const repairs = price * 0.005 / 12; // 0.5% annual
  return maintenance + vacancy + repairs;
}

function runScenario(
  name: string,
  inputs: PropertyInputs,
  mortgage: MortgageStructure,
  rateIncrease: number,
  vacancyMonths: number,
  unexpectedRepair: number
): ScenarioResult {
  const loanAmount = inputs.price - inputs.downPayment;

  const primeAmount = loanAmount * mortgage.primePercent / 100;
  const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
  const variableAmount = loanAmount * mortgage.variablePercent / 100;

  const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate + rateIncrease, mortgage.termYears);
  const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
  const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate + rateIncrease, mortgage.termYears);

  const monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
  const monthlyExpenses = calcMonthlyExpenses(inputs.price);
  const effectiveRent = inputs.monthlyRent * (12 - vacancyMonths) / 12;
  const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;

  const annualCashBurn = monthlyCashFlow < 0 ? Math.abs(monthlyCashFlow) * 12 + unexpectedRepair : -monthlyCashFlow * 12 + unexpectedRepair;
  
  let monthsBeforeBroke: number | null = null;
  let survives = true;

  if (monthlyCashFlow < 0) {
    const availableCash = inputs.cashBuffer - unexpectedRepair;
    if (availableCash <= 0) {
      monthsBeforeBroke = 0;
      survives = false;
    } else {
      monthsBeforeBroke = Math.floor(availableCash / Math.abs(monthlyCashFlow));
      survives = monthsBeforeBroke >= 12;
    }
  }

  return {
    name,
    monthlyPayment,
    monthlyRent: effectiveRent,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashBurn: monthlyCashFlow < 0 ? Math.abs(monthlyCashFlow) * 12 + unexpectedRepair : unexpectedRepair,
    survives,
    monthsBeforeBroke,
  };
}

export function analyze(inputs: PropertyInputs, mortgage: MortgageStructure): AnalysisResult {
  const loanAmount = inputs.price - inputs.downPayment;

  const primeAmount = loanAmount * mortgage.primePercent / 100;
  const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
  const variableAmount = loanAmount * mortgage.variablePercent / 100;

  const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate, mortgage.termYears);
  const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
  const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate, mortgage.termYears);

  const monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
  const monthlyExpenses = calcMonthlyExpenses(inputs.price);
  const netCashFlow = inputs.monthlyRent - monthlyPayment - monthlyExpenses;
  const annualYield = ((inputs.monthlyRent * 12 - monthlyExpenses * 12) / inputs.price) * 100;

  const mortgageBreakdown = [
    { label: 'Prime (Variable)', amount: primeAmount, rate: mortgage.primeRate, monthly: primeMonthly },
    { label: 'Fixed Non-Indexed', amount: fixedAmount, rate: mortgage.fixedRate, monthly: fixedMonthly },
    { label: 'Variable', amount: variableAmount, rate: mortgage.variableRate, monthly: variableMonthly },
  ];

  // Scenarios
  const baseCase = runScenario('Base Case', inputs, mortgage, 0, 1, 0);
  const badCase = runScenario('Bad Scenario', inputs, mortgage, 1.5, 2, 0);
  const worstCase = runScenario('Worst Case', inputs, mortgage, 3, 3.5, 20000);

  const scenarios = [baseCase, badCase, worstCase];

  // Risk assessment
  let riskPoints = 0;
  const ltv = loanAmount / inputs.price;
  if (ltv > 0.75) riskPoints += 2;
  else if (ltv > 0.6) riskPoints += 1;

  if (netCashFlow < 0) riskPoints += 2;
  else if (netCashFlow < 500) riskPoints += 1;

  if (!badCase.survives) riskPoints += 3;
  else if (!worstCase.survives) riskPoints += 2;

  if (inputs.cashBuffer < monthlyPayment * 6) riskPoints += 2;
  else if (inputs.cashBuffer < monthlyPayment * 12) riskPoints += 1;

  const monthlyBurden = monthlyPayment / inputs.monthlyIncome;
  if (monthlyBurden > 0.4) riskPoints += 2;
  else if (monthlyBurden > 0.3) riskPoints += 1;

  const riskScore: 'Low' | 'Medium' | 'High' = riskPoints <= 3 ? 'Low' : riskPoints <= 6 ? 'Medium' : 'High';

  // Verdict
  let verdict: string;
  let verdictLevel: 'safe' | 'warning' | 'danger';

  if (riskScore === 'Low' && worstCase.survives) {
    verdict = 'Safe investment — you can survive even the worst case.';
    verdictLevel = 'safe';
  } else if (riskScore === 'Medium' || (riskScore === 'Low' && !worstCase.survives)) {
    verdict = 'Borderline — high risk. Proceed only with significant reserves.';
    verdictLevel = 'warning';
  } else {
    verdict = 'Not recommended — this deal doesn\'t survive stress scenarios.';
    verdictLevel = 'danger';
  }

  const stressLevel = riskScore;
  const minRequiredBuffer = Math.max(monthlyPayment * 12 + 20000, worstCase.annualCashBurn * 1.5);

  return {
    monthlyPayment,
    netCashFlow,
    annualYield,
    riskScore,
    verdict,
    verdictLevel,
    stressLevel,
    minRequiredBuffer,
    scenarios,
    mortgageBreakdown,
  };
}
