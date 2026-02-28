import type { FormData } from '@/types/evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepSavings = ({ data, onChange }: Props) => {
  const handleNum = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value === '' ? '' : Number(e.target.value) } as any);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Ahorro / Pie disponible</h2>
      <p className="text-sm text-muted-foreground">Monto total disponible para el pie de la propiedad, en CLP.</p>

      <div className="space-y-1.5">
        <Label>Pie disponible (CLP)</Label>
        <Input type="number" min={0} value={data.pieDisponible} onChange={handleNum('pieDisponible')} placeholder="15.000.000" />
        <p className="text-xs text-muted-foreground">Incluye ahorros, subsidios u otros fondos para el pie.</p>
      </div>
    </div>
  );
};

export default StepSavings;
