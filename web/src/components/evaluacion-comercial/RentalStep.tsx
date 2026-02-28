import { useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatUF, formatCLP, formatPercent, calcArriendoResult } from '@/lib/evaluacion/engines';
import type { ArriendoAnalysis, MonedaArriendo, VacanciaMeses } from '@/lib/evaluacion/types';

interface RentalStepProps {
  analysis: ArriendoAnalysis;
  uf_value_clp: number | null;
  onChange: (a: ArriendoAnalysis) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RentalStep({ analysis, uf_value_clp, onChange, onNext, onBack }: RentalStepProps) {
  const updateComp = (id: number, key: string, value: unknown) => {
    onChange({
      ...analysis,
      comparables: analysis.comparables.map(c => c.id === id ? { ...c, [key]: value } : c),
    });
  };

  const addComp = () => {
    const newId = Math.max(...analysis.comparables.map(c => c.id), 0) + 1;
    onChange({
      ...analysis,
      comparables: [...analysis.comparables, { id: newId, referencia: '', util_m2: 0, arriendo_publicado: 0, moneda: 'CLP' }],
    });
  };

  const removeComp = (id: number) => {
    if (analysis.comparables.length <= 3) return;
    onChange({ ...analysis, comparables: analysis.comparables.filter(c => c.id !== id) });
  };

  const hasUFComps = analysis.comparables.some(c => c.moneda === 'UF' && c.arriendo_publicado > 0);

  const arriendoResult = useMemo(() => {
    try {
      return calcArriendoResult(analysis, uf_value_clp);
    } catch {
      return null;
    }
  }, [analysis, uf_value_clp]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp size={22} className="text-primary" />
        <div>
          <h2 className="text-xl font-bold text-navy">Análisis de Arriendos y Rentabilidad</h2>
          <p className="text-sm text-muted-foreground">Ingrese comparables de arriendo para calcular el cap rate.</p>
        </div>
      </div>

      {/* Comparables de arriendo */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-navy">Comparables de Arriendo</h3>
          <Button size="sm" variant="outline" onClick={addComp} className="gap-1 text-xs">
            <Plus size={13} /> Agregar
          </Button>
        </div>

        {hasUFComps && !uf_value_clp && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />
            Hay comparables en UF pero no se ha ingresado el valor UF del día. Ingrese la UF en el paso de Configuración.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">Dirección/Referencia</th>
                <th className="px-2 py-1.5 text-center w-20">m²Totales</th>
                <th className="px-2 py-1.5 text-center w-28">Arriendo Publicado</th>
                <th className="px-2 py-1.5 text-center w-16">Moneda</th>
                {uf_value_clp && <th className="px-2 py-1.5 text-center w-28 bg-accent/10">Arriendo (CLP)</th>}
                <th className="px-2 py-1.5 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {analysis.comparables.map((comp, idx) => {
                const arriendoCLP = comp.moneda === 'UF' && uf_value_clp
                  ? comp.arriendo_publicado * uf_value_clp
                  : comp.moneda === 'CLP' ? comp.arriendo_publicado : null;
                return (
                  <tr key={comp.id} className="border-b hover:bg-muted/20">
                    <td className="px-2 py-1 text-muted-foreground">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={comp.referencia}
                        onChange={e => updateComp(comp.id, 'referencia', e.target.value)}
                        placeholder="Dirección o referencia..."
                        className="input-compact w-full text-left"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step={0.01}
                        value={comp.util_m2 || ''}
                        onChange={e => updateComp(comp.id, 'util_m2', parseFloat(e.target.value) || 0)}
                        className="input-compact text-center w-20"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step={comp.moneda === 'UF' ? 0.01 : 1000}
                        value={comp.arriendo_publicado || ''}
                        onChange={e => updateComp(comp.id, 'arriendo_publicado', parseFloat(e.target.value) || 0)}
                        className="input-compact text-center w-28"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Select
                        value={comp.moneda}
                        onValueChange={v => updateComp(comp.id, 'moneda', v as MonedaArriendo)}
                      >
                        <SelectTrigger className="h-8 text-xs w-16 border-0 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLP" className="text-xs">CLP</SelectItem>
                          <SelectItem value="UF" className="text-xs">UF</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    {uf_value_clp && (
                      <td className="px-2 py-1 text-center font-mono text-xs bg-accent/5">
                        {arriendoCLP ? formatCLP(arriendoCLP) : '—'}
                      </td>
                    )}
                    <td className="px-1 py-1">
                      <button
                        onClick={() => removeComp(comp.id)}
                        disabled={analysis.comparables.length <= 3}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
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
      </div>

      {/* Valor propiedad + Vacancia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-navy">Valor de la Propiedad</h3>
          <Label className="text-xs text-muted-foreground">Valor estimado (UF)</Label>
          <Input
            type="number"
            step={0.01}
            value={analysis.valor_propiedad_uf || ''}
            onChange={e => onChange({ ...analysis, valor_propiedad_uf: parseFloat(e.target.value) || 0 })}
            placeholder="Ej: 3500"
            className="h-8 text-sm"
          />
          {uf_value_clp && analysis.valor_propiedad_uf > 0 && (
            <p className="text-xs text-primary font-medium">
              ≈ {formatCLP(analysis.valor_propiedad_uf * uf_value_clp)} CLP
            </p>
          )}
        </div>

        <div className="bg-card border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-navy">Parámetro de Vacancia</h3>
          <Label className="text-xs text-muted-foreground">Meses sin arriendo por año</Label>
          <Select
            value={analysis.vacancia_meses.toString()}
            onValueChange={v => onChange({ ...analysis, vacancia_meses: parseInt(v) as VacanciaMeses })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" className="text-sm">1 mes (11 meses arrendados)</SelectItem>
              <SelectItem value="2" className="text-sm">2 meses (10 meses arrendados)</SelectItem>
              <SelectItem value="3" className="text-sm">3 meses (9 meses arrendados)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview en tiempo real */}
      {arriendoResult && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="bg-primary/5 border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-navy">Vista Previa — Análisis de Rentabilidad</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Cards métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="result-highlight text-center">
                <p className="text-[10px] text-muted-foreground">Arriendo Promedio</p>
                <p className="font-semibold text-sm">{formatCLP(arriendoResult.arriendo_promedio_clp)}</p>
                {arriendoResult.arriendo_promedio_uf && (
                  <p className="text-[10px] text-muted-foreground">{formatUF(arriendoResult.arriendo_promedio_uf)} UF</p>
                )}
              </div>
              <div className="result-highlight text-center">
                <p className="text-[10px] text-muted-foreground">Valor Propiedad</p>
                <p className="font-semibold text-sm">{arriendoResult.valor_propiedad_clp ? formatCLP(arriendoResult.valor_propiedad_clp) : '—'}</p>
                {analysis.valor_propiedad_uf > 0 && (
                  <p className="text-[10px] text-muted-foreground">{formatUF(analysis.valor_propiedad_uf)} UF</p>
                )}
              </div>
              <div className="result-highlight text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-muted-foreground">Gastos Anuales (10%)</p>
                <p className="font-semibold text-sm">{formatCLP(arriendoResult.scenarios[0].gastos_anuales_clp)}</p>
              </div>
            </div>

            {/* Tabla vacancia */}
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left">Vacancia</th>
                    <th className="px-3 py-2 text-center">Arriendo Mensual</th>
                    <th className="px-3 py-2 text-center">Ingresos Anuales</th>
                    <th className="px-3 py-2 text-center">Gastos Anuales</th>
                    <th className="px-3 py-2 text-center">Ingreso Neto Anual</th>
                    <th className="px-3 py-2 text-center">Cap Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {arriendoResult.scenarios.map(sc => {
                    const isSelected = sc.meses === analysis.vacancia_meses;
                    return (
                      <tr key={sc.meses} className={`border-b ${isSelected ? 'bg-accent/10 font-semibold' : 'hover:bg-muted/20'}`}>
                        <td className="px-3 py-2">{sc.meses} mes{sc.meses > 1 ? 'es' : ''}</td>
                        <td className="px-3 py-2 text-center font-mono">{formatCLP(sc.arriendo_neto_mensual_clp)}</td>
                        <td className="px-3 py-2 text-center font-mono">{formatCLP(sc.ingresos_anuales_clp)}</td>
                        <td className="px-3 py-2 text-center font-mono">{formatCLP(sc.gastos_anuales_clp)}</td>
                        <td className="px-3 py-2 text-center font-mono">{formatCLP(sc.ingreso_neto_anual_clp)}</td>
                        <td className={`px-3 py-2 text-center font-mono ${isSelected ? 'text-primary font-bold' : ''}`}>
                          {sc.cap_rate > 0 ? formatPercent(sc.cap_rate) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft size={16} /> Volver a Resultados
        </Button>
        <Button onClick={onNext} className="gap-2">
          Generar Informe <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
