// Centralized default rates — example values for illustration only
export const DEFAULT_RATES = {
  primeRate: 6.0,
  fixedRate: 5.5,
  variableRate: 5.0,
} as const;

export interface PropertyInputs {
  price: number;
  monthlyRent: number;
  propertyType: 'investment' | 'primary';
  downPayment: number;
  financingPercent: number;
  monthlyIncome: number;
  cashBuffer: number;
  region: string;
  isFirstApartment: boolean;
  parentHelp: boolean;
  parentHelpAmount: number;
  dualBorrower: boolean;
  secondBorrowerIncome: number;
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
  scenarios: ScenarioResult[];
  mortgageBreakdown: { label: string; amount: number; rate: number; monthly: number; desc: string }[];
  psychologyInsights: PsychologyInsight[];
  warningBanners: string[];
  borrowerComparison?: BorrowerComparison;
  approvalScore: ApprovalScore;
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

function calcMonthlyExpenses(price: number): number {
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
  const loanAmount = inputs.price - inputs.downPayment;

  const primeAmount = loanAmount * mortgage.primePercent / 100;
  const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
  const variableAmount = loanAmount * mortgage.variablePercent / 100;

  const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate + rateIncrease, mortgage.termYears);
  const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
  const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate + rateIncrease, mortgage.termYears);

  const monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
  const monthlyExpenses = calcMonthlyExpenses(inputs.price);
  const effectiveRent = inputs.propertyType === 'primary' ? 0 : inputs.monthlyRent * (12 - vacancyMonths) / 12;
  const monthlyCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;

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
  const totalIncome = inputs.dualBorrower ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
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

  const ltv = (inputs.price - inputs.downPayment) / inputs.price;
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

  if (!result.scenarios[2].survives) {
    banners.push('⚠️ אתה לא שורד את התרחיש הגרוע. מה תעשה כשזה יקרה?');
  }

  const totalIncome = inputs.dualBorrower ? inputs.monthlyIncome + inputs.secondBorrowerIncome : inputs.monthlyIncome;
  if (result.monthlyPayment / totalIncome > 0.45) {
    banners.push('🔴 יותר מ-45% מההכנסה שלך הולכת למשכנתא. הבנק אולי יאשר — אבל החיים לא');
  }


  return banners;
}

export function analyze(inputs: PropertyInputs, mortgage: MortgageStructure): AnalysisResult {
  const totalIncome = inputs.dualBorrower
    ? inputs.monthlyIncome + inputs.secondBorrowerIncome
    : inputs.monthlyIncome;

  const loanAmount = inputs.price - inputs.downPayment;

  const primeAmount = loanAmount * mortgage.primePercent / 100;
  const fixedAmount = loanAmount * mortgage.fixedPercent / 100;
  const variableAmount = loanAmount * mortgage.variablePercent / 100;

  const primeMonthly = calcMonthlyPayment(primeAmount, mortgage.primeRate, mortgage.termYears);
  const fixedMonthly = calcMonthlyPayment(fixedAmount, mortgage.fixedRate, mortgage.termYears);
  const variableMonthly = calcMonthlyPayment(variableAmount, mortgage.variableRate, mortgage.termYears);

  const monthlyPayment = primeMonthly + fixedMonthly + variableMonthly;
  const monthlyExpenses = calcMonthlyExpenses(inputs.price);
  const effectiveRent = inputs.propertyType === 'primary' ? 0 : inputs.monthlyRent;
  const netCashFlow = effectiveRent - monthlyPayment - monthlyExpenses;
  const annualYield = inputs.propertyType === 'primary' ? 0 :
    ((inputs.monthlyRent * 12 - monthlyExpenses * 12) / inputs.price) * 100;

  const purchaseTax = calcPurchaseTax(inputs.price, inputs.isFirstApartment);
  const totalRealCost = inputs.downPayment + purchaseTax + 15000;

  const mortgageBreakdown = [
    { label: 'פריים', amount: primeAmount, rate: mortgage.primeRate, monthly: primeMonthly, desc: 'זול אבל מסוכן — עולה עם הריבית' },
    { label: 'קבועה לא צמודה', amount: fixedAmount, rate: mortgage.fixedRate, monthly: fixedMonthly, desc: 'יקר אבל יציב — שקט נפשי' },
    { label: 'משתנה', amount: variableAmount, rate: mortgage.variableRate, monthly: variableMonthly, desc: 'זול בהתחלה, לא צפוי' },
  ];

  const baseCase = runScenario('מצב רגיל', 'חודש אחד ללא שוכר, ריבית יציבה', inputs, mortgage, 0, 1, 0);
  const badCase = runScenario('מצב רע', '2 חודשים בלי שוכר, ריבית +1.5%', inputs, mortgage, 1.5, 2, 0);
  const worstCase = runScenario('מצב גרוע מאוד', '3.5 חודשים בלי שוכר, ריבית +3%, תיקון 25,000₪', inputs, mortgage, 3, 3.5, 25000);

  const scenarios = [baseCase, badCase, worstCase];

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
  if (inputs.dualBorrower && inputs.secondBorrowerIncome > 0) {
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
  if (inputs.dualBorrower && inputs.secondBorrowerIncome > 0) {
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
    approvalScore: calcApprovalScore(inputs, monthlyPayment, totalIncome, monthlyExpenses),
  };

  const psychologyInsights = generatePsychologyInsights(inputs, partialResult as any);
  const warningBanners = generateWarningBanners(inputs, partialResult as any);

  if (purchaseTax > 50000) {
    warningBanners.push(`💸 מס רכישה לבד: ${formatNIS(purchaseTax)} — כסף שנעלם ביום הראשון`);
  }

  return { ...partialResult, psychologyInsights, warningBanners };
}

function calcApprovalScore(inputs: PropertyInputs, monthlyPayment: number, totalIncome: number, monthlyExpenses: number): ApprovalScore {
  const burdenPercent = (monthlyPayment / totalIncome) * 100;
  const equityPercent = (inputs.downPayment / inputs.price) * 100;

  // 1. Burden score (max 40)
  const burdenScore = burdenPercent < 30 ? 40 : burdenPercent <= 40 ? 25 : 10;

  // 2. Income score (max 20)
  const incomeScore = totalIncome >= 25000 ? 20 : totalIncome >= 15000 ? 15 : totalIncome >= 10000 ? 10 : 5;

  // 3. Dual borrower bonus (max 15)
  const dualBonus = (inputs.dualBorrower && inputs.secondBorrowerIncome > 0) ? 15 : 0;

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
  if (!inputs.dualBorrower) {
    tips.push({ action: 'הוסף לווה נוסף / ערב', points: 15 });
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
