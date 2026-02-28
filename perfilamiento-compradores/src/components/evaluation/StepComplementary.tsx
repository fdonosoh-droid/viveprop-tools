import type { FormData } from '@/types/evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepComplementary = ({ data, onChange }: Props) => {
  const handleNum = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value === '' ? '' : Number(e.target.value) } as any);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Co-solicitante</h2>
      <p className="text-sm text-muted-foreground">Puedes agregar un co-solicitante para aumentar tu capacidad.</p>

      <div className="flex items-center gap-3">
        <Switch checked={data.tieneComplementario} onCheckedChange={v => onChange({ tieneComplementario: v })} />
        <Label>Agregar co-solicitante</Label>
      </div>

      {data.tieneComplementario && (
        <div className="space-y-4 pt-4 border-t animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={data.comp_nombre} onChange={e => onChange({ comp_nombre: e.target.value })} placeholder="María López" />
            </div>
            <div className="space-y-1.5">
              <Label>RUT</Label>
              <Input value={data.comp_rut} onChange={e => onChange({ comp_rut: e.target.value })} placeholder="11.222.333-4" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Relación</Label>
            <Select value={data.comp_relacion} onValueChange={v => onChange({ comp_relacion: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conyuge">Cónyuge</SelectItem>
                <SelectItem value="conviviente">Conviviente civil</SelectItem>
                <SelectItem value="familiar">Familiar directo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <h3 className="font-serif text-lg pt-2">Ingresos del co-solicitante</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Renta líquida</Label>
              <Input type="number" min={0} value={data.comp_rentaLiquida} onChange={handleNum('comp_rentaLiquida')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Variables</Label>
              <Input type="number" min={0} value={data.comp_ingresosVariables} onChange={handleNum('comp_ingresosVariables')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Otros</Label>
              <Input type="number" min={0} value={data.comp_otrosIngresos} onChange={handleNum('comp_otrosIngresos')} placeholder="0" />
            </div>
          </div>

          <h3 className="font-serif text-lg pt-2">Deudas del co-solicitante</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cuotas créditos</Label>
              <Input type="number" min={0} value={data.comp_cuotasCreditos} onChange={handleNum('comp_cuotasCreditos')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Pago tarjetas</Label>
              <Input type="number" min={0} value={data.comp_pagoTarjetas} onChange={handleNum('comp_pagoTarjetas')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Pensiones</Label>
              <Input type="number" min={0} value={data.comp_pensiones} onChange={handleNum('comp_pensiones')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Otras oblig.</Label>
              <Input type="number" min={0} value={data.comp_otrasObligaciones} onChange={handleNum('comp_otrasObligaciones')} placeholder="0" />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label>Pie adicional del co-solicitante (CLP)</Label>
            <Input type="number" min={0} value={data.comp_pieDisponible} onChange={handleNum('comp_pieDisponible')} placeholder="0" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StepComplementary;
