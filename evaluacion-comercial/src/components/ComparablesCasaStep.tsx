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
import { formatUF, formatPercent, processComparableCasa } from '@/lib/engines';
import { MATERIAL_LABELS, STATE_LABELS } from '@/lib/types';
import type { ComparableCasa, MarketParams, MaterialType, ConservationState } from '@/lib/types';

interface ComparablesCasaStepProps {
  comparables: ComparableCasa[];
  params: MarketParams;
  onChange: (comps: ComparableCasa[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ComparablesCasaStep({ comparables, params, onChange, onNext, onBack }: ComparablesCasaStepProps) {
  const currentYear = new Date().getFullYear();

  const processed = useMemo(
    () => comparables.map(c => processComparableCasa(c, params, currentYear)),
    [comparables, params, currentYear]
  );

  const update = (id: number, key: keyof ComparableCasa, value: unknown) => {
    onChange(comparables.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  const addRow = () => {
    if (comparables.length >= 12) return;
    const newId = Math.max(...comparables.map(c => c.id), 0) + 1;
    onChange([...comparables, {
      id: newId, active: true, comp_price_pub_uf: 0, comp_land_m2: 0,
      comp_built_m2: 0, comp_year: currentYear - 10, comp_material: 'hormigon',
      comp_state: 'C', comp_cost_uf_m2: 0, comp_parking: 0, comp_storage: 0,
      comp_pub_date: '', comp_portal: '',
    }]);
  };

  const removeRow = (id: number) => {
    onChange(comparables.filter(c => c.id !== id));
  };

  const numCell = (id: number, key: keyof ComparableCasa, step = 1, w = 'w-20') => (
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

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Comparables de Mercado — Casa</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Ingrese hasta 12 propiedades comparables.</p>
        </div>
        <Button size="sm" onClick={addRow} disabled={comparables.length >= 12} className="gap-1">
          <Plus size={14} /> Agregar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="text-xs w-full">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-2 py-2 w-6">#</th>
              <th className="px-2 py-2 w-10">Activo</th>
              <th className="px-2 py-2 w-24">Precio Pub. (UF)</th>
              <th className="px-2 py-2 w-20">m²Terreno</th>
              <th className="px-2 py-2 w-20">m²Constr.</th>
              <th className="px-2 py-2 w-16">Año</th>
              <th className="px-2 py-2 w-32">Material</th>
              <th className="px-2 py-2 w-14">Estado</th>
              <th className="px-2 py-2 w-20">Costo UF/m²</th>
              <th className="px-2 py-2 w-12">Est.</th>
              <th className="px-2 py-2 w-12">Bod.</th>
              {/* Calculated */}
              <th className="px-2 py-2 w-24 bg-navy/80">Precio Venta</th>
              <th className="px-2 py-2 w-20 bg-navy/80">% Vida</th>
              <th className="px-2 py-2 w-20 bg-navy/80">FK RH</th>
              <th className="px-2 py-2 w-24 bg-gold/80 text-navy">Terreno UF/m²</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {processed.map((proc, idx) => {
              const raw = comparables.find(c => c.id === proc.id)!;
              const isAlert = raw.active && raw.comp_price_pub_uf > 0 && (proc.terreno_uf_m2 ?? 0) === 0;
              return (
                <tr
                  key={proc.id}
                  className={`border-b transition-colors ${!raw.active ? 'opacity-40' : ''} ${isAlert ? 'bg-destructive/5' : 'hover:bg-muted/30'}`}
                >
                  <td className="px-2 py-1 text-center text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-2 py-1 text-center">
                    <Checkbox
                      checked={raw.active}
                      onCheckedChange={v => update(raw.id, 'active', !!v)}
                    />
                  </td>
                  {numCell(raw.id, 'comp_price_pub_uf', 0.01, 'w-24')}
                  {numCell(raw.id, 'comp_land_m2', 0.01, 'w-20')}
                  {numCell(raw.id, 'comp_built_m2', 0.01, 'w-20')}
                  {numCell(raw.id, 'comp_year', 1, 'w-16')}
                  <td className="p-0 w-32">
                    <Select value={raw.comp_material} onValueChange={v => update(raw.id, 'comp_material', v as MaterialType)}>
                      <SelectTrigger className="h-8 text-[10px] border-0 rounded-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MATERIAL_LABELS).map(([k, label]) => (
                          <SelectItem key={k} value={k} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-0 w-14">
                    <Select value={raw.comp_state} onValueChange={v => update(raw.id, 'comp_state', v as ConservationState)}>
                      <SelectTrigger className="h-8 text-xs border-0 rounded-none bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(STATE_LABELS).map(k => (
                          <SelectItem key={k} value={k} className="text-xs">{STATE_LABELS[k as ConservationState]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {numCell(raw.id, 'comp_cost_uf_m2', 0.01, 'w-20')}
                  {numCell(raw.id, 'comp_parking', 1, 'w-12')}
                  {numCell(raw.id, 'comp_storage', 1, 'w-12')}
                  {/* Calculated */}
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.precio_venta_uf != null ? formatUF(proc.precio_venta_uf) : '—'}
                  </td>
                  <td className="calc-cell calc-cell-readonly text-center">
                    {proc.pct_vida != null ? formatPercent(proc.pct_vida) : '—'}
                  </td>
                  <td className="calc-cell calc-cell-readonly text-center font-mono">
                    {proc.FK_RH != null ? proc.FK_RH.toFixed(4) : '—'}
                  </td>
                  <td className={`calc-cell text-center font-semibold ${isAlert ? 'text-destructive' : 'text-gold'}`}>
                    {proc.terreno_uf_m2 != null ? formatUF(proc.terreno_uf_m2) : '—'}
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
        💡 Las columnas en fondo claro son calculadas automáticamente.
        La columna <span className="text-gold font-semibold">Terreno UF/m²</span> es clave para el cálculo REP.
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
