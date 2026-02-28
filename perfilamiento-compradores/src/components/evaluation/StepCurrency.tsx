import type { FormData } from '@/types/evaluation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepCurrency = ({ data, onChange }: Props) => (
  <div className="space-y-5">
    <h2 className="font-serif text-2xl text-foreground">Preferencia de moneda</h2>
    <p className="text-sm text-muted-foreground">Elige en qué moneda quieres ver los resultados.</p>

    <RadioGroup value={data.moneda} onValueChange={v => onChange({ moneda: v as FormData['moneda'] })} className="space-y-3 pt-2">
      {([
        ['CLP', 'Pesos chilenos (CLP)', 'Todos los montos en pesos.'],
        ['UF', 'Unidades de Fomento (UF)', 'Todos los montos convertidos a UF.'],
        ['ambas', 'Mostrar ambas', 'Resultados lado a lado en CLP y UF.'],
      ] as const).map(([val, label, desc]) => (
        <label
          key={val}
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
            data.moneda === val ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'
          }`}
        >
          <RadioGroupItem value={val} className="mt-0.5" />
          <div>
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-sm text-muted-foreground">{desc}</div>
          </div>
        </label>
      ))}
    </RadioGroup>
  </div>
);

export default StepCurrency;
