import { useState } from 'react';
import type { PropertyFormData } from '@/types/property-evaluation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { fetchUF } from '@/lib/perfilamiento/uf-service';
import type { UFData } from '@/lib/perfilamiento/uf-service';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: PropertyFormData;
  onChange: (p: Partial<PropertyFormData>) => void;
  ufData: UFData | null;
  onUFLoaded: (uf: UFData) => void;
}

const pctOptions = Array.from({ length: 31 }, (_, i) => i); // 0-30
const pieOptions = [10, 15, 20, 25, 30, 35, 40, 50];

const StepProperty = ({ data, onChange, ufData, onUFLoaded }: Props) => {
  const [loadingUF, setLoadingUF] = useState(false);
  const [manualUF, setManualUF] = useState(false);
  const { toast } = useToast();

  const handleLoadUF = async () => {
    setLoadingUF(true);
    try {
      const uf = await fetchUF();
      onUFLoaded(uf);
      toast({ title: 'UF cargada', description: `$${uf.valor.toLocaleString('es-CL')} desde ${uf.fuente}` });
      setManualUF(false);
    } catch {
      toast({ title: 'Error al obtener UF', description: 'Ingrese el valor manualmente.', variant: 'destructive' });
      setManualUF(true);
    } finally {
      setLoadingUF(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-foreground">Datos de la propiedad</h2>
      <p className="text-sm text-muted-foreground">Ingrese los datos de la propiedad específica a evaluar.</p>

      {/* UF Section */}
      <div className="p-4 rounded-lg bg-muted/40 border space-y-3">
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
              type="number"
              min={0}
              step={0.01}
              placeholder="38847.45"
              value={ufData?.valor ?? ''}
              onChange={e => {
                const v = e.target.value === '' ? 0 : Number(e.target.value);
                onUFLoaded({ valor: v, fecha: new Date().toISOString(), fuente: 'Ingreso manual' });
              }}
            />
          </div>
        )}
      </div>

      {/* Property details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Ubicación / Proyecto</Label>
          <Input value={data.ubicacion} onChange={e => onChange({ ubicacion: e.target.value })} placeholder="Santiago Centro, Proyecto X" />
        </div>
        <div className="space-y-1.5">
          <Label>Tipología</Label>
          <Select value={data.tipologia} onValueChange={v => onChange({ tipologia: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="departamento">Departamento</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="oficina">Oficina</SelectItem>
              <SelectItem value="bodega">Bodega / Estacionamiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Valor de lista de la propiedad (UF)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={data.valorPropiedadUF || ''}
          onChange={e => onChange({ valorPropiedadUF: e.target.value === '' ? 0 : Number(e.target.value) })}
          placeholder="3.500"
        />
        {data.valorPropiedadUF > 0 && ufData && (
          <p className="text-xs text-muted-foreground">
            ≈ ${(data.valorPropiedadUF * ufData.valor).toLocaleString('es-CL', { maximumFractionDigits: 0 })} CLP
          </p>
        )}
      </div>

      {/* Adjustments */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Bono Pie (%)</Label>
          <Select value={String(data.bonoPiePct)} onValueChange={v => onChange({ bonoPiePct: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-48">
              {pctOptions.map(p => (
                <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Reduce el precio de lista (no requiere desembolsar pie).</p>
        </div>
        <div className="space-y-1.5">
          <Label>Descuento (%)</Label>
          <Select value={String(data.descuentoPct)} onValueChange={v => onChange({ descuentoPct: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-48">
              {pctOptions.map(p => (
                <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Descuento aplicado al valor de lista.</p>
        </div>
      </div>

      {/* Pie */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Pie aportado (%)</Label>
          <Select value={String(data.piePct)} onValueChange={v => onChange({ piePct: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {pieOptions.map(p => (
                <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Base: 20% del valor de lista. Ajuste según disponibilidad.</p>
        </div>
        <div className="space-y-1.5">
          <Label>O monto pie manual (CLP)</Label>
          <Input
            type="number"
            min={0}
            value={data.pieMontoManualCLP}
            onChange={e => onChange({ pieMontoManualCLP: e.target.value === '' ? '' : Number(e.target.value) } as any)}
            placeholder="Dejar vacío para usar %"
          />
          <p className="text-xs text-muted-foreground">Si ingresa un monto, este se usará en vez del porcentaje.</p>
        </div>
      </div>
    </div>
  );
};

export default StepProperty;
