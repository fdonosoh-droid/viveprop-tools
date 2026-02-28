import { useState } from 'react';
import { Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { MarketParams, PropertyType } from '@/lib/evaluacion/types';

interface ConfigStepProps {
  params: MarketParams;
  propertyType: PropertyType | null;
  onChange: (params: MarketParams) => void;
  onNext: () => void;
}

export function ConfigStep({ params, propertyType, onChange, onNext }: ConfigStepProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const set = (key: keyof MarketParams, value: number | null) => {
    onChange({ ...params, [key]: value });
  };

  const loadUF = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://mindicador.cl/api/uf');
      const data = await res.json();
      const valor = data?.serie?.[0]?.valor;
      if (valor && typeof valor === 'number') {
        set('uf_value_clp', valor);
        toast({ title: 'UF cargada', description: `Valor UF: $${valor.toLocaleString('es-CL')}` });
      } else {
        throw new Error('Respuesta inesperada');
      }
    } catch {
      toast({
        title: 'No se pudo cargar la UF',
        description: 'Ingrese el valor manualmente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const numInput = (
    label: string,
    key: keyof MarketParams,
    step = 0.01,
    hint?: string
  ) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      <Input
        type="number"
        step={step}
        value={params[key] ?? ''}
        onChange={e => set(key, e.target.value === '' ? null : parseFloat(e.target.value))}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Parámetros de Mercado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure los valores de referencia para el cálculo de tasación.
        </p>
      </div>

      {/* UF del día */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-navy text-sm">Valor UF del día (CLP)</p>
            <p className="text-xs text-muted-foreground">Necesario para conversiones a pesos</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadUF} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Cargar UF
          </Button>
        </div>
        <Input
          type="number"
          step={1}
          placeholder="Ej: 38000"
          value={params.uf_value_clp ?? ''}
          onChange={e => set('uf_value_clp', e.target.value === '' ? null : parseFloat(e.target.value))}
          className="h-9"
        />
        {params.uf_value_clp && (
          <p className="text-xs text-primary font-medium">
            ✓ UF = ${params.uf_value_clp.toLocaleString('es-CL')} CLP
          </p>
        )}
      </div>

      {/* Parámetros comunes */}
      <div>
        <h3 className="text-sm font-semibold text-navy mb-3">Parámetros Generales</h3>
        <div className="grid grid-cols-2 gap-3">
          {numInput('Factor Negociación', 'negotiation_factor', 0.01, 'Ej: 0.95 = -5%')}
          {numInput('UF Bodega', 'storage_uf', 1, 'Valor UF por bodega')}
        </div>
      </div>

      {/* Casa-specific */}
      {propertyType === 'CASA' && (
        <div>
          <h3 className="text-sm font-semibold text-navy mb-3">Parámetros Casa</h3>
          <div className="grid grid-cols-2 gap-3">
            {numInput('UF Estacionamiento Casa', 'parking_uf_casa', 1)}
            {numInput('Costo REP (UF/m²)', 'construction_cost_rep', 0.01)}
            {numInput('Costo STDEV (UF/m²)', 'construction_cost_stdev', 0.01)}
            {numInput('Costo Adicional (UF/m²)', 'additional_cost', 0.01)}
            {numInput('Peso terraza área', 'terrace_weight_casa_area', 0.01, '0.70 = 70% del área')}
            {numInput('Factor ajuste STDEV', 'stdev_factor_adj', 0.01)}
          </div>
        </div>
      )}

      {/* Depto-specific */}
      {propertyType === 'DEPTO' && (
        <div>
          <h3 className="text-sm font-semibold text-navy mb-3">Parámetros Departamento</h3>
          <div className="grid grid-cols-2 gap-3">
            {numInput('UF Estacionamiento Depto', 'parking_uf_depto', 1)}
            {numInput('Peso terraza área', 'terrace_weight_depto_area', 0.01, '0.50 = 50% del área')}
            {numInput('Peso precio terraza', 'terrace_price_weight_depto', 0.01, '0.70 = 70% precio útil')}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} className="gap-2">
          Datos del Inmueble
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
