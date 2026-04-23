// Centralized default rates — example values for illustration only
export const DEFAULT_RATES = {
  primeRate: 6.0,
  fixedRate: 5.5,
  variableRate: 5.0,
} as const;

export type BorrowerMode = 'single' | 'dual';

export type MortgageMode = 'simple' | 'advanced';

export type TrackType = 'prime' | 'fixed' | 'variable';

export interface CustomTrack {
  id: string;
  type: TrackType;
  amount: number;
  rate: number;
  termYears: number;
}

export interface PropertyInputs {
  price: number;
  monthlyRent: number;
  propertyType: 'investment' | 'primary';
  downPayment: number;
  financingPercent: number;
  monthlyIncome: number;
  fixedMonthlyExpenses: number;
  cashBuffer: number;
  region: string;
  isFirstApartment: boolean;
  parentHelp: boolean;
  parentHelpAmount: number;
  borrowerMode: BorrowerMode;
  secondBorrowerIncome: number;
  altRent?: number;
  // ----- Editable transaction costs (NEW) -----
  brokerFeePercent?: number;     // default 2
  lawyerFeePercent?: number;     // default 0.5
  lawyerFeeFixed?: number;       // optional override (₪)
  appraiserFee?: number;         // default 3000
  renovationCost?: number;       // default 0
  extraCosts?: number;           // default 0
  // ----- Recurring housing costs (for fair rent vs mortgage compare) -----
  monthlyHousingMaintenance?: number; // owner: vaad bayit + insurance + maintenance reserve
  altRentMaintenance?: number;        // renter: vaad bayit + recurring costs
}

/** Split a single mortgage monthly payment into interest and principal for the FIRST month */
export function calcFirstMonthSplit(
  loanAmount: number,
  monthlyPayment: number,
  weightedAnnualRatePct: number
): { interest: number; principal: number } {
  const monthlyRate = weightedAnnualRatePct / 100 / 12;
  const interest = loanAmount * monthlyRate;
  const principal = Math.max(0, monthlyPayment - interest);
  return { interest, principal };
}

export interface MortgageStructure {
  primePercent: number;
  fixedPercent: number;
  variablePercent: number;
  primeRate: number;
  fixedRate: number;
  variableRate: number;
  termYears: number;
  // Advanced mode
  mode?: MortgageMode;
  customTracks?: CustomTrack[];
}

export interface ScenarioResult {
  name: string;
  description: string;
  monthlyPayment: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashBurn: number;
  survives: boolean;
  monthsBeforeBroke: number | null;
}

