import { useState } from 'react';
import { PropertyInputs, MortgageStructure, Strategy, getStrategyPreset, analyze, AnalysisResult } from '@/lib/calculator';
import { PropertyForm } from '@/components/PropertyForm';
import { MortgageConfig } from '@/components/MortgageConfig';
import { ResultsDashboard } from '@/components/ResultsDashboard';

const Index = () => {
  const [inputs, setInputs] = useState<PropertyInputs>({
    price: 1500000,
    monthlyRent: 4500,
    propertyType: 'investment',
    downPayment: 450000,
    monthlyIncome: 20000,
    cashBuffer: 150000,
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

  const handleAnalyze = () => {
    const r = analyze(inputs, mortgage);
    setResult(r);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Real Estate Decision Engine
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Don't ask how to take a mortgage — ask if the deal survives when things go wrong.
            </p>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-sm bg-danger/10 text-danger text-xs font-heading font-semibold tracking-wide uppercase">
            Challenge Mode
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <PropertyForm inputs={inputs} onChange={setInputs} />
            <MortgageConfig
              mortgage={mortgage}
              strategy={strategy}
              onMortgageChange={setMortgage}
              onStrategyChange={handleStrategyChange}
            />
            <button
              onClick={handleAnalyze}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              STRESS TEST THIS DEAL
            </button>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7">
            {result ? (
              <ResultsDashboard result={result} inputs={inputs} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] rounded-lg border border-border border-dashed">
                <div className="text-center">
                  <p className="text-muted-foreground font-heading text-lg">Configure & Analyze</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    Fill in the details and hit stress test
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
