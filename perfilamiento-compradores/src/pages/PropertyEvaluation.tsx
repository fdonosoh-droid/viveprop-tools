import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyFormData, initialPropertyFormData } from '@/types/property-evaluation';
import type { PropertyEvalOutput } from '@/types/property-evaluation';
import type { UFData } from '@/lib/uf-service';
import { evaluarPropiedad } from '@/lib/property-engine';
import { Building2, ArrowLeft, ArrowRight, CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StepProperty from '@/components/property/StepProperty';
import StepPersonal from '@/components/evaluation/StepPersonal';
import StepIncome from '@/components/evaluation/StepIncome';
import StepDebts from '@/components/evaluation/StepDebts';
import StepComplementary from '@/components/evaluation/StepComplementary';
import StepSummary from '@/components/evaluation/StepSummary';
import PropertyResultsPanel from '@/components/property/PropertyResultsPanel';
import { useToast } from '@/hooks/use-toast';

const STEP_TITLES = [
  'Propiedad',
  'Datos personales',
  'Ingresos',
  'Deudas y obligaciones',
  'Codeudor',
  'Resumen',
];

const PropertyEvaluation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PropertyFormData>(initialPropertyFormData);
  const [ufData, setUfData] = useState<UFData | null>(null);
  const [result, setResult] = useState<PropertyEvalOutput | null>(null);

  const update = (partial: Partial<PropertyFormData>) => setData(prev => ({ ...prev, ...partial }));

  const handleEvaluar = () => {
    if (!ufData || ufData.valor <= 0) {
      toast({ title: 'UF requerida', description: 'Cargue o ingrese el valor de la UF antes de evaluar.', variant: 'destructive' });
      return;
    }
    if (data.valorPropiedadUF <= 0) {
      toast({ title: 'Valor propiedad requerido', description: 'Ingrese el valor de la propiedad en UF.', variant: 'destructive' });
      return;
    }
    const output = evaluarPropiedad(data, ufData);
    setResult(output);
  };

  const totalSteps = STEP_TITLES.length;

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onBack={() => setResult(null)} backLabel="Volver al resumen" />
        <main className="flex-1 container py-8 max-w-4xl animate-fade-in">
          <PropertyResultsPanel result={result} data={data} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onBack={() => step === 0 ? navigate('/') : setStep(s => s - 1)} backLabel={step === 0 ? 'Inicio' : 'Anterior'} />

      <main className="flex-1 container py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso {step + 1} de {totalSteps}</span>
            <span className="text-sm font-medium text-foreground">{STEP_TITLES[step]}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {step === 0 && <StepProperty data={data} onChange={update} ufData={ufData} onUFLoaded={setUfData} />}
              {step === 1 && <StepPersonal data={data} onChange={update} />}
              {step === 2 && <StepIncome data={data} onChange={update} />}
              {step === 3 && <StepDebts data={data} onChange={update} />}
              {step === 4 && <StepComplementary data={data} onChange={update} />}
              {step === 5 && <StepSummary data={data} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {step === 0 ? 'Inicio' : 'Anterior'}
            </Button>
            {step < totalSteps - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-accent hover:bg-accent/90" onClick={handleEvaluar}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Evaluar propiedad
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

function Header({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  return (
    <header className="border-b bg-card">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-accent" />
          <span className="font-serif text-lg text-foreground">Viveprop — Propiedad</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {backLabel}
        </Button>
      </div>
    </header>
  );
}

export default PropertyEvaluation;