export interface PsychologyInsight {
  trigger: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface BorrowerComparison {
  single: { totalIncome: number; burdenPercent: number; riskLevel: 'safe' | 'warning' | 'danger'; monthlyRemaining: number };
  dual: { totalIncome: number; burdenPercent: number; riskLevel: 'safe' | 'warning' | 'danger'; monthlyRemaining: number };
  savedRiskPoints: number;
  extraMonthly: number;
  insight: string;
}

export interface ApprovalScore {
  score: number;
  level: 'safe' | 'warning' | 'danger';
  label: string;
  singleScore: number; // score without dual borrower
  improvement: number; // how much dual borrower adds
  tips: { action: string; points: number }[];
  insight: string;
}

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface RiskIndicator {
  key: 'repayment' | 'buffer' | 'entry';
  level: RiskLevel;
  value: number;        // primary measured value (% or ratio)
  label: string;        // human label e.g. "Safe", "Borderline", "Risky"
  detail: string;       // short numeric detail
}

export interface RiskAssessment {
  indicators: RiskIndicator[];
  finalLevel: RiskLevel;
  finalLabel: string;
  reasons: { text: string; impact: 'positive' | 'negative' | 'neutral' }[];
  improvements: string[];
}

export interface AnalysisResult {
  monthlyPayment: number;
  netCashFlow: number;
  annualYield: number;
  riskScore: 'נמוך' | 'בינוני' | 'גבוה';
  verdict: string;
  verdictLevel: 'safe' | 'warning' | 'danger';
  stressLevel: 'נמוך' | 'בינוני' | 'גבוה';
  minRequiredBuffer: number;
  purchaseTax: number;
  totalRealCost: number;
  costBreakdown: { label: string; amount: number }[];
  scenarios: ScenarioResult[];
  mortgageBreakdown: { label: string; amount: number; rate: number; monthly: number; desc: string }[];
  psychologyInsights: PsychologyInsight[];
  warningBanners: string[];
  borrowerComparison?: BorrowerComparison;
  approvalScore: ApprovalScore;
  termYears: number;
  loanAmount: number;
  riskAssessment: RiskAssessment;
  weightedAnnualRate: number;
  monthlyHousingMaintenance: number;
}

export const REGIONS = [
  'מרכז (תל אביב, גוש דן)',
  'ירושלים',
  'חיפה והצפון',
  'באר שבע והדרום',
  'השרון',
  'שפלה',
  'אחר',
];

export type Strategy = 'conservative' | 'balanced' | 'aggressive';

const STRATEGY_PRESETS = {
  conservative: { prime: 30, fixed: 60, variable: 10 },
  balanced: { prime: 40, fixed: 40, variable: 20 },
  aggressive: { prime: 50, fixed: 20, variable: 30 },
};

export const STRATEGY_INFO: Record<Strategy, { label: string; desc: string }> = {
  conservative: { label: 'שמרני', desc: 'שקט נפשי — רוב קבועה' },
  balanced: { label: 'מאוזן', desc: 'חלוקה סטנדרטית' },
  aggressive: { label: 'אגרסיבי', desc: 'יותר פריים ומשתנה' },
};

export function getStrategyPreset(strategy: Strategy) {
  return STRATEGY_PRESETS[strategy];
}

/** Israeli purchase tax (mas rechisha) - simplified 2024 rates */
function calcPurchaseTax(price: number, isFirstApartment: boolean): number {
  if (isFirstApartment) {
    // First apartment - exempt up to ~1,919,155, then 3.5% up to ~2,271,560, then 5%, etc.
    if (price <= 1919155) return 0;
    if (price <= 2271560) return (price - 1919155) * 0.035;
    if (price <= 5872725) return (2271560 - 1919155) * 0.035 + (price - 2271560) * 0.05;
    return (2271560 - 1919155) * 0.035 + (5872725 - 2271560) * 0.05 + (price - 5872725) * 0.08;
  } else {
    // Not first apartment (investment) - 8% up to ~5,872,725, then 10%
    if (price <= 5872725) return price * 0.08;
    return 5872725 * 0.08 + (price - 5872725) * 0.10;
  }
}

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcPropertyExpenses(price: number): number {
  const maintenance = price * 0.01 / 12;
  const repairs = price * 0.005 / 12;
  return maintenance + repairs;
}

function runScenario(
  name: string,
  description: string,
  inputs: PropertyInputs,
  mortgage: MortgageStructure,
  rateIncrease: number,
  vacancyMonths: number,
  unexpectedRepair: number
): ScenarioResult {
  const parentContribution = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const loanAmount = inputs.price - inputs.downPayment - parentContribution;

  const primeAmount = loanAmount * mortgage.primePercent / 100;
  const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
  const variableAmount = loanAmount * mortgage.variablePercent / 100;

  const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate + rateIncrease, mortgage.termYears);
  const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
  const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate + rateIncrease, mortgage.termYears);

  const monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
  const propertyExpenses = calcPropertyExpenses(inputs.price);
  const monthlyExpenses = propertyExpenses + inputs.fixedMonthlyExpenses;
  const effectiveRent = inputs.propertyType === 'primary' ? 0 : inputs.monthlyRent * (12 - vacancyMonths) / 12;
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const monthlyCashFlow = effectiveRent + totalIncome - monthlyPayment - monthlyExpenses;

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
    description,
    monthlyPayment,
    monthlyRent: effectiveRent,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashBurn: monthlyCashFlow < 0 ? Math.abs(monthlyCashFlow) * 12 + unexpectedRepair : unexpectedRepair,
    survives,
    monthsBeforeBroke,
  };
}

