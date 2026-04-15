import { useState, useEffect, useRef } from 'react';
import { PropertyInputs, MortgageStructure, Strategy, getStrategyPreset, analyze, AnalysisResult, DEFAULT_RATES } from '@/lib/calculator';
import { PropertyForm } from '@/components/PropertyForm';
import { MortgageConfig } from '@/components/MortgageConfig';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { PsychologySection } from '@/components/PsychologySection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StickySummary } from '@/components/StickySummary';
import heroBg from '@/assets/hero-cityscape.jpg';

const Index = () => {
  const [inputs, setInputs] = useState<PropertyInputs>({
    price: 1800000,
    monthlyRent: 4500,
    propertyType: 'investment',
    downPayment: 540000,
    financingPercent: 70,
    monthlyIncome: 22000,
    fixedMonthlyExpenses: 7000,
    cashBuffer: 100000,
    region: 'מרכז (תל אביב, גוש דן)',
    isFirstApartment: false,
    parentHelp: false,
    parentHelpAmount: 0,
    borrowerMode: 'single',
    secondBorrowerIncome: 0,
  });

  const [mortgage, setMortgage] = useState<MortgageStructure>({
    primePercent: 40,
    fixedPercent: 40,
    variablePercent: 20,
    primeRate: DEFAULT_RATES.primeRate,
    fixedRate: DEFAULT_RATES.fixedRate,
    variableRate: DEFAULT_RATES.variableRate,
    termYears: 25,
  });

  const [strategy, setStrategy] = useState<Strategy>('balanced');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [motivations, setMotivations] = useState<string[]>([]);

  const handleStrategyChange = (s: Strategy) => {
    setStrategy(s);
    const preset = getStrategyPreset(s);
    setMortgage(prev => ({
      ...prev,
      primePercent: preset.prime,
      fixedPercent: preset.fixed,
      variablePercent: preset.variable,
    }));
  };

  const handleInputChange = (newInputs: PropertyInputs) => {
    let nextInputs = newInputs;

    if (newInputs.price > 0) {
      const parentCont = (newInputs.parentHelp && newInputs.parentHelpAmount > 0) ? newInputs.parentHelpAmount : 0;
      const fp = Math.round(((newInputs.price - newInputs.downPayment - parentCont) / newInputs.price) * 100);
      if (fp !== newInputs.financingPercent) {
        nextInputs = { ...newInputs, financingPercent: fp };
      }
    }

    setInputs(nextInputs);
    if (result) {
      setResult(analyze(nextInputs, mortgage));
    }
  };

  const handleAnalyze = () => {
    const r = analyze(inputs, mortgage);
    setResult(r);
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [heroScale, setHeroScale] = useState(1);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxShrink = 120;
      const progress = Math.min(scrollY / maxShrink, 1);
      setHeroScale(1 - progress * 0.15);

      // Show sticky when scrolled past the property form
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Summary */}
      <StickySummary inputs={inputs} result={result} visible={showSticky} onEditClick={scrollToForm} />

      {/* Hero Section — compact on mobile, shrinks on scroll */}
      <div ref={heroRef} className="relative overflow-hidden" style={{ minHeight: `calc(${heroScale} * max(220px, min(340px, 35vh)))` }}>
        <img
          src={heroBg}
          alt="נוף עירוני"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-[center_25%] hero-image will-change-transform"
          style={{ transform: `scale(${1 + (1 - heroScale) * 0.5})` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        {/* Theme Toggle */}
        <div className="absolute top-4 left-4 z-20">
          <ThemeToggle />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-14 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 lg:pb-24">
          <div className="max-w-2xl">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              מנוע החלטות נדל״ן
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mt-2 sm:mt-3 leading-relaxed drop-shadow-sm">
              לא רק כמה זה עולה — אלא האם אתה באמת יכול לעמוד בזה
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section — separate block between hero and form */}
      <div className="bg-background py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-heading font-extrabold text-foreground text-base sm:text-lg lg:text-xl">
            בדוק תוך 30 שניות אם אתה באמת יכול להרשות לעצמך לקנות דירה
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            👇 התחל מהשלב הראשון — הזן את מחיר הנכס
          </p>
        </div>
      </div>

      {/* Content card */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-8 sm:pb-12 relative z-10">
        <div className="content-card p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <div ref={formRef}>
                <PropertyForm inputs={inputs} onChange={handleInputChange} />
              </div>
              <MortgageConfig
                mortgage={mortgage}
                strategy={strategy}
                onMortgageChange={setMortgage}
                onStrategyChange={handleStrategyChange}
              />
              <PsychologySection motivations={motivations} onChange={setMotivations} />
              <button
                onClick={handleAnalyze}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                בדוק את העסקה
              </button>
            </div>

            <div className="lg:col-span-7">
              {result ? (
                <ResultsDashboard result={result} inputs={inputs} motivations={motivations} />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[240px] sm:min-h-[400px] rounded-2xl border border-border/50 bg-secondary/20">
                  <div className="text-center px-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl">🏠</span>
                    </div>
                    <p className="text-foreground/80 font-heading text-base sm:text-lg font-semibold">הכנס פרטים ולחץ על הכפתור</p>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-xs mx-auto">
                      נבדוק אם העסקה הזו שורדת כשדברים משתבשים
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12">
        <div className="rounded-xl border border-border/30 bg-secondary/10 p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-heading font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>חשוב לדעת</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed">
            המידע המוצג כאן הוא להערכה בלבד, ומבוסס על נתונים והנחות כלליות.
            החישובים אינם מהווים ייעוץ פיננסי, המלצה או התחייבות לקבלת משכנתא.
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed mt-1.5">
            תנאי האשראי בפועל נקבעים על ידי הבנק ועשויים להשתנות בהתאם לנתונים האישיים שלך.
            לפני קבלת החלטה, מומלץ להתייעץ עם גורם מקצועי.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
