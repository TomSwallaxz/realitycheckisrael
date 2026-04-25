import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Language = 'he' | 'en';

const translations = {
  // Hero & CTA
  hero_title: { he: 'מנוע החלטות נדל״ן', en: 'Real Estate Decision Engine' },
  hero_subtitle: { he: 'לא רק כמה זה עולה — אלא האם אתה באמת יכול לעמוד בזה', en: 'Not just how much it costs — but whether you can really afford it' },
  cta_title: { he: 'בדוק תוך 30 שניות אם אתה באמת יכול להרשות לעצמך לקנות דירה', en: 'Check in 30 seconds if you can really afford to buy a property' },
  cta_subtitle: { he: '👇 התחל מהשלב הראשון — הזן את מחיר הנכס', en: '👇 Start with step one — enter the property price' },
  analyze_btn: { he: 'בדוק את העסקה', en: 'Analyze the Deal' },

  // Onboarding
  onboarding_step1: { he: 'שלב 1: הזן את מחיר הנכס כדי להתחיל', en: 'Step 1: Enter the property price to begin' },
  onboarding_hint: { he: 'זה לוקח פחות מ־30 שניות ⏱️', en: 'Takes less than 30 seconds ⏱️' },

  // PropertyForm
  property_price: { he: 'מחיר הנכס', en: 'Property Price' },
  price_placeholder: { he: '1,800,000 ₪ לדוגמה', en: 'e.g. ₪1,800,000' },
  region: { he: 'אזור', en: 'Region' },
  property_type: { he: 'סוג נכס', en: 'Property Type' },
  investment: { he: 'השקעה', en: 'Investment' },
  primary: { he: 'מגורים', en: 'Primary' },
  monthly_rent: { he: 'שכר דירה צפוי (חודשי)', en: 'Expected Monthly Rent' },
  first_apartment: { he: 'דירה ראשונה?', en: 'First Apartment?' },
  yes: { he: 'כן', en: 'Yes' },
  no: { he: 'לא', en: 'No' },
  financial_data: { he: 'נתונים פיננסיים', en: 'Financial Data' },
  equity: { he: 'הון עצמי', en: 'Equity' },
  equity_available: { he: 'הון עצמי זמין', en: 'Available Equity' },
  parent_help_q: { he: 'עזרה מההורים?', en: 'Parents Help?' },
  parent_help_amount: { he: 'סכום העזרה', en: 'Help Amount' },
  financing_percent: { he: 'אחוז מימון', en: 'Financing %' },
  financing_warn: { he: '⚠️ מעל 75% — הבנק כנראה לא יאשר', en: '⚠️ Above 75% — bank likely won\'t approve' },
  borrower_structure: { he: 'מבנה לווים', en: 'Borrower Structure' },
  single_borrower: { he: '👤 לווה יחיד', en: '👤 Single Borrower' },
  dual_borrower: { he: '👥 שני לווים (זוג / ערב)', en: '👥 Two Borrowers (couple/guarantor)' },
  monthly_income: { he: 'הכנסה חודשית נטו', en: 'Net Monthly Income' },
  monthly_income_b1: { he: 'הכנסה חודשית — לווה 1', en: 'Monthly Income — Borrower 1' },
  monthly_income_b2: { he: 'הכנסה חודשית — לווה 2', en: 'Monthly Income — Borrower 2' },
  b2_hint: { he: 'בן/בת זוג או ערב', en: 'Spouse or guarantor' },
  fixed_expenses: { he: 'הוצאות חודשיות קבועות', en: 'Fixed Monthly Expenses' },
  expenses_hint: { he: 'רכב, אוכל, ביטוחים, הלוואות, ילדים, וכו׳', en: 'Car, food, insurance, loans, kids, etc.' },
  cash_buffer: { he: 'כרית ביטחון אחרי הרכישה', en: 'Cash Buffer After Purchase' },
  cash_buffer_hint: { he: 'כמה כסף נשאר לך אחרי כל העלויות', en: 'How much cash remains after all costs' },
  personal: { he: 'אישי', en: 'Personal' },
  parents: { he: 'הורים', en: 'Parents' },
  mortgage_label: { he: 'משכנתא', en: 'Mortgage' },
  financing_bar_equity: { he: 'הון עצמי', en: 'Equity' },

  // Summary items
  summary_price: { he: 'מחיר הנכס', en: 'Property Price' },

  // MortgageConfig
  mortgage_structure: { he: 'מבנה המשכנתא', en: 'Mortgage Structure' },
  strategy_conservative: { he: 'שמרני', en: 'Conservative' },
  strategy_conservative_desc: { he: 'שקט נפשי — רוב קבועה', en: 'Peace of mind — mostly fixed' },
  strategy_balanced: { he: 'מאוזן', en: 'Balanced' },
  strategy_balanced_desc: { he: 'חלוקה סטנדרטית', en: 'Standard allocation' },
  strategy_aggressive: { he: 'אגרסיבי', en: 'Aggressive' },
  strategy_aggressive_desc: { he: 'יותר פריים ומשתנה', en: 'More prime & variable' },
  rate_prime: { he: 'פריים', en: 'Prime' },
  rate_fixed: { he: 'קבועה', en: 'Fixed' },
  rate_variable: { he: 'משתנה', en: 'Variable' },
  rate_prime_desc: { he: 'זול אבל מסוכן', en: 'Cheap but risky' },
  rate_fixed_desc: { he: 'יקר אבל יציב', en: 'Expensive but stable' },
  rate_variable_desc: { he: 'לא צפוי', en: 'Unpredictable' },
  interest_rate: { he: 'ריבית', en: 'Rate' },
  example: { he: 'לדוגמה', en: 'Example' },
  custom: { he: 'מותאם', en: 'Custom' },
  rates_disclaimer: { he: 'ℹ️ הריביות המוצגות הן להמחשה בלבד ואינן מייצגות הצעה בנקאית.', en: 'ℹ️ Rates shown are for illustration only and do not represent a bank offer.' },
  loan_term: { he: 'תקופת ההלוואה (שנים)', en: 'Loan Term (years)' },

  // Rate tooltips
  prime_tooltip_short: { he: 'ריבית שמשתנה לפי ריבית בנק ישראל.', en: 'Rate that changes with the Bank of Israel rate.' },
  fixed_tooltip_short: { he: 'ריבית קבועה לאורך כל התקופה.', en: 'Fixed rate for the entire term.' },
  variable_tooltip_short: { he: 'ריבית שמתעדכנת כל כמה שנים.', en: 'Rate updated every few years.' },

  // Rate explanations
  prime_title: { he: 'ריבית פריים', en: 'Prime Rate' },
  fixed_title: { he: 'ריבית קבועה', en: 'Fixed Rate' },
  variable_title: { he: 'ריבית משתנה', en: 'Variable Rate' },
  what_is: { he: 'מה זה?', en: 'What is it?' },
  how_calculated: { he: 'איך זה מחושב?', en: 'How is it calculated?' },
  impact_on_payment: { he: 'השפעה על ההחזר', en: 'Impact on Payment' },
  advantages: { he: 'יתרונות', en: 'Advantages' },
  disadvantages: { he: 'חסרונות', en: 'Disadvantages' },

  prime_what: { he: 'ריבית שמבוססת על ריבית בנק ישראל בתוספת מרווח קבוע (בדרך כלל 1.5%).', en: 'Rate based on the Bank of Israel rate plus a fixed spread (usually 1.5%).' },
  prime_how: { he: 'ריבית פריים = ריבית בנק ישראל + מרווח הבנק. כשבנק ישראל מעלה ריבית, גם הפריים עולה.', en: 'Prime = Bank of Israel rate + bank spread. When the central bank raises rates, prime rises too.' },
  prime_impact: { he: 'ההחזר החודשי יכול לעלות או לרדת בהתאם לשינויים בריבית בנק ישראל.', en: 'Monthly payment can rise or fall based on central bank rate changes.' },
  prime_pros: { he: 'בדרך כלל הריבית הנמוכה ביותר בהתחלה. גמישות גבוהה — אפשר לסגור בכל עת בלי קנס.', en: 'Usually the lowest starting rate. High flexibility — can close anytime without penalty.' },
  prime_cons: { he: 'חשיפה לעליות ריבית. חוסר ודאות לגבי גובה ההחזר העתידי.', en: 'Exposed to rate hikes. Uncertainty about future payment amounts.' },

  fixed_what: { he: 'ריבית שנקבעת ביום לקיחת המשכנתא ונשארת זהה לאורך כל התקופה.', en: 'Rate set on mortgage day and stays the same for the entire term.' },
  fixed_how: { he: 'הבנק קובע ריבית קבועה על בסיס תשואות אג"ח ממשלתיות ותנאי השוק.', en: 'Bank sets the rate based on government bond yields and market conditions.' },
  fixed_impact: { he: 'ההחזר החודשי קבוע ולא משתנה — מה שנותן יציבות מלאה.', en: 'Monthly payment is fixed — providing complete stability.' },
  fixed_pros: { he: 'ודאות מלאה. שקט נפשי. קל לתכנן תקציב לטווח ארוך.', en: 'Full certainty. Peace of mind. Easy to budget long-term.' },
  fixed_cons: { he: 'בדרך כלל יקרה יותר מפריים. יציאה מוקדמת עלולה לכלול עמלת פירעון.', en: 'Usually more expensive than prime. Early exit may include prepayment penalty.' },

  variable_what: { he: 'ריבית שמתעדכנת אחת לתקופה קבועה (למשל כל 5 שנים) לפי תנאי השוק.', en: 'Rate updated at fixed intervals (e.g. every 5 years) based on market conditions.' },
  variable_how: { he: 'הריבית נקבעת מחדש בכל תקופת עדכון על בסיס מדדים כלכליים כמו אג"ח או מדד המחירים.', en: 'Rate reset at each update period based on economic indices like bonds or CPI.' },
  variable_impact: { he: 'ההחזר יכול להשתנות בכל תקופת עדכון — לעלות או לרדת.', en: 'Payment can change at each update period — up or down.' },
  variable_pros: { he: 'ריבית התחלתית נוחה יחסית. מאפשרת ליהנות מירידות ריבית.', en: 'Relatively comfortable starting rate. Benefits from rate drops.' },
  variable_cons: { he: 'חוסר ודאות לגבי עלויות עתידיות. הפתעות אפשריות בנקודות העדכון.', en: 'Uncertainty about future costs. Possible surprises at update points.' },

  // Psychology
  why_buying: { he: 'למה אתה קונה? 🤔', en: 'Why are you buying? 🤔' },
  why_buying_sub: { he: 'בחר את מה שמניע אותך — בלי לשקר לעצמך', en: 'Pick what motivates you — be honest with yourself' },
  mot_family: { he: 'לחץ מהמשפחה', en: 'Family Pressure' },
  mot_fomo: { he: 'פחד שהמחירים יעלו', en: 'Fear of Rising Prices' },
  mot_stability: { he: 'רצון ליציבות', en: 'Desire for Stability' },
  mot_investment: { he: 'הזדמנות השקעה', en: 'Investment Opportunity' },
  mot_status: { he: 'סטטוס חברתי', en: 'Social Status' },
  mot_rent_waste: { he: 'הרגשה ש״שכירות זה בזבוז״', en: 'Feeling "Rent is a Waste"' },

  // Results
  risk: { he: 'סיכון', en: 'Risk' },
  expected_stress: { he: 'לחץ צפוי', en: 'Expected Stress' },
  min_buffer: { he: 'כרית ביטחון מינימלית', en: 'Min Required Buffer' },
  monthly_payment: { he: 'החזר חודשי', en: 'Monthly Payment' },
  of_income: { he: 'מההכנסה', en: 'of Income' },
  annual_yield: { he: 'תשואה שנתית', en: 'Annual Yield' },
  gross: { he: 'ברוטו', en: 'Gross' },
  purchase_tax: { he: 'מס רכישה', en: 'Purchase Tax' },
  money_gone_day1: { he: 'כסף שנעלם ביום 1', en: 'Money gone on day 1' },

  // MonthlyCost card
  net_monthly_investment: { he: 'כמה באמת יוצא לך מהכיס כל חודש', en: 'How much really comes out of your pocket monthly' },
  net_monthly_primary: { he: 'ההחזר החודשי בפועל', en: 'Actual Monthly Payment' },
  tooltip_investment: { he: 'הסכום מבוסס על ההחזר החודשי למשכנתא, בניכוי הכנסות משכירות. לא כולל הוצאות קבועות אישיות.', en: 'Based on mortgage payment minus rental income. Does not include personal fixed expenses.' },
  tooltip_primary: { he: 'הסכום מבוסס על ההחזר החודשי למשכנתא בלבד. לא כולל הוצאות קבועות אישיות.', en: 'Based on mortgage payment only. Does not include personal fixed expenses.' },
  positive_cashflow: { he: 'תזרים חיובי', en: 'Positive Cash Flow' },
  balance: { he: 'איזון', en: 'Balance' },
  property_generates_income: { he: 'הנכס מייצר לך הכנסה חודשית', en: 'The property generates monthly income' },
  property_balanced: { he: 'הנכס מכסה את עצמו — איזון מלא', en: 'The property covers itself — full balance' },
  burden_safe: { he: 'נטל סביר — בטווח הבטוח', en: 'Reasonable burden — in the safe range' },
  burden_warning: { he: 'זה הסכום שאתה צריך להוסיף כל חודש מהכיס', en: 'This is what you need to add from pocket monthly' },
  burden_danger: { he: 'זה הסכום שאתה צריך להוסיף כל חודש מהכיס — נטל גבוה', en: 'This is what you need to add from pocket monthly — high burden' },
  mortgage_payment: { he: 'החזר חודשי למשכנתא', en: 'Monthly Mortgage Payment' },
  rental_income: { he: 'הכנסה משכירות', en: 'Rental Income' },
  net_from_pocket: { he: 'סה״כ נטו מהכיס', en: 'Net Total from Pocket' },
  cf_verdict_positive: { he: 'כסף נשאר לך כל חודש 👍', en: 'Money stays in your pocket every month 👍' },
  cf_verdict_negative: { he: 'אתה מפסיד כסף כל חודש ⚠️', en: 'You lose money every month ⚠️' },
  cf_verdict_borderline: { he: 'גבולי — זה יכול להתהפך', en: 'Borderline — this could flip' },
  cf_verdict_balanced: { he: 'איזון מלא — אפס מהכיס', en: 'Full balance — zero from pocket' },
  cf_net_label: { he: 'תזרים חודשי נטו', en: 'Net Monthly Cash Flow' },
  cf_explain_positive: { he: 'הנכס מייצר לך הכנסה חודשית', en: 'The property generates monthly income for you' },
  cf_explain_negative: { he: 'הנכס דורש ממך להשלים כסף כל חודש', en: 'The property requires you to top up cash every month' },
  cf_explain_borderline: { he: 'אתה על הקו — שינוי קטן יכול להפוך את התמונה', en: 'You\'re on the line — a small change can flip this' },
  cf_result_net: { he: 'תוצאה נטו', en: 'Net Result' },

  // Decision line
  decision_label: { he: 'ההכרעה הסופית', en: 'Final Decision' },
  decision_deal: { he: 'Deal', en: 'Deal' },
  decision_no_deal: { he: 'No Deal', en: 'No Deal' },
  decision_borderline: { he: 'גבולי', en: 'Borderline' },
  decision_deal_sub: { he: 'הנכס מממן את עצמו ומשאיר לך רווח', en: 'The property pays for itself and leaves you a profit' },
  decision_no_deal_sub: { he: 'העסקה הזאת תכניס אותך למינוס כל חודש', en: 'This deal will put you in the red every month' },
  decision_borderline_sub: { he: 'שינוי קטן יכול להפוך את זה להפסד', en: 'A small change can flip this into a loss' },
  decision_no_deal_primary_sub: { he: 'התשלום החודשי גבוה מדי ביחס להכנסה שלך', en: 'The monthly payment is too high relative to your income' },
  decision_deal_primary_sub: { he: 'אתה יכול להרשות לעצמך את הדירה הזו', en: 'You can comfortably afford this home' },

  // Appreciation block
  appr_title: { he: 'מה יקרה אם הנכס יעלה בערך?', en: 'What if the property appreciates?' },
  appr_pessimistic: { he: 'פסימי', en: 'Pessimistic' },
  appr_realistic: { he: 'ריאלי', en: 'Realistic' },
  appr_optimistic: { he: 'אופטימי', en: 'Optimistic' },
  appr_value_5y: { he: 'שווי בעוד 5 שנים', en: 'Value in 5 years' },
  appr_value_10y: { he: 'שווי בעוד 10 שנים', en: 'Value in 10 years' },
  appr_potential_gain: { he: 'רווח פוטנציאלי (10 שנים)', en: 'Potential gain (10 years)' },
  appr_per_year: { he: 'לשנה', en: 'per year' },
  appr_disclaimer: { he: 'עליית ערך אינה מובטחת ואינה מפצה על תזרים שלילי', en: 'Appreciation is not guaranteed and does not compensate for negative cash flow' },

  // Two-card cashflow split
  asset_card_title: { he: 'האם הנכס מממן את עצמו?', en: 'Does the property pay for itself?' },
  asset_net_label: { he: 'תזרים הנכס נטו', en: 'Property Net Cash Flow' },
  asset_verdict_positive: { he: 'הנכס הזה מייצר תזרים חיובי 👍', en: 'This property generates positive cash flow 👍' },
  asset_verdict_negative: { he: 'הנכס הזה לא מממן את עצמו ⚠️', en: 'This property does not pay for itself ⚠️' },
  asset_verdict_balanced: { he: 'הנכס מכסה את עצמו בדיוק', en: 'The property exactly covers itself' },
  life_card_title: { he: 'מה נשאר לך באמת כל חודש?', en: 'What\'s actually left every month?' },
  life_balance_label: { he: 'יתרה חודשית סופית', en: 'Final Monthly Balance' },
  life_verdict_positive: { he: 'נשאר לך כסף בסוף החודש 👍', en: 'You have money left at month end 👍' },
  life_verdict_negative: { he: 'אתה לא מסיים את החודש בפלוס ⚠️', en: 'You don\'t finish the month in the green ⚠️' },
  life_verdict_borderline: { he: 'גבולי — כל הוצאה לא צפויה תכאיב', en: 'Borderline — any surprise expense will hurt' },
  work_income: { he: 'הכנסה מעבודה', en: 'Work Income' },
  asset_cashflow_row: { he: 'תזרים הנכס', en: 'Property Cash Flow' },

  // Total mortgage cost
  total_mortgage_title: { he: 'כמה המשכנתא באמת עולה לך לאורך זמן', en: 'How much the mortgage really costs over time' },
  mortgage_amount: { he: 'גובה המשכנתא', en: 'Mortgage Amount' },
  mortgage_amount_sub: { he: 'זה הסכום שלקחת מהבנק', en: 'This is the amount you borrowed' },
  total_to_bank: { he: 'סה״כ תשלם לבנק', en: 'Total Paid to Bank' },
  total_to_bank_sub: { he: 'זה הסכום הכולל שתשלם לאורך התקופה', en: 'This is the total you\'ll pay over the term' },
  interest_paid: { he: 'מתוכם ריבית', en: 'Of Which Interest' },
  interest_paid_sub: { he: 'זה החלק שהוא ריבית', en: 'This is the interest portion' },
  years: { he: 'שנים', en: 'years' },

  // Approval score
  approval_title: { he: 'סיכויי אישור משכנתא', en: 'Mortgage Approval Chances' },
  approval_high: { he: 'סיכוי גבוה', en: 'High Chance' },
  approval_borderline: { he: 'סיכוי גבולי', en: 'Borderline' },
  approval_low: { he: 'סיכוי נמוך', en: 'Low Chance' },
  dual_improved: { he: 'הוספת לווה נוסף שיפרה את הציון ב-', en: 'Adding a co-borrower improved the score by ' },
  points: { he: 'נקודות', en: 'points' },
  improve_tips: { he: '💡 איך לשפר את הסיכוי:', en: '💡 How to improve your chances:' },

  // Borrower comparison
  borrower_impact: { he: 'השפעת לווה נוסף', en: 'Co-Borrower Impact' },
  single_label: { he: '👤 לווה יחיד', en: '👤 Single Borrower' },
  dual_label: { he: '👥 שני לווים', en: '👥 Two Borrowers' },
  burden: { he: 'נטל', en: 'Burden' },
  remaining: { he: 'נשאר', en: 'Remaining' },
  risk_reduction: { he: '📉 הפחתת סיכון:', en: '📉 Risk reduction:' },
  risk_points: { he: 'נקודות סיכון', en: 'risk points' },

  // Parent help
  parent_impact: { he: 'השפעת עזרה מההורים', en: 'Parents\' Help Impact' },
  personal_equity: { he: 'הון עצמי אישי', en: 'Personal Equity' },
  parent_help: { he: 'עזרה מההורים', en: 'Parents\' Help' },
  total_equity: { he: 'סה״כ הון עצמי זמין', en: 'Total Available Equity' },
  actual_financing: { he: 'אחוז מימון בפועל', en: 'Actual Financing %' },
  parent_help_insight: { he: '💡 עזרה מההורים מקטינה את סכום ההלוואה, מורידה את אחוז המימון, ומשפרה את סיכויי אישור המשכנתא.', en: '💡 Parents\' help reduces the loan amount, lowers the financing ratio, and improves mortgage approval chances.' },

  // Cost breakdown — upfront cash needed to close the deal
  real_cost_title: { he: 'הון עצמי נדרש לסגירת העסקה', en: 'Cash Needed to Close the Deal' },
  real_cost_sub: {
    he: 'כולל הון עצמי, מס רכישה, עו״ד, תיווך, שמאי, יועץ משכנתאות, פתיחת תיק בבנק, שיפוץ ועלויות נוספות',
    en: 'Includes equity, purchase tax, lawyer, broker, appraiser, mortgage advisor, bank file fee, renovation, and extra costs',
  },
  real_cost_explainer: {
    he: '💡 זו עלות הכניסה לעסקה — כמה כסף אתה צריך להביא עכשיו מהכיס.',
    en: '💡 This is the entry cost — how much cash you need to bring upfront.',
  },
  bank_cost_explainer: {
    he: '💡 זו עלות המימון בלבד — כמה תשלם לבנק לאורך כל תקופת המשכנתא.',
    en: '💡 This is the financing cost only — how much you pay the bank over the full mortgage term.',
  },
  lifetime_cost_explainer: {
    he: '💡 זו העלות המלאה לאורך חיי העסקה — סך הכסף שיוצא לך מהכיס מתחילת העסקה ועד סוף המשכנתא.',
    en: '💡 This is the full lifetime cost — total money out of pocket from day one until the mortgage ends.',
  },
  lifetime_grand_total_full: {
    he: 'סה״כ כסף שיוצא לך מהכיס לאורך כל התקופה',
    en: 'Total money out of pocket over the entire period',
  },

  // Lifetime cost — full property cost over the mortgage term
  lifetime_cost_title: { he: 'עלות כוללת לאורך חיי המשכנתא', en: 'Total Lifetime Cost Over the Mortgage Term' },
  lifetime_cost_sub: {
    he: 'מחיר הנכס + מס רכישה + עלויות עסקה + סך ריבית + ביטוח לאורך כל התקופה',
    en: 'Property price + purchase tax + transaction costs + total interest + insurance over the full term',
  },
  lifetime_property_price: { he: 'מחיר הנכס', en: 'Property Price' },
  lifetime_upfront_costs: { he: 'עלויות עסקה (ללא מס רכישה)', en: 'Transaction Costs (excl. purchase tax)' },
  lifetime_total_interest: { he: 'סך ריבית למשכנתא', en: 'Total Mortgage Interest' },
  lifetime_total_insurance: { he: 'סך ביטוח משכנתא לאורך התקופה', en: 'Total Mortgage Insurance Over Term' },
  lifetime_grand_total: { he: 'סה״כ עלות כוללת', en: 'Grand Total Lifetime Cost' },

  // Mortgage breakdown
  mortgage_detail: { he: 'פירוט המשכנתא', en: 'Mortgage Breakdown' },
  per_month: { he: '/חודש', en: '/mo' },
  on_rate: { he: 'על', en: 'at' },

  // Decision-block (How your mortgage is really built)
  mortgage_built_title: { he: 'איך המשכנתא שלך באמת בנויה', en: 'How your mortgage is really built' },
  track_meaning_prime: { he: 'רגיש לעליית ריבית — ההחזר שלך יכול לעלות מהר', en: 'Sensitive to rate hikes — your payment can rise fast' },
  track_meaning_fixed: { he: 'יציבות מלאה — אתה יודע בדיוק כמה תשלם', en: 'Full stability — you know exactly what you\'ll pay' },
  track_meaning_variable: { he: 'עלול להתייקר בעתיד — חוסר ודאות', en: 'May become more expensive — uncertainty ahead' },
  risk_label: { he: 'סיכון', en: 'Risk' },
  future_impact_prime: { he: 'אם הריבית עולה ב-1% → תשלם כ-{amount} יותר בחודש', en: 'If rates rise 1% → you\'ll pay ~{amount} more per month' },
  future_impact_fixed: { he: 'גם אם הריבית בשוק תעלה — ההחזר שלך לא ישתנה', en: 'Even if market rates rise — your payment stays the same' },
  future_impact_variable: { he: 'בעדכון הבא: עלייה של 1% → תשלם כ-{amount} יותר בחודש', en: 'At next reset: 1% rise → ~{amount} more per month' },
  what_it_means: { he: 'מה זה אומר עליך', en: 'What this means for you' },
  meaning_prime_heavy: { he: 'המשכנתא שלך רגישה מאוד לשינויים בשוק — ההחזר יכול לזוז משמעותית', en: 'Your mortgage is very sensitive to market shifts — payments can swing significantly' },
  meaning_fixed_heavy: { he: 'המשכנתא שלך יציבה אבל יקרה יותר — אתה משלם פרמיה על שקט נפשי', en: 'Your mortgage is stable but pricier — you pay a premium for peace of mind' },
  meaning_variable_heavy: { he: 'יש לך סיכון עתידי משמעותי שצריך לקחת בחשבון', en: 'You carry significant future risk that needs to be accounted for' },
  meaning_balanced: { he: 'התמהיל שלך מאוזן יחסית — שילוב סביר בין יציבות לגמישות', en: 'Your mix is fairly balanced — a reasonable blend of stability and flexibility' },
  improve_mix_cta: { he: 'שפר את התמהיל שלך', en: 'Improve your mix' },
  coming_soon: { he: 'בקרוב', en: 'Coming soon' },

  // Scenarios
  scenarios_title: { he: 'תרחישי לחץ — מה הטווח האמיתי?', en: 'Stress Scenarios — What\'s the Real Range?' },
  scenarios_sub: { he: 'מהאופטימי ועד הגרוע — כדי שתבין מה באמת אפשרי', en: 'From optimistic to worst — so you understand what\'s really possible' },
  monthly_payment_label: { he: 'החזר חודשי', en: 'Monthly Payment' },
  effective_rent: { he: 'שכ״ד אפקטיבי', en: 'Effective Rent' },
  expenses: { he: 'הוצאות', en: 'Expenses' },
  monthly_cashflow: { he: 'תזרים חודשי', en: 'Monthly Cash Flow' },
  positive_flow: { he: '✓ תזרים חיובי', en: '✓ Positive Cash Flow' },
  survives_months: { he: 'שורד', en: 'Survives' },
  months_on_buffer: { he: 'חודשים על כרית הביטחון', en: 'months on safety buffer' },
  broke_immediately: { he: '✗ נגמר הכסף מיד', en: '✗ Out of money immediately' },
  breaks_after: { he: '✗ נשבר אחרי', en: '✗ Breaks after' },
  months: { he: 'חודשים', en: 'months' },

  // Psychology insights
  psychology_title: { he: '🧠 מה באמת מניע אותך?', en: '🧠 What\'s really driving you?' },

  // Motivation responses
  resp_family: { he: 'לחץ מהמשפחה זה לא סיבה לקנות דירה. זו ההחלטה הכלכלית הגדולה ביותר שלך — לא שלהם.', en: 'Family pressure is not a reason to buy. This is your biggest financial decision — not theirs.' },
  resp_fomo: { he: '״המחירים יעלו״ — אולי. אבל אם העסקה לא עומדת בפני עצמה היום, היא לא תעמוד מחר.', en: '"Prices will rise" — maybe. But if the deal doesn\'t stand on its own today, it won\'t tomorrow.' },
  resp_stability: { he: 'יציבות זה לגיטימי. אבל יציבות עם חוב כבד זה לא באמת יציבות.', en: 'Stability is legitimate. But stability with heavy debt isn\'t real stability.' },
  resp_investment: { he: 'תשואה טובה על נדל״ן? אולי. אבל תבדוק את המספרים — לא את הסיפורים.', en: 'Good returns on real estate? Maybe. But check the numbers — not the stories.' },
  resp_status: { he: 'דירה משלך = הצלחה? בדוק שוב. הצלחה זה שקט נפשי, לא משכנתא.', en: 'Owning = success? Think again. Success is peace of mind, not a mortgage.' },
  resp_rent_waste: { he: '״שכירות זה בזבוז״ — מיתוס. גם ריבית, מס רכישה, ותחזוקה הם ״בזבוז״.', en: '"Rent is waste" — a myth. Interest, purchase tax, and maintenance are also "waste".' },

  // Improvement tips
  tips_title: { he: '🎯 המלצות לשיפור העסקה', en: '🎯 Recommendations to Improve the Deal' },
  tips_sub: { he: 'מה אפשר לשנות כדי לשפר את הסיכוי לאישור ולהקטין סיכון', en: 'What you can change to improve approval chances and reduce risk' },

  // PDF / Report CTA
  download_pdf: { he: 'הורד דוח PDF', en: 'Download PDF Report' },
  preparing: { he: 'מכין דוח...', en: 'Preparing report...' },
  download_report: { he: 'הורד את הדוח', en: 'Download Report' },
  share_link: { he: 'שתף את הלינק', en: 'Share Link' },
  link_copied: { he: 'הקישור הועתק', en: 'Link copied to clipboard' },
  link_copy_failed: { he: 'שכפול הקישור נכשל', en: 'Failed to copy link' },

  // GitHub CTA
  contribute_github: { he: 'תרום לקוד ב-GitHub', en: 'Contribute on GitHub' },
  github_cta_sub: { he: 'רוצה לשפר את הכלי? אפשר לתרום לקוד ישירות ב-GitHub.', en: 'Want to improve this tool? Contribute directly on GitHub.' },

  // Footer
  disclaimer_title: { he: '⚠️ חשוב לדעת', en: '⚠️ Important Notice' },
  disclaimer_1: { he: 'המידע המוצג כאן הוא להערכה בלבד, ומבוסס על נתונים והנחות כלליות. החישובים אינם מהווים ייעוץ פיננסי, המלצה או התחייבות לקבלת משכנתא.', en: 'The information presented here is for estimation only, based on general data and assumptions. Calculations do not constitute financial advice, recommendation, or mortgage commitment.' },
  disclaimer_2: { he: 'תנאי האשראי בפועל נקבעים על ידי הבנק ועשויים להשתנות בהתאם לנתונים האישיים שלך. לפני קבלת החלטה, מומלץ להתייעץ עם גורם מקצועי.', en: 'Actual credit terms are determined by the bank and may vary based on your personal data. Consult a professional before making decisions.' },
  inline_disclaimer: { he: '⚠️ הערכה בלבד — לא התחייבות הבנק', en: '⚠️ Estimate only — not a bank commitment' },

  // Sticky summary
  sticky_price: { he: 'מחיר', en: 'Price' },
  sticky_equity: { he: 'הון עצמי', en: 'Equity' },
  sticky_financing: { he: 'מימון', en: 'Financing' },
  sticky_mortgage: { he: 'משכנתא', en: 'Mortgage' },
  sticky_edit: { he: '✏️ ערוך', en: '✏️ Edit' },

  // Theme
  switch_light: { he: 'עבור למצב בהיר', en: 'Switch to Light Mode' },
  switch_dark: { he: 'עבור למצב כהה', en: 'Switch to Dark Mode' },

  // Regions
  region_center: { he: 'מרכז (תל אביב, גוש דן)', en: 'Center (Tel Aviv, Gush Dan)' },
  region_jerusalem: { he: 'ירושלים', en: 'Jerusalem' },
  region_haifa: { he: 'חיפה והצפון', en: 'Haifa & North' },
  region_beer_sheva: { he: 'באר שבע והדרום', en: 'Be\'er Sheva & South' },
  region_sharon: { he: 'השרון', en: 'HaSharon' },
  region_shfela: { he: 'שפלה', en: 'Shfela' },
  region_other: { he: 'אחר', en: 'Other' },

  // Verdict & risk labels
  risk_low: { he: 'נמוך', en: 'Low' },
  risk_medium: { he: 'בינוני', en: 'Medium' },
  risk_high: { he: 'גבוה', en: 'High' },

  // Empty state
  empty_title: { he: 'הכנס פרטים ולחץ על הכפתור', en: 'Enter details and click the button' },
  empty_sub: { he: 'נבדוק אם העסקה הזו שורדת כשדברים משתבשים', en: 'We\'ll check if this deal survives when things go wrong' },

  // Tip actions
  tip_add_coborrower: { he: 'הוסף לווה נוסף / ערב', en: 'Add co-borrower / guarantor' },
  tip_add_parent_help: { he: 'הוסף עזרה מההורים להגדלת הון עצמי', en: 'Add parents\' help to increase equity' },
  tip_increase_equity: { he: 'הגדל הון עצמי ל-25%+', en: 'Increase equity to 25%+' },
  tip_reduce_loan: { he: 'הקטן סכום ההלוואה', en: 'Reduce loan amount' },

  // Recommendation texts (dynamic, but we provide templates)
  rec_add_coborrower: { he: 'הוספת לווה נוסף (בן/בת זוג או ערב) תשפר משמעותית את סיכויי האישור ותקטין את רמת הסיכון.', en: 'Adding a co-borrower (spouse or guarantor) will significantly improve approval chances and reduce risk.' },
  rec_high_burden: { he: 'נטל ההחזר שלך גבוה. שקול להגדיל הון עצמי או להקטין את סכום ההלוואה.', en: 'Your payment burden is high. Consider increasing equity or reducing the loan amount.' },
  rec_low_equity: { he: 'ההון העצמי שלך נמוך. הגדלה ל-25%+ תשפר את תנאי המשכנתא ותפחית ריבית.', en: 'Your equity is low. Increasing to 25%+ will improve mortgage terms and reduce interest.' },
  rec_low_buffer: { he: 'כרית הביטחון שלך נמוכה. מומלץ לשמור יותר.', en: 'Your safety buffer is too low. You should save more.' },
  rec_high_expenses: { he: 'ההוצאות הקבועות שלך גבוהות — שקול לצמצם לפני לקיחת משכנתא.', en: 'Your fixed expenses are high — consider cutting before taking a mortgage.' },
  rec_danger_scenario: { he: 'בתרחיש הגרוע אתה לא שורד. ודא שיש לך תוכנית גיבוי.', en: 'You don\'t survive the worst scenario. Make sure you have a backup plan.' },

  // Psychology insights (calculator)
  psych_heavy_load: { he: 'עומס כלכלי', en: 'Financial Overload' },
  psych_heavy_load_msg: { he: 'אתה מתכנן להקדיש יותר מ-40% מההכנסה למשכנתא. זה לא ״קצת לחוץ״ — זה לחיות על הקצה.', en: 'You plan to dedicate over 40% of income to mortgage. This isn\'t "a bit tight" — it\'s living on the edge.' },
  psych_borderline: { he: 'עומס גבולי', en: 'Borderline Load' },
  psych_borderline_msg: { he: 'אתה ב-30%+ מההכנסה על משכנתא. זה אפשרי, אבל כל הוצאה לא צפויה תכאיב.', en: 'You\'re at 30%+ of income on mortgage. Possible, but any unexpected expense will hurt.' },
  psych_parent_help: { he: 'עזרה מההורים', en: 'Parents\' Help' },
  psych_parent_help_msg: { he: 'אם אתה צריך עזרה מההורים כדי לקנות — שאל את עצמך אם אתה באמת מוכן לעסקה הזו.', en: 'If you need parents\' help to buy — ask yourself if you\'re truly ready for this deal.' },
  psych_thin_buffer: { he: 'כרית ביטחון דקה', en: 'Thin Safety Buffer' },
  psych_thin_buffer_msg: { he: 'אין לך מספיק כסף בצד. אם משהו ישתבש — ואין ״אם״, יהיה ״מתי״ — אתה בבעיה.', en: 'You don\'t have enough cash aside. When something goes wrong — not if — you\'re in trouble.' },
  psych_low_yield: { he: 'תשואה נמוכה', en: 'Low Yield' },
  psych_low_yield_msg: { he: 'תשואה של פחות מ-3% זה פחות ממה שתקבל בפיקדון בנקאי. בטוח שזו ״השקעה״?', en: 'A yield below 3% is less than a bank deposit. Are you sure this is an "investment"?' },
  psych_high_leverage: { he: 'מינוף גבוה', en: 'High Leverage' },
  psych_high_leverage_msg: { he: 'אתה ממנף יותר מ-70% מערך הנכס. ירידת מחירים של 10% תשאיר אותך עם חוב גדול מהנכס.', en: 'You\'re leveraging over 70% of the property value. A 10% price drop leaves you with more debt than the property is worth.' },

  // Warning banners
  warn_low_buffer: { he: '🚨 אם אין לך לפחות 50,000₪ בצד — אתה נכנס לסיכון גבוה מאוד', en: '🚨 Without at least ₪50,000 saved — you\'re entering very high risk' },
  warn_worst_fails: { he: '⚠️ אתה לא שורד את התרחיש הגרוע. מה תעשה כשזה יקרה?', en: '⚠️ You don\'t survive the worst scenario. What will you do when it happens?' },
  warn_high_burden: { he: '🔴 יותר מ-45% מההכנסה שלך הולכת למשכנתא. הבנק אולי יאשר — אבל החיים לא', en: '🔴 Over 45% of your income goes to mortgage. The bank might approve — but life won\'t' },
  warn_high_tax: { he: '💸 מס רכישה לבד:', en: '💸 Purchase tax alone:' },
  warn_high_tax_suffix: { he: '— כסף שנעלם ביום הראשון', en: '— money gone on day one' },

  // Scenarios
  scenario_optimistic: { he: 'מצב אופטימי', en: 'Optimistic Scenario' },
  scenario_base: { he: 'המצב הסביר', en: 'Base Case' },
  scenario_bad: { he: 'מצב רע', en: 'Bad Scenario' },
  scenario_worst: { he: 'מצב גרוע מאוד', en: 'Very Bad Scenario' },
  scenario_opt_inv: { he: 'שכירות מלאה, ללא תקופות ריקות, ללא תיקונים', en: 'Full rent, no vacancies, no repairs' },
  scenario_opt_pri: { he: 'יציבות מלאה, ללא הפתעות', en: 'Full stability, no surprises' },
  scenario_base_inv: { he: 'חודש ריק אחד בשנה, ריבית יציבה', en: 'One vacant month per year, stable rates' },
  scenario_base_pri: { he: 'החזר חודשי רגיל, תחזוקה שוטפת', en: 'Regular monthly payment, routine maintenance' },
  scenario_bad_inv: { he: '2 חודשים ריקים, ריבית +1.5%', en: '2 vacant months, rates +1.5%' },
  scenario_bad_pri: { he: 'ריבית עולה ב-1.5%, תיקון ₪10K', en: 'Rates +1.5%, ₪10K repair' },
  scenario_worst_inv: { he: '3.5 חודשים ללא שוכר, ריבית +3%, תיקון ₪25K', en: '3.5 months no tenant, rates +3%, ₪25K repair' },
  scenario_worst_pri: { he: 'ריבית +3%, תיקון גדול ₪25K', en: 'Rates +3%, major ₪25K repair' },

  // Verdicts
  verdict_safe: { he: 'יציב יחסית — אבל אל תירדם על המשמר', en: 'Relatively stable — but don\'t let your guard down' },
  verdict_warning: { he: 'גבולי — דורש כרית ביטחון גבוהה. תחשוב פעמיים.', en: 'Borderline — requires a high safety buffer. Think twice.' },
  verdict_danger: { he: 'עסקה מסוכנת — אתה על הקצה. לא מומלץ.', en: 'Risky deal — you\'re on the edge. Not recommended.' },

  // Cost breakdown labels
  cost_total_equity: { he: 'סה״כ הון עצמי', en: 'Total Equity' },
  cost_yours: { he: '  ↳ שלך', en: '  ↳ Yours' },
  cost_parents: { he: '  ↳ עזרה מההורים', en: '  ↳ Parents\' Help' },
  cost_tax: { he: 'מס רכישה', en: 'Purchase Tax' },
  cost_lawyer: { he: 'עו״ד', en: 'Lawyer' },
  cost_broker: { he: 'תיווך', en: 'Broker' },
  cost_appraiser: { he: 'שמאי', en: 'Appraiser' },

  // Mortgage track labels
  track_prime: { he: 'פריים', en: 'Prime' },
  track_fixed: { he: 'קבועה לא צמודה', en: 'Fixed Unlinked' },
  track_variable: { he: 'משתנה', en: 'Variable' },
  track_prime_desc: { he: 'זול אבל מסוכן — עולה עם הריבית', en: 'Cheap but risky — rises with rates' },
  track_fixed_desc: { he: 'יקר אבל יציב — שקט נפשי', en: 'Expensive but stable — peace of mind' },
  track_variable_desc: { he: 'זול בהתחלה, לא צפוי', en: 'Cheap at first, unpredictable' },

  // Approval insights
  approval_safe_insight: { he: 'הפרופיל הפיננסי שלך חזק — סיכוי גבוה לאישור המשכנתא.', en: 'Your financial profile is strong — high chance of mortgage approval.' },
  approval_warn_insight: { he: 'במצב הנוכחי הסיכוי לאישור גבולי.', en: 'In the current state, approval chances are borderline.' },
  approval_danger_insight: { he: 'הסיכוי לאישור נמוך. מומלץ לשפר את ההון העצמי או להקטין את סכום ההלוואה.', en: 'Approval chance is low. Consider increasing equity or reducing the loan amount.' },

  // Investment-mode result cards
  yield_gross_title: { he: 'תשואה שנתית ברוטו', en: 'Annual Gross Yield' },
  yield_gross_sub: { he: 'שכ״ד שנתי ביחס למחיר הנכס', en: 'Annual rent as % of property price' },
  yield_net_title: { he: 'תשואה שנתית נטו', en: 'Annual Net Yield' },
  yield_net_sub: { he: 'אחרי הוצאות הנכס בלבד (לא כולל משכנתא ולא הוצאות חיים)', en: 'After property expenses only (excludes mortgage & life expenses)' },
  prop_cashflow_title: { he: 'תזרים חודשי מהנכס', en: 'Monthly Property Cash Flow' },
  prop_cashflow_sub: { he: 'שכר דירה - משכנתא - הוצאות הנכס', en: 'Rent - mortgage - property expenses' },
  prop_cf_positive: { he: 'הנכס מייצר תזרים חיובי', en: 'The property generates positive cash flow' },
  prop_cf_negative: { he: 'הנכס לא מממן את עצמו', en: 'The property does not pay for itself' },

  // Primary-mode result cards
  living_cost_title: { he: 'עלות מגורים אמיתית', en: 'Real Cost of Living Here' },
  living_cost_sub: { he: 'משכנתא + הוצאות קבועות - שכירות חלופית', en: 'Mortgage + fixed expenses - alternative rent' },
  living_cost_positive_msg: { he: 'יקר יותר מלשכור דירה דומה באזור', en: 'More expensive than renting a similar place nearby' },
  living_cost_negative_msg: { he: 'זול יותר מלשכור דירה דומה באזור', en: 'Cheaper than renting a similar place nearby' },
  alt_rent: { he: 'שכירות חלופית באזור (חודשית)', en: 'Alternative Local Rent (monthly)' },
  alt_rent_hint: { he: 'כמה תעלה לך שכירות של דירה דומה באותו אזור', en: 'How much rent for a similar place in the area would cost' },
  alt_rent_missing: { he: 'הזן שכירות חלופית כדי לראות את ההשוואה', en: 'Enter alternative rent to see the comparison' },
  burn_vs_build_title: { he: 'כמה אתה שורף vs כמה אתה צובר', en: 'How much you burn vs how much you build' },
  burn_vs_build_sub: { he: 'פיצול ההחזר החודשי לחלק שנשרף וחלק שנצבר כהון', en: 'Splitting your payment into burned cost and equity built' },
  burned_label: { he: 'נשרף החודש', en: 'Burned this month' },
  burned_hint: { he: 'ריבית למשכנתא + הוצאות קבועות', en: 'Mortgage interest + fixed expenses' },
  built_label: { he: 'נצבר לך בנכס', en: 'Built into your property' },
  built_hint: { he: 'תשלום הקרן — הופך לבעלות שלך', en: 'Principal payment — becomes your equity' },

  // Editable cost inputs (NEW)
  costs_section_title: { he: 'עלויות עסקה (ניתן לערוך)', en: 'Transaction Costs (editable)' },
  costs_section_sub: { he: 'התאם למספרים האמיתיים של העסקה שלך', en: 'Match real numbers of your deal' },
  broker_fee_pct: { he: 'דמי תיווך', en: 'Broker Fee' },
  lawyer_fee_pct: { he: 'שכ״ט עו״ד', en: 'Lawyer Fee' },
  appraiser_fee_label: { he: 'שמאי', en: 'Appraiser' },
  mortgage_advisor_fee: { he: 'יועץ משכנתאות', en: 'Mortgage Advisor' },
  mortgage_advisor_fee_hint: { he: 'עלות יועץ משכנתאות (בדרך כלל 4,000–10,000 ₪)', en: 'Mortgage advisor cost (typically ₪4,000–10,000)' },
  bank_file_fee: { he: 'פתיחת תיק בבנק', en: 'Bank File Opening Fee' },
  bank_file_fee_hint: { he: 'בדרך כלל עד כ־0.25% מגובה המשכנתא', en: 'Typically up to ~0.25% of mortgage amount' },
  monthly_mortgage_insurance: { he: 'ביטוח משכנתא חודשי', en: 'Monthly Mortgage Insurance' },
  monthly_mortgage_insurance_hint: { he: 'כולל ביטוח חיים וביטוח מבנה — הערכה בלבד', en: 'Includes life + structure insurance — estimate only' },
  total_monthly_cost: { he: 'סה״כ עלות חודשית משוערת', en: 'Estimated Total Monthly Cost' },
  renovation_cost: { he: 'שיפוץ / ריהוט', en: 'Renovation / Furniture' },
  extra_costs: { he: 'עלויות נוספות', en: 'Other Costs' },
  housing_maintenance: { he: 'תחזוקה / ועד / ביטוח (חודשי)', en: 'Maintenance / HOA / Insurance (monthly)' },
  rent_maintenance: { he: 'ועד בית בשכירות (חודשי)', en: 'HOA in Rental (monthly)' },
  housing_maintenance_hint: { he: 'הערכה חודשית של ועד בית, ביטוח דירה ותחזוקה צפויה', en: 'Monthly estimate of HOA, insurance and routine upkeep' },

  // Mortgage advanced mode
  mortgage_mode: { he: 'מצב הגדרה', en: 'Mode' },
  mortgage_mode_simple: { he: 'פשוט', en: 'Simple' },
  mortgage_mode_advanced: { he: 'מתקדם', en: 'Advanced' },
  advanced_tracks_title: { he: 'מסלולים מותאמים אישית', en: 'Custom Tracks' },
  advanced_tracks_sub: { he: 'הגדר כל מסלול בנפרד: סכום, ריבית ותקופה', en: 'Define each track: amount, rate and term' },
  add_track: { he: '+ הוסף מסלול', en: '+ Add track' },
  remove_track: { he: 'הסר', en: 'Remove' },
  track_amount: { he: 'סכום', en: 'Amount' },
  track_rate: { he: 'ריבית', en: 'Rate' },
  track_years: { he: 'שנים', en: 'Years' },
  track_type: { he: 'סוג', en: 'Type' },
  advanced_total: { he: 'סך מסלולים', en: 'Tracks total' },
  advanced_loan_match: { he: 'גובה ההלוואה', en: 'Loan amount' },
  advanced_mismatch: { he: '⚠️ סכום המסלולים שונה מההלוואה — תקן לפני ניתוח', en: '⚠️ Tracks total differs from loan — fix before analysis' },

  // Risk assessment (NEW)
  risk_breakdown_title: { he: 'הערכת סיכון מפורטת', en: 'Detailed Risk Assessment' },
  risk_indicator_repayment: { he: 'יחס החזר', en: 'Repayment Ratio' },
  risk_indicator_buffer: { he: 'כרית ביטחון', en: 'Safety Buffer' },
  risk_indicator_entry: { he: 'עומס עלות כניסה', en: 'Entry Cost Load' },
  risk_final_verdict: { he: 'הכרעה סופית', en: 'Final Verdict' },
  risk_why_title: { he: 'למה התקבלה התוצאה הזו?', en: 'Why this result?' },
  risk_why_show: { he: 'הצג הסבר', en: 'Show explanation' },
  risk_why_hide: { he: 'הסתר', en: 'Hide' },
  risk_factors: { he: 'גורמים שהשפיעו', en: 'Factors that influenced' },
  risk_improvements: { he: 'מה אפשר לשפר', en: 'How to improve' },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType>({
  lang: 'he',
  setLang: () => {},
  t: (key) => translations[key]?.he || key,
  dir: 'rtl',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as Language) || 'he';
    }
    return 'he';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === 'he' ? 'rtl' as const : 'ltr' as const;

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang, dir]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
