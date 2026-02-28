import type { FormData } from '@/types/evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void; }

const StepPersonal = ({ data, onChange }: Props) => {
  const handleNum = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value === '' ? '' : Number(e.target.value) } as any);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Datos personales</h2>
      <p className="text-sm text-muted-foreground">Información básica del solicitante principal.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre completo</Label>
          <Input value={data.nombre} onChange={e => onChange({ nombre: e.target.value })} placeholder="Juan Pérez" />
        </div>
        <div className="space-y-1.5">
          <Label>RUT</Label>
          <Input value={data.rut} onChange={e => onChange({ rut: e.target.value })} placeholder="12.345.678-9" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Edad</Label>
          <Input type="number" min={18} max={99} value={data.edad} onChange={handleNum('edad')} placeholder="35" />
        </div>
        <div className="space-y-1.5">
          <Label>Estado civil</Label>
          <Select value={data.estadoCivil} onValueChange={v => onChange({ estadoCivil: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="soltero">Soltero/a</SelectItem>
              <SelectItem value="casado">Casado/a</SelectItem>
              <SelectItem value="divorciado">Divorciado/a</SelectItem>
              <SelectItem value="viudo">Viudo/a</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Dependientes</Label>
          <Input type="number" min={0} value={data.dependientes} onChange={handleNum('dependientes')} placeholder="0" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tipo de contrato</Label>
          <Select value={data.tipoContrato} onValueChange={v => onChange({ tipoContrato: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dependiente">Dependiente</SelectItem>
              <SelectItem value="independiente">Independiente</SelectItem>
              <SelectItem value="honorarios">Honorarios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Antigüedad laboral (meses)</Label>
          <Input type="number" min={0} value={data.antiguedadMeses} onChange={handleNum('antiguedadMeses')} placeholder="24" />
        </div>
      </div>
    </div>
  );
};

export default StepPersonal;