function generatePsychologyInsights(inputs: PropertyInputs, result: Omit<AnalysisResult, 'psychologyInsights' | 'warningBanners'>): PsychologyInsight[] {
  const insights: PsychologyInsight[] = [];
  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  const burden = result.monthlyPayment / totalIncome;
  if (burden > 0.4) {
    insights.push({
      trigger: 'עומס כלכלי',
      message: 'אתה מתכנן להקדיש יותר מ-40% מההכנסה למשכנתא. זה לא ״קצת לחוץ״ — זה לחיות על הקצה.',
      severity: 'danger',
    });
  } else if (burden > 0.3) {
    insights.push({
      trigger: 'עומס גבולי',
      message: 'אתה ב-30%+ מההכנסה על משכנתא. זה אפשרי, אבל כל הוצאה לא צפויה תכאיב.',
      severity: 'warning',
    });
  }

  if (inputs.parentHelp) {
    insights.push({
      trigger: 'עזרה מההורים',
      message: 'אם אתה צריך עזרה מההורים כדי לקנות — שאל את עצמך אם אתה באמת מוכן לעסקה הזו.',
      severity: 'info',
    });
  }

  if (inputs.cashBuffer < result.monthlyPayment * 6) {
    insights.push({
      trigger: 'כרית ביטחון דקה',
      message: 'אין לך מספיק כסף בצד. אם משהו ישתבש — ואין ״אם״, יהיה ״מתי״ — אתה בבעיה.',
      severity: 'danger',
    });
  }

  if (inputs.propertyType === 'investment' && result.annualYield < 3) {
    insights.push({
      trigger: 'תשואה נמוכה',
      message: 'תשואה של פחות מ-3% זה פחות ממה שתקבל בפיקדון בנקאי. בטוח שזו ״השקעה״?',
      severity: 'warning',
    });
  }

  const ltv = (inputs.price - inputs.downPayment - ((inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0)) / inputs.price;
  if (ltv > 0.7) {
    insights.push({
      trigger: 'מינוף גבוה',
      message: 'אתה ממנף יותר מ-70% מערך הנכס. ירידת מחירים של 10% תשאיר אותך עם חוב גדול מהנכס.',
      severity: 'danger',
    });
  }

  return insights;
}

function generateWarningBanners(inputs: PropertyInputs, result: Omit<AnalysisResult, 'psychologyInsights' | 'warningBanners'>): string[] {
  const banners: string[] = [];

  if (inputs.cashBuffer < 50000) {
    banners.push('🚨 אם אין לך לפחות 50,000₪ בצד — אתה נכנס לסיכון גבוה מאוד');
  }

  if (!result.scenarios[3].survives) {
    banners.push('⚠️ אתה לא שורד את התרחיש הגרוע. מה תעשה כשזה יקרה?');
  }

  const totalIncome = inputs.borrowerMode === 'dual' ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  if (result.monthlyPayment / totalIncome > 0.45) {
    banners.push('🔴 יותר מ-45% מההכנסה שלך הולכת למשכנתא. הבנק אולי יאשר — אבל החיים לא');
  }


  return banners;
}

export function analyze(inputs: PropertyInputs, mortgage: MortgageStructure): AnalysisResult {
  const totalIncome = inputs.borrowerMode === 'dual'
    ? inputs.monthlyIncome + inputs.secondBorrowerIncome
    : inputs.monthlyIncome;

  // Effective down payment includes parent help
  const parentContribution = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const effectiveDownPayment = inputs.downPayment + parentContribution;

  const loanAmount = inputs.price - effectiveDownPayment;

  // ---- Mortgage payment: simple OR advanced ----
  const isAdvanced = mortgage.mode === 'advanced' && (mortgage.customTracks?.length ?? 0) > 0;
  let monthlyPayment = 0;
  let mortgageBreakdown: { label: string; amount: number; rate: number; monthly: number; desc: string }[] = [];
  let weightedAnnualRate = 0;
  let effectiveTermYears = mortgage.termYears;

  if (isAdvanced) {
    const tracks = mortgage.customTracks!;
    const trackLabels: Record<TrackType, string> = { prime: 'פריים', fixed: 'קבועה', variable: 'משתנה' };
    const trackDescs: Record<TrackType, string> = {
      prime: 'זול אבל מסוכן — עולה עם הריבית',
      fixed: 'יקר אבל יציב — שקט נפשי',
      variable: 'זול בהתחלה, לא צפוי',
    };
    let weightedSum = 0;
    let totalAmt = 0;
    let maxYears = 0;
    mortgageBreakdown = tracks.map(t => {
      const m = calcMonthlyPayment(t.amount, t.rate, t.termYears);
      monthlyPayment += m;
      weightedSum += t.amount * t.rate;
      totalAmt += t.amount;
      if (t.termYears > maxYears) maxYears = t.termYears;
      return {
        label: `${trackLabels[t.type]} (${t.termYears} שנ׳)`,
        amount: t.amount,
        rate: t.rate,
        monthly: m,
        desc: trackDescs[t.type],
      };
    });
    weightedAnnualRate = totalAmt > 0 ? weightedSum / totalAmt : 0;
    effectiveTermYears = maxYears || mortgage.termYears;
  } else {
    const primeAmount = loanAmount * mortgage.primePercent / 100;
    const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
    const variableAmount = loanAmount * mortgage.variablePercent / 100;
    const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate, mortgage.termYears);
    const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
    const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate, mortgage.termYears);
    monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
    mortgageBreakdown = [
      { label: 'פריים', amount: primeAmount, rate: mortgage.primeRate, monthly: primeMonthly, desc: 'זול אבל מסוכן — עולה עם הריבית' },
      { label: 'קבועה לא צמודה', amount: fixedAmount, rate: mortgage.fixedRate, monthly: fixedMonthly, desc: 'יקר אבל יציב — שקט נפשי' },
      { label: 'משתנה', amount: variableAmount, rate: mortgage.variableRate, monthly: variableMonthly, desc: 'זול בהתחלה, לא צפוי' },
    ];
    weightedAnnualRate = loanAmount > 0
      ? (primeAmount * mortgage.primeRate + fixedAmount * mortgage.fixedRate + variableAmount * mortgage.variableRate) / loanAmount
      : 0;
  }

  const propertyExpenses = calcPropertyExpenses(inputs.price);
  const monthlyHousingMaintenance = Math.max(0, inputs.monthlyHousingMaintenance ?? 0);
  const monthlyExpenses = propertyExpenses + inputs.fixedMonthlyExpenses;
  const effectiveRent = inputs.propertyType === 'primary' ? 0 : inputs.monthlyRent;
  const netCashFlow = effectiveRent + totalIncome - monthlyPayment - monthlyExpenses;
  const annualYield = inputs.propertyType === 'primary' || inputs.price <= 0 ? 0 :
    (inputs.monthlyRent * 12 / inputs.price) * 100;

  const purchaseTax = calcPurchaseTax(inputs.price, inputs.isFirstApartment);
  const brokerPct = inputs.brokerFeePercent ?? 2;
  const lawyerPct = inputs.lawyerFeePercent ?? 0.5;
  const lawyerFee = inputs.lawyerFeeFixed && inputs.lawyerFeeFixed > 0
    ? inputs.lawyerFeeFixed
    : Math.max(5000, inputs.price * (lawyerPct / 100));
  const brokerFee = inputs.price * (brokerPct / 100);
  const appraiserFee = inputs.appraiserFee ?? 3000;
  const renovationCost = Math.max(0, inputs.renovationCost ?? 0);
  const extraCosts = Math.max(0, inputs.extraCosts ?? 0);
  const totalRealCost = effectiveDownPayment + purchaseTax + lawyerFee + brokerFee + appraiserFee + renovationCost + extraCosts;
  const costBreakdown: { label: string; amount: number }[] = [
    { label: 'סה״כ הון עצמי', amount: effectiveDownPayment },
    ...(parentContribution > 0
      ? [
          { label: '  ↳ שלך', amount: inputs.downPayment },
          { label: '  ↳ עזרה מההורים', amount: parentContribution },
        ]
      : []),
    { label: 'מס רכישה', amount: purchaseTax },
    { label: `עו״ד${inputs.lawyerFeeFixed ? '' : ` (${lawyerPct}%)`}`, amount: lawyerFee },
    { label: `תיווך (${brokerPct}%)`, amount: brokerFee },
    { label: 'שמאי', amount: appraiserFee },
    ...(renovationCost > 0 ? [{ label: 'שיפוץ / ריהוט', amount: renovationCost }] : []),
    ...(extraCosts > 0 ? [{ label: 'עלויות נוספות', amount: extraCosts }] : []),
  ];

  const isInvestment = inputs.propertyType === 'investment';
  const optimisticCase = runScenario(
    'מצב אופטימי',
    isInvestment ? 'שכירות מלאה, ללא תקופות ריקות, ללא תיקונים' : 'יציבות מלאה, ללא הפתעות',
    inputs, mortgage, 0, 0, 0
  );
  const baseCase = runScenario(
    'המצב הסביר',
    isInvestment ? 'חודש ריק אחד בשנה, ריבית יציבה' : 'החזר חודשי רגיל, תחזוקה שוטפת',
    inputs, mortgage, 0, isInvestment ? 1 : 0, 0
  );
  const badCase = runScenario(
    'מצב רע',
    isInvestment ? '2 חודשים ריקים, ריבית +1.5%' : 'ריבית עולה ב-1.5%, תיקון ₪10K',
    inputs, mortgage, 1.5, isInvestment ? 2 : 0, isInvestment ? 0 : 10000
  );
  const worstCase = runScenario(
    'מצב גרוע מאוד',
    isInvestment ? '3.5 חודשים ללא שוכר, ריבית +3%, תיקון ₪25K' : 'ריבית +3%, תיקון גדול ₪25K',
    inputs, mortgage, 3, isInvestment ? 3.5 : 0, 25000
  );

  const scenarios = [optimisticCase, baseCase, badCase, worstCase];

  // Risk assessment — use totalIncome
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

  const monthlyBurden = monthlyPayment / totalIncome;
  if (monthlyBurden > 0.4) riskPoints += 2;
  else if (monthlyBurden > 0.3) riskPoints += 1;

  if (inputs.propertyType === 'primary') riskPoints += 1;

  // Dual borrower risk adjustment: reduce risk by ~12%
  if (inputs.borrowerMode === 'dual' && inputs.secondBorrowerIncome > 0) {
    riskPoints = Math.max(0, Math.round(riskPoints * 0.88));
  }

  const riskScore = riskPoints <= 3 ? 'נמוך' as const : riskPoints <= 6 ? 'בינוני' as const : 'גבוה' as const;

  let verdict: string;
  let verdictLevel: 'safe' | 'warning' | 'danger';

  if (riskScore === 'נמוך' && worstCase.survives) {
    verdict = 'יציב יחסית — אבל אל תירדם על המשמר';
    verdictLevel = 'safe';
  } else if (riskScore === 'בינוני' || (riskScore === 'נמוך' && !worstCase.survives)) {
    verdict = 'גבולי — דורש כרית ביטחון גבוהה. תחשוב פעמיים.';
    verdictLevel = 'warning';
  } else {
    verdict = 'עסקה מסוכנת — אתה על הקצה. לא מומלץ.';
    verdictLevel = 'danger';
  }

  const stressLevel = riskScore;
  const minRequiredBuffer = Math.max(monthlyPayment * 12 + 25000, worstCase.annualCashBurn * 1.5);

  // Borrower comparison
  let borrowerComparison: BorrowerComparison | undefined;
  if (inputs.borrowerMode === 'dual' && inputs.secondBorrowerIncome > 0) {
    const singleIncome = inputs.monthlyIncome;
    const dualIncome = totalIncome;
    const singleBurden = (monthlyPayment / singleIncome) * 100;
    const dualBurden = (monthlyPayment / dualIncome) * 100;
    const singleRemaining = singleIncome - monthlyPayment - monthlyExpenses;
    const dualRemaining = dualIncome - monthlyPayment - monthlyExpenses;
    const getRiskLevel = (b: number): 'safe' | 'warning' | 'danger' =>
      b <= 30 ? 'safe' : b <= 40 ? 'warning' : 'danger';

    // Estimate risk points for single
    let singleRiskPoints = 0;
    if (ltv > 0.75) singleRiskPoints += 2; else if (ltv > 0.6) singleRiskPoints += 1;
    if (netCashFlow < 0) singleRiskPoints += 2; else if (netCashFlow < 500) singleRiskPoints += 1;
    if (!badCase.survives) singleRiskPoints += 3; else if (!worstCase.survives) singleRiskPoints += 2;
    if (inputs.cashBuffer < monthlyPayment * 6) singleRiskPoints += 2; else if (inputs.cashBuffer < monthlyPayment * 12) singleRiskPoints += 1;
    if (monthlyPayment / singleIncome > 0.4) singleRiskPoints += 2; else if (monthlyPayment / singleIncome > 0.3) singleRiskPoints += 1;
    if (inputs.propertyType === 'primary') singleRiskPoints += 1;

    const savedPoints = singleRiskPoints - riskPoints;
    const extraMonthly = dualRemaining - singleRemaining;

    borrowerComparison = {
      single: { totalIncome: singleIncome, burdenPercent: singleBurden, riskLevel: getRiskLevel(singleBurden), monthlyRemaining: singleRemaining },
      dual: { totalIncome: dualIncome, burdenPercent: dualBurden, riskLevel: getRiskLevel(dualBurden), monthlyRemaining: dualRemaining },
      savedRiskPoints: savedPoints,
      extraMonthly,
      insight: `הוספת לווה נוסף מורידה את נטל ההחזר מ-${singleBurden.toFixed(0)}% ל-${dualBurden.toFixed(0)}% מההכנסה, ומשאירה ${formatNIS(extraMonthly)} יותר בכל חודש. הסיכוי לאישור המשכנתא עולה משמעותית.`,
    };
  }

  const partialResult = {
    monthlyPayment,
    netCashFlow,
    annualYield,
    riskScore,
    verdict,
    verdictLevel,
    stressLevel,
    minRequiredBuffer,
    purchaseTax,
    totalRealCost,
    scenarios,
    mortgageBreakdown,
    borrowerComparison,
    costBreakdown,
    approvalScore: calcApprovalScore(inputs, monthlyPayment, totalIncome, monthlyExpenses),
    termYears: effectiveTermYears,
    loanAmount,
    weightedAnnualRate,
    monthlyHousingMaintenance,
  };

  const psychologyInsights = generatePsychologyInsights(inputs, partialResult as any);
  const warningBanners = generateWarningBanners(inputs, partialResult as any);

  if (purchaseTax > 50000) {
    warningBanners.push(`💸 מס רכישה לבד: ${formatNIS(purchaseTax)} — כסף שנעלם ביום הראשון`);
  }

  const riskAssessment = buildRiskAssessment({
    inputs,
    monthlyPayment,
    totalIncome,
    monthlyHousingMaintenance,
    cashBuffer: inputs.cashBuffer,
    totalRealCost,
    effectiveDownPayment,
  });

  // Override verdict from risk engine (single source of truth)
  const overrideVerdict =
    riskAssessment.finalLevel === 'safe' ? 'יציב יחסית — עסקה בריאה'
    : riskAssessment.finalLevel === 'warning' ? 'גבולי — דורש זהירות. ראה ״מה השפיע״.'
    : 'מסוכן — נתונים פיננסיים מצביעים על סיכון גבוה.';

  return {
    ...partialResult,
    verdict: overrideVerdict,
    verdictLevel: riskAssessment.finalLevel,
    riskScore: riskAssessment.finalLevel === 'safe' ? 'נמוך' : riskAssessment.finalLevel === 'warning' ? 'בינוני' : 'גבוה',
    psychologyInsights,
    warningBanners,
    riskAssessment,
  };
}

