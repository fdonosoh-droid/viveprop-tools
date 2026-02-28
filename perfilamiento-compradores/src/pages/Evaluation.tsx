import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, initialFormData } from '@/types/evaluation';
import { evaluar } from '@/lib/evaluation-engine';
import type { EvaluationOutput } from '@/types/evaluation';
import { fetchUF } from '@/lib/uf-service';
import type { UFData } from '@/lib/uf-service';
import { Building2, ArrowLeft, ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import StepPersonal from '@/components/evaluation/StepPersonal';
import StepIncome from '@/components/evaluation/StepIncome';
import StepDebts from '@/components/evaluation/StepDebts';
import StepSavings from '@/components/evaluation/StepSavings';
import StepComplementary from '@/components/evaluation/StepComplementary';
import StepCurrency from '@/components/evaluation/StepCurrency';
import StepSummary from '@/components/evaluation/StepSummary';
import ResultsPanel from '@/components/evaluation/ResultsPanel';

const STEP_TITLES = [
  'Datos personales',
  'Ingresos',
  'Deudas y obligaciones',
  'Ahorro / Pie',
  'Co-solicitante',
  'Moneda',
  'Resumen',
];

const Evaluation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<EvaluationOutput | null>(null);
  const [ufData, setUfData] = useState<UFData | null>(null);
  const [loadingUF, setLoadingUF] = useState(false);
  const [manualUF, setManualUF] = useState(false);

  const update = (partial: Partial<FormData>) => setData(prev => ({ ...prev, ...partial }));

  const handleLoadUF = async () => {
    setLoadingUF(true);
    try {
      const uf = await fetchUF();
      setUfData(uf);
      toast({ title: 'UF cargada', description: `$${uf.valor.toLocaleString('es-CL')} desde ${uf.fuente}` });
      setManualUF(false);
    } catch {
      toast({ title: 'Error al obtener UF', description: 'Ingrese el valor manualmente.', variant: 'destructive' });
      setManualUF(true);
    } finally {
      setLoadingUF(false);
    }
  };

  const handleEvaluar = () => {
    // Use fetched UF or fallback
    const output = evaluar(data, undefined, ufData ?? undefined);
    setResult(output);
  };

  const totalSteps = STEP_TITLES.length;

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onBack={() => setResult(null)} backLabel="Volver al resumen" />
        <main className="flex-1 container py-8 max-w-4xl animate-fade-in">
          <ResultsPanel result={result} data={data} />
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
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <StepPersonal data={data} onChange={update} />}
              {step === 1 && <StepIncome data={data} onChange={update} />}
              {step === 2 && <StepDebts data={data} onChange={update} />}
              {step === 3 && <StepSavings data={data} onChange={update} />}
              {step === 4 && <StepComplementary data={data} onChange={update} />}
              {step === 5 && <StepCurrency data={data} onChange={update} />}
              {step === 6 && (
                <div className="space-y-6">
                  <StepSummary data={data} />
                  <div className="p-4 rounded-lg bg-muted/40 border space-y-3">
                    <h3 className="font-serif text-lg text-foreground">Valor UF</h3>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={handleLoadUF} disabled={loadingUF}>
                        {loadingUF ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                        Cargar UF
                      </Button>
                      {ufData && (
                        <span className="text-sm text-foreground font-medium">
                          UF: ${ufData.valor.toLocaleString('es-CL')}
                        </span>
                      )}
                    </div>
                    {(manualUF || !ufData) && (
                      <div className="space-y-1.5">
                        <Label>Valor UF manual (CLP)</Label>
                        <Input
                          type="number" min={0} step={0.01} placeholder="38847.45"
                          value={ufData?.valor ?? ''}
                          onChange={e => {
                            const v = e.target.value === '' ? 0 : Number(e.target.value);
                            setUfData({ valor: v, fecha: new Date().toISOString(), fuente: 'Ingreso manual' });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                Evaluar
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
          <Building2 className="h-6 w-6 text-accent" />
          <span className="font-serif text-lg text-foreground">Viveprop</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {backLabel}
        </Button>
      </div>
    </header>
  );
}

export default Evaluation;
