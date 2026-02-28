import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StepIndicator } from '@/components/StepIndicator';
import { PropertyTypeSelector } from '@/components/PropertyTypeSelector';
import { ConfigStep } from '@/components/ConfigStep';
import { SubjectStep } from '@/components/SubjectStep';
import { ComparablesCasaStep } from '@/components/ComparablesCasaStep';
import { ComparablesDeptStep } from '@/components/ComparablesDeptStep';
import { ResultsStep } from '@/components/ResultsStep';
import { RentalStep } from '@/components/RentalStep';
import { ReportStep } from '@/components/ReportStep';
import {
  DEFAULT_PARAMS,
  createEmptyCasaComparables,
  createEmptyDeptoComparables,
  createEmptyArriendoAnalysis,
} from '@/lib/types';
import { runCasaValuation, runDeptoValuation } from '@/lib/engines';
import type {
  PropertyType,
  MarketParams,
  Subject,
  SubjectCasa,
  SubjectDepto,
  ComparableCasa,
  ComparableDepto,
  ValuationResult,
  ArriendoAnalysis,
} from '@/lib/types';

const Index = () => {
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [params, setParams] = useState<MarketParams>(DEFAULT_PARAMS);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subject, setSubject] = useState<Record<string, any>>({});
  const [compsCasa, setCompsCasa] = useState<ComparableCasa[]>(createEmptyCasaComparables());
  const [compsDepto, setCompsDepto] = useState<ComparableDepto[]>(createEmptyDeptoComparables());
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [arriendoAnalysis, setArriendoAnalysis] = useState<ArriendoAnalysis>(createEmptyArriendoAnalysis());

  const selectType = (type: PropertyType) => {
    setPropertyType(type);
    if (type === 'DEPTO') {
      setSubject({
        property_type: 'DEPTO',
        subject_factor_estado: 1.00,
        subject_factor_orient: 1.00,
        subject_factor_franja: 1.00,
      } as Partial<SubjectDepto>);
    } else {
      setSubject({ property_type: 'CASA' } as Partial<SubjectCasa>);
    }
    setStep(1);
  };

  const calculate = () => {
    try {
      let res: ValuationResult;
      if (propertyType === 'CASA') {
        res = runCasaValuation(subject as SubjectCasa, compsCasa, params);
      } else {
        res = runDeptoValuation(subject as SubjectDepto, compsDepto, params);
      }
      setResult(res);
      setStep(4);
    } catch (e) {
      toast({
        title: 'Error de Cálculo',
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  };

  const reset = () => {
    setStep(0);
    setPropertyType(null);
    setParams(DEFAULT_PARAMS);
    setSubject({});
    setCompsCasa(createEmptyCasaComparables());
    setCompsDepto(createEmptyDeptoComparables());
    setResult(null);
    setArriendoAnalysis(createEmptyArriendoAnalysis());
  };

  const containerClass =
    step === 0 ? '' : step === 3 ? 'p-4' : 'p-4 sm:p-8';

  return (
    <div className="min-h-screen bg-background">
      <StepIndicator currentStep={step} propertyType={propertyType} onReset={reset} />

      <div className={containerClass}>
        {step === 0 && (
          <PropertyTypeSelector onSelect={selectType} />
        )}
        {step === 1 && (
          <ConfigStep
            params={params}
            propertyType={propertyType}
            onChange={setParams}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <SubjectStep
            subject={subject}
            propertyType={propertyType}
            onChange={setSubject}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && propertyType === 'CASA' && (
          <ComparablesCasaStep
            comparables={compsCasa}
            params={params}
            onChange={setCompsCasa}
            onNext={calculate}
            onBack={() => setStep(2)}
          />
        )}
        {step === 3 && propertyType === 'DEPTO' && (
          <ComparablesDeptStep
            comparables={compsDepto}
            params={params}
            onChange={setCompsDepto}
            onNext={calculate}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && result && (
          <ResultsStep
            result={result}
            params={params}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <RentalStep
            analysis={arriendoAnalysis}
            uf_value_clp={params.uf_value_clp}
            onChange={setArriendoAnalysis}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
          />
        )}
        {step === 6 && result && (
          <ReportStep
            result={result}
            params={params}
            subject={subject}
            arriendoAnalysis={arriendoAnalysis}
            onBack={() => setStep(5)}
            onReset={reset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
