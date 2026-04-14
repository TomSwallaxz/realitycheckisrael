import { useState } from 'react';
import { PropertyInputs, MortgageStructure, Strategy, getStrategyPreset, analyze, AnalysisResult } from '@/lib/calculator';
import { PropertyForm } from '@/components/PropertyForm';
import { MortgageConfig } from '@/components/MortgageConfig';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { PsychologySection } from '@/components/PsychologySection';

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
    // Sync financing percent with down payment
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
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
              מנוע החלטות נדל״ן
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              לא שואלים ״כמה אני יכול לקחת״ — שואלים ״מה קורה כשדברים משתבשים?״
            </p>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-sm bg-danger/10 text-danger text-xs font-heading font-semibold tracking-wide">
            מצב אתגר
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
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
              className="w-full py-3.5 rounded-md bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              בדוק את העסקה — בלי רגשות
            </button>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <ResultsDashboard result={result} inputs={inputs} motivations={motivations} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] rounded-lg border border-border border-dashed">
                <div className="text-center">
                  <p className="text-muted-foreground font-heading text-lg">הכנס פרטים ולחץ על הכפתור</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    אנחנו נבדוק אם העסקה הזו שורדת כשדברים משתבשים
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
