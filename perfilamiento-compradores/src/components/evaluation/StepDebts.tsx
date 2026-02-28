import type { FormData } from '@/types/evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepDebts = ({ data, onChange }: Props) => {
  const handleNum = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value === '' ? '' : Number(e.target.value) } as any);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Deudas y obligaciones</h2>
      <p className="text-sm text-muted-foreground">Cuotas mensuales vigentes en CLP.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Cuotas de créditos</Label>
          <Input type="number" min={0} value={data.cuotasCreditos} onChange={handleNum('cuotasCreditos')} placeholder="0" />
          <p className="text-xs text-muted-foreground">Consumo, automotriz, etc.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Pago tarjetas de crédito</Label>
          <Input type="number" min={0} value={data.pagoTarjetas} onChange={handleNum('pagoTarjetas')} placeholder="0" />
          <p className="text-xs text-muted-foreground">Pago mínimo o cuota pactada.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Pensiones alimenticias</Label>
          <Input type="number" min={0} value={data.pensiones} onChange={handleNum('pensiones')} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label>Otras obligaciones</Label>
          <Input type="number" min={0} value={data.otrasObligaciones} onChange={handleNum('otrasObligaciones')} placeholder="0" />
        </div>
      </div>

      <div className="pt-4 border-t space-y-3">
        <div className="flex items-center gap-3">
          <Switch checked={data.morosidad} onCheckedChange={v => onChange({ morosidad: v })} />
          <Label>¿Tiene morosidades o protestos vigentes?</Label>
        </div>
        {data.morosidad && (
          <Textarea
            value={data.notasMorosidad}
            onChange={e => onChange({ notasMorosidad: e.target.value })}
            placeholder="Describe brevemente la situación..."
            rows={2}
          />
        )}
      </div>
    </div>
  );
};

export default StepDebts;