function buildRiskAssessment(args: {
  inputs: PropertyInputs;
  monthlyPayment: number;
  totalIncome: number;
  monthlyHousingMaintenance: number;
  cashBuffer: number;
  totalRealCost: number;
  effectiveDownPayment: number;
}): RiskAssessment {
  const { inputs, monthlyPayment, totalIncome, monthlyHousingMaintenance, cashBuffer, totalRealCost, effectiveDownPayment } = args;

  // 1. Repayment ratio (mortgage + fixed expenses + housing maintenance) / income
  const totalMonthlyHousing = monthlyPayment + monthlyHousingMaintenance;
  const repayRatio = totalIncome > 0 ? (totalMonthlyHousing / totalIncome) * 100 : 100;
  const repayLevel: RiskLevel = repayRatio < 30 ? 'safe' : repayRatio <= 40 ? 'warning' : 'danger';
  const repayLabel = repayLevel === 'safe' ? 'בטוח' : repayLevel === 'warning' ? 'גבולי' : 'מסוכן';

  // 2. Safety buffer in months of total housing
  const monthsOfBuffer = totalMonthlyHousing > 0 ? cashBuffer / totalMonthlyHousing : 0;
  const bufferLevel: RiskLevel = monthsOfBuffer >= 12 ? 'safe' : monthsOfBuffer >= 6 ? 'warning' : 'danger';
  const bufferLabel = bufferLevel === 'safe' ? 'חזק' : bufferLevel === 'warning' ? 'בינוני' : 'חלש';

  // 3. Entry cost load: total upfront / equity (effectiveDownPayment)
  const entryRatio = effectiveDownPayment > 0 ? totalRealCost / effectiveDownPayment : 99;
  const entryLevel: RiskLevel = entryRatio <= 1.15 ? 'safe' : entryRatio <= 1.35 ? 'warning' : 'danger';
  const entryLabel = entryLevel === 'safe' ? 'נמוך' : entryLevel === 'warning' ? 'בינוני' : 'גבוה';

  const indicators: RiskIndicator[] = [
    { key: 'repayment', level: repayLevel, value: repayRatio, label: repayLabel, detail: `${repayRatio.toFixed(0)}% מההכנסה` },
    { key: 'buffer', level: bufferLevel, value: monthsOfBuffer, label: bufferLabel, detail: `${monthsOfBuffer.toFixed(1)} חודשי הוצאה` },
    { key: 'entry', level: entryLevel, value: entryRatio, label: entryLabel, detail: `סה״כ עלות ÷ הון = ${entryRatio.toFixed(2)}×` },
  ];

  // Weighted final level — repayment dominates
  // Hard rule: repay > 40 → at minimum 'warning'; if also buffer weak → 'danger'
  let finalLevel: RiskLevel;
  if (repayLevel === 'danger') {
    finalLevel = bufferLevel === 'safe' ? 'warning' : 'danger';
  } else if (repayLevel === 'warning') {
    // borderline repayment cannot be overridden to "safe" by buffer
    finalLevel = bufferLevel === 'danger' ? 'danger' : 'warning';
  } else {
    // repay safe
    if (bufferLevel === 'danger') finalLevel = 'warning';
    else if (entryLevel === 'danger' && bufferLevel === 'warning') finalLevel = 'warning';
    else finalLevel = 'safe';
  }

  const finalLabel = finalLevel === 'safe' ? 'עסקה בריאה' : finalLevel === 'warning' ? 'גבולי' : 'מסוכן';

  const reasons: RiskAssessment['reasons'] = [];
  if (repayLevel === 'danger') reasons.push({ text: `יחס החזר ${repayRatio.toFixed(0)}% — מעל 40% מההכנסה החודשית`, impact: 'negative' });
  else if (repayLevel === 'warning') reasons.push({ text: `יחס החזר ${repayRatio.toFixed(0)}% — בטווח גבולי (30%–40%)`, impact: 'negative' });
  else reasons.push({ text: `יחס החזר ${repayRatio.toFixed(0)}% — בטווח הבטוח`, impact: 'positive' });

  if (bufferLevel === 'danger') reasons.push({ text: `כרית ביטחון ל-${monthsOfBuffer.toFixed(1)} חודשים בלבד`, impact: 'negative' });
  else if (bufferLevel === 'warning') reasons.push({ text: `כרית ביטחון ל-${monthsOfBuffer.toFixed(1)} חודשים — בינוני`, impact: 'neutral' });
  else reasons.push({ text: `כרית ביטחון ל-${monthsOfBuffer.toFixed(1)} חודשים — חזק`, impact: 'positive' });

  if (entryLevel === 'danger') reasons.push({ text: `עלות כניסה כבדה — ${entryRatio.toFixed(2)}× ההון העצמי`, impact: 'negative' });
  else if (entryLevel === 'warning') reasons.push({ text: `עלות כניסה ${entryRatio.toFixed(2)}× ההון`, impact: 'neutral' });
  else reasons.push({ text: `עלות כניסה סבירה (${entryRatio.toFixed(2)}× ההון)`, impact: 'positive' });

  const improvements: string[] = [];
  if (repayLevel !== 'safe') improvements.push('הקטן את סכום ההלוואה או הארך את התקופה כדי להוריד את יחס ההחזר מתחת ל-30%');
  if (bufferLevel !== 'safe') improvements.push('הגדל את כרית הביטחון לפחות ל-12 חודשי הוצאות מגורים');
  if (entryLevel !== 'safe') improvements.push('צמצם עלויות נלוות (תיווך, שיפוץ) או הגדל את ההון העצמי');
  if (improvements.length === 0) improvements.push('הפרופיל יציב — שמור על כרית ביטחון והימנע מהוצאות חדשות בשנה הקרובה');

  return { indicators, finalLevel, finalLabel, reasons, improvements };
}

