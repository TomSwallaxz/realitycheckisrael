import { useState } from 'react';
import { PropertyInputs, MortgageStructure, Strategy, getStrategyPreset, analyze, AnalysisResult } from '@/lib/calculator';
import { PropertyForm } from '@/components/PropertyForm';
import { MortgageConfig } from '@/components/MortgageConfig';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { PsychologySection } from '@/components/PsychologySection';
import heroBg from '@/assets/hero-cityscape.jpg';

const Index = () => {
  const [inputs, setInputs] = useState<PropertyInputs>({
    price: 1800000,
    monthlyRent: 4500,
    propertyType: 'investment',
    downPayment: 540000,
    financingPercent: 70,
    monthlyIncome: 22000,
    cashBuffer: 100000,
    region: 'מרכז (תל אביב, גוש דן)',
    isFirstApartment: false,
    parentHelp: false,
    parentHelpAmount: 0,
  });

  const [mortgage, setMortgage] = useState<MortgageStructure>({
    primePercent: 40,
    fixedPercent: 40,
    variablePercent: 20,
    primeRate: 6.0,
    fixedRate: 5.5,
    variableRate: 5.0,
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
    setInputs(newInputs);
    if (newInputs.price > 0) {
      const fp = Math.round(((newInputs.price - newInputs.downPayment) / newInputs.price) * 100);
      if (fp !== newInputs.financingPercent) {
        setInputs({ ...newInputs, financingPercent: fp });
      }
    }
  };

  const handleAnalyze = () => {
    const r = analyze(inputs, mortgage);
    setResult(r);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-16">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              מנוע החלטות נדל״ן
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 mt-3 leading-relaxed">
              לא רק כמה זה עולה — אלא האם אתה באמת יכול לעמוד בזה
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 pb-12 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <PropertyForm inputs={inputs} onChange={handleInputChange} />
            <MortgageConfig
              mortgage={mortgage}
              strategy={strategy}
              onMortgageChange={setMortgage}
              onStrategyChange={handleStrategyChange}
            />
            <PsychologySection motivations={motivations} onChange={setMotivations} />
            <button
              onClick={handleAnalyze}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              בדוק את העסקה
            </button>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <ResultsDashboard result={result} inputs={inputs} motivations={motivations} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <p className="text-foreground/80 font-heading text-lg font-semibold">הכנס פרטים ולחץ על הכפתור</p>
                  <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                    נבדוק אם העסקה הזו שורדת כשדברים משתבשים
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
