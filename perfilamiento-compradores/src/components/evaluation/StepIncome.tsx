import type { FormData } from '@/types/evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepIncome = ({ data, onChange }: Props) => {
  const handleNum = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value === '' ? '' : Number(e.target.value) } as any);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Ingresos mensuales</h2>
      <p className="text-sm text-muted-foreground">Ingresa los montos en pesos chilenos (CLP).</p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Renta líquida mensual</Label>
          <Input type="number" min={0} value={data.rentaLiquida} onChange={handleNum('rentaLiquida')} placeholder="1.500.000" />
          <p className="text-xs text-muted-foreground">Sueldo líquido después de descuentos legales.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Ingresos variables (promedio mensual)</Label>
          <Input type="number" min={0} value={data.ingresosVariables} onChange={handleNum('ingresosVariables')} placeholder="200.000" />
          <p className="text-xs text-muted-foreground">Comisiones, bonos, horas extra. Se considera 50% para evaluación.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Otros ingresos</Label>
          <Input type="number" min={0} value={data.otrosIngresos} onChange={handleNum('otrosIngresos')} placeholder="0" />
          <p className="text-xs text-muted-foreground">Arriendos, pensiones, rentas de capital, etc.</p>
        </div>
      </div>
    </div>
  );
};

export default StepIncome;