function calcApprovalScore(inputs: PropertyInputs, monthlyPayment: number, totalIncome: number, monthlyExpenses: number): ApprovalScore {
  const burdenPercent = (monthlyPayment / totalIncome) * 100;
  const parentCont = (inputs.parentHelp && inputs.parentHelpAmount > 0) ? inputs.parentHelpAmount : 0;
  const equityPercent = ((inputs.downPayment + parentCont) / inputs.price) * 100;

  // 1. Burden score (max 40)
  const burdenScore = burdenPercent < 30 ? 40 : burdenPercent <= 40 ? 25 : 10;

  // 2. Income score (max 20)
  const incomeScore = totalIncome >= 25000 ? 20 : totalIncome >= 15000 ? 15 : totalIncome >= 10000 ? 10 : 5;

  // 3. Dual borrower bonus (max 15)
  const dualBonus = (inputs.borrowerMode === 'dual' && inputs.secondBorrowerIncome > 0) ? 15 : 0;

  // 4. Equity score (max 25)
  const equityScore = equityPercent >= 25 ? 25 : equityPercent >= 15 ? 15 : 5;

  const score = Math.min(100, burdenScore + incomeScore + dualBonus + equityScore);

  // Single score (without dual bonus) for comparison
  const singleBurden = (monthlyPayment / inputs.monthlyIncome) * 100;
  const singleBurdenScore = singleBurden < 30 ? 40 : singleBurden <= 40 ? 25 : 10;
  const singleIncomeScore = inputs.monthlyIncome >= 25000 ? 20 : inputs.monthlyIncome >= 15000 ? 15 : inputs.monthlyIncome >= 10000 ? 10 : 5;
  const singleScore = Math.min(100, singleBurdenScore + singleIncomeScore + equityScore);

  const improvement = score - singleScore;

  const level: ApprovalScore['level'] = score >= 70 ? 'safe' : score >= 45 ? 'warning' : 'danger';
  const label = score >= 70 ? 'סיכוי גבוה' : score >= 45 ? 'סיכוי גבולי' : 'סיכוי נמוך';

  // Tips
  const tips: ApprovalScore['tips'] = [];
  if (inputs.borrowerMode === 'single') {
    tips.push({ action: 'הוסף לווה נוסף / ערב', points: 15 });
  }
  if (!inputs.parentHelp || parentCont === 0) {
    tips.push({ action: 'הוסף עזרה מההורים להגדלת הון עצמי', points: 10 });
  }
  if (equityPercent < 25) {
    const gain = equityPercent < 15 ? 20 : 10;
    tips.push({ action: 'הגדל הון עצמי ל-25%+', points: gain });
  }
  if (burdenPercent > 30) {
    const gain = burdenPercent > 40 ? 30 : 15;
    tips.push({ action: 'הקטן סכום ההלוואה', points: gain });
  }

  // Insight
  let insight: string;
  if (level === 'safe') {
    insight = 'הפרופיל הפיננסי שלך חזק — סיכוי גבוה לאישור המשכנתא.';
  } else if (level === 'warning') {
    insight = 'במצב הנוכחי הסיכוי לאישור גבולי. ' + (tips.length > 0 ? `${tips[0].action} יכול לשפר את הציון ב-${tips[0].points} נקודות.` : '');
  } else {
    insight = 'הסיכוי לאישור נמוך. מומלץ לשפר את ההון העצמי או להקטין את סכום ההלוואה.';
  }

  return { score, level, label, singleScore, improvement, tips, insight };
}

export function formatNIS(n: number): string {
  return '₪' + Math.round(n).toLocaleString('he-IL');
}
