import { useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatUF, processComparableDepto } from '@/lib/evaluacion/engines';
import { FACTOR_ESTADO_OPTIONS, FACTOR_ORIENT_OPTIONS, FACTOR_ANTIPUB_OPTIONS } from '@/lib/evaluacion/types';
import type { ComparableDepto, MarketParams } from '@/lib/evaluacion/types';

interface ComparablesDeptStepProps {
  comparables: ComparableDepto[];
  params: MarketParams;
  onChange: (comps: ComparableDepto[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ComparablesDeptStep({ comparables, params, onChange, onNext, onBack }: ComparablesDeptStepProps) {
  const processed = useMemo(
    () => comparables.map(c => processComparableDepto(c, params)),
    [comparables, params]
  );

  const update = (id: number, key: keyof ComparableDepto, value: unknown) => {
    onChange(comparables.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  const addRow = () => {
    if (comparables.length >= 6) return;
    const newId = Math.max(...comparables.map(c => c.id), 0) + 1;
    onChange([...comparables, {
      id: newId, active: true, comp_price_pub_uf: 0, comp_util_m2: 0,
      comp_terrace_m2: 0, comp_factor_estado: 1.00, comp_factor_orient: 1.00,
      comp_factor_antipub: 1.00, comp_parking: 0, comp_storage: 0,
      comp_pub_date: '', comp_portal: '',
    }]);
  };

  const removeRow = (id: number) => {
    onChange(comparables.filter(c => c.id !== id));
  };

  const numCell = (id: number, key: keyof ComparableDepto, step = 1, w = 'w-20') => (
    <td className={`${w} p-0`}>
      <input
        type="number"
        step={step}
        value={(comparables.find(c => c.id === id)?.[key] as number) ?? ''}
        onChange={e => update(id, key, e.target.value === '' ? 0 : parseFloat(e.target.value))}
        className="input-compact text-center"
      />
    </td>
  );

  const factorSelect = (id: number, key: keyof ComparableDepto, options: {value:number;label:string}[], w = 'w-24') => {
    const val = (comparables.find(c => c.id === id)?.[key] as number) ?? 1.00;
    return (
      <td className={`p-0 ${w}`}>
        <Select
          value={val.toString()}
          onValueChange={v => update(id, key, parseFloat(v))}
        >
          <SelectTrigger className="h-8 text-[10px] border-0 rounded-none bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value.toString()} className="text-xs">
                {opt.value.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
    );
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Comparables de Mercado — Departamento</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Ingrese hasta 6 propiedades comparables.</p>
        </div>
        <Button size="sm" onClick={addRow} disabled={comparables.length >= 6} className="gap-1">
          <Plus size={14} /> Agregar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-2 py-2 w-6">#</th>
              <th className="px-2 py-2 w-10">Activo</th>
              <th className="px-2 py-2 w-24">Precio (UF)</th>
              <th className="px-2 py-2 w-20">m²Útiles</th>
              <th className="px-2 py-2 w-16">m²Terraza</th>
              <th className="px-2 py-2 w-24">F.Estado</th>
              <th className="px-2 py-2 w-24">F.Orient.</th>
              <th className="px-2 py-2 w-24">F.AntPub.</th>
              <th className="px-2 py-2 w-12">Est.</th>
              <th className="px-2 py-2 w-12">Bod.</th>
              {/* Calculated */}
              <th className="px-2 py-2 bg-navy/80">Precio Venta</th>
              <th className="px-2 py-2 bg-navy/80">m²Total</th>
              <th className="px-2 py-2 bg-navy/80">Precio Neto</th>
              <th className="px-2 py-2 bg-navy/80">UF/m²Nom.</th>
              <th className="px-2 py-2 bg-gold/80 text-navy">UF/m²Ajust.</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {processed.map((proc, idx) => {
              const raw = comparables.find(c => c.id === proc.id)!;
              return (
                <tr
                  key={proc.id}
                  className={`border-b transition-colors ${!raw.active ? 'opacity-40' : 'hover:bg-muted/30'}`}
                >
                  <td className="px-2 py-1 text-center text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-2 py-1 text-center">
                    <Checkbox
                      checked={raw.active}
                      onCheckedChange={v => update(raw.id, 'active', !!v)}
                    />
                  </td>
                  {numCell(raw.id, 'comp_price_pub_uf', 0.01, 'w-24')}
                  {numCell(raw.id, 'comp_util_m2', 0.01, 'w-20')}
                  {numCell(raw.id, 'comp_terrace_m2', 0.01, 'w-16')}
                  {factorSelect(raw.id, 'comp_factor_estado', FACTOR_ESTADO_OPTIONS)}
                  {factorSelect(raw.id, 'comp_factor_orient', FACTOR_ORIENT_OPTIONS)}
                  {factorSelect(raw.id, 'comp_factor_antipub', FACTOR_ANTIPUB_OPTIONS)}
                  {numCell(raw.id, 'comp_parking', 1, 'w-12')}
                  {numCell(raw.id, 'comp_storage', 1, 'w-12')}
                  {/* Calculated */}
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.precio_venta_uf != null ? formatUF(proc.precio_venta_uf) : '—'}
                  </td>
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.m2_total_comp != null ? formatUF(proc.m2_total_comp) : '—'}
                  </td>
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.precio_neto_uf != null ? formatUF(proc.precio_neto_uf) : '—'}
                  </td>
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.valor_nominal_uf_m2 != null ? formatUF(proc.valor_nominal_uf_m2) : '—'}
                  </td>
                  <td className="calc-cell text-center font-semibold text-gold">
                    {proc.valor_ajustado_uf_m2 != null ? formatUF(proc.valor_ajustado_uf_m2) : '—'}
                  </td>
                  <td className="px-1 py-1">
                    <button
                      onClick={() => removeRow(raw.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 La columna <span className="text-gold font-semibold">UF/m² Ajustado</span> es clave para el Método de Competencia Directa.
        Se requieren al menos 3 comparables activos con valor calculado.
      </p>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft size={16} /> Atrás
        </Button>
        <Button onClick={onNext} className="gap-2">
          Calcular <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
