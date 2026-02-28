import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatUF, formatCLP } from '@/lib/engines';
import type { ValuationResult, MarketParams, CasaValuationResult, DeptoValuationResult } from '@/lib/types';

interface ResultsStepProps {
  result: ValuationResult;
  params: MarketParams;
  onBack: () => void;
  onNext: () => void;
}

function CasaResults({ result }: { result: CasaValuationResult }) {
  const { REP, STDEV, MEDIA } = result;

  const rows = [
    { label: 'Terreno (UF)', rep_max: REP.MAX.terreno_uf, rep_min: REP.MIN.terreno_uf, stdev_max: STDEV.MAX.terreno_uf, stdev_min: STDEV.MIN.terreno_uf, media_max: MEDIA.MAX.terreno_uf, media_min: MEDIA.MIN.terreno_uf },
    { label: 'Construcción (UF)', rep_max: REP.MAX.construc_uf, rep_min: REP.MIN.construc_uf, stdev_max: STDEV.MAX.construc_uf, stdev_min: STDEV.MIN.construc_uf, media_max: MEDIA.MAX.construc_uf, media_min: MEDIA.MIN.construc_uf },
    { label: 'Adicionales (UF)', rep_max: REP.MAX.adic1_uf + REP.MAX.adic2_uf, rep_min: REP.MIN.adic1_uf + REP.MIN.adic2_uf, stdev_max: STDEV.MAX.adic1_uf + STDEV.MAX.adic2_uf, stdev_min: STDEV.MIN.adic1_uf + STDEV.MIN.adic2_uf, media_max: MEDIA.MAX.adic1_uf + MEDIA.MAX.adic2_uf, media_min: MEDIA.MIN.adic1_uf + MEDIA.MIN.adic2_uf },
  ];

  return (
    <div className="space-y-6">
      {/* Summary box */}
      <div className="border-2 border-accent bg-accent/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="font-bold text-navy">Valor Sugerido — Método MEDIA</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
            <p className="text-xl font-bold text-navy">{formatUF(MEDIA.MIN.total_uf)} UF</p>
            {MEDIA.MIN.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(MEDIA.MIN.total_clp)}</p>}
          </div>
          <div className="border-x border-accent/30">
            <p className="text-xs text-muted-foreground mb-1">⭐ Promedio</p>
            <p className="text-2xl font-bold text-accent">{formatUF(MEDIA.PROM.total_uf)} UF</p>
            {MEDIA.PROM.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(MEDIA.PROM.total_clp)}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Máximo</p>
            <p className="text-xl font-bold text-navy">{formatUF(MEDIA.MAX.total_uf)} UF</p>
            {MEDIA.MAX.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(MEDIA.MAX.total_clp)}</p>}
          </div>
        </div>
      </div>

      {/* Tabla detalle */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left bg-navy text-white">Componente</th>
              <th className="px-3 py-2 bg-primary/80 text-white text-center">REP MAX</th>
              <th className="px-3 py-2 bg-primary/60 text-white text-center">REP MIN</th>
              <th className="px-3 py-2 bg-secondary text-navy text-center">STDEV MAX</th>
              <th className="px-3 py-2 bg-secondary/70 text-navy text-center">STDEV MIN</th>
              <th className="px-3 py-2 bg-accent/30 text-navy font-bold text-center">⭐ MEDIA MAX</th>
              <th className="px-3 py-2 bg-accent/20 text-navy font-bold text-center">⭐ MEDIA MIN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-b hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{r.label}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.rep_max)}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.rep_min)}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.stdev_max)}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.stdev_min)}</td>
                <td className="px-3 py-2 text-center font-mono bg-accent/5 font-semibold">{formatUF(r.media_max)}</td>
                <td className="px-3 py-2 text-center font-mono bg-accent/5 font-semibold">{formatUF(r.media_min)}</td>
              </tr>
            ))}
            <tr className="border-b font-bold bg-muted/30">
              <td className="px-3 py-2">TOTAL UF</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(REP.MAX.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(REP.MIN.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(STDEV.MAX.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(STDEV.MIN.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono bg-accent/5 text-accent">{formatUF(MEDIA.MAX.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono bg-accent/5 text-accent">{formatUF(MEDIA.MIN.total_uf)}</td>
            </tr>
            {(REP.MAX.total_clp || STDEV.MAX.total_clp || MEDIA.MAX.total_clp) && (
              <tr className="text-muted-foreground text-[10px]">
                <td className="px-3 py-1">TOTAL CLP</td>
                <td className="px-3 py-1 text-center">{formatCLP(REP.MAX.total_clp)}</td>
                <td className="px-3 py-1 text-center">{formatCLP(REP.MIN.total_clp)}</td>
                <td className="px-3 py-1 text-center">{formatCLP(STDEV.MAX.total_clp)}</td>
                <td className="px-3 py-1 text-center">{formatCLP(STDEV.MIN.total_clp)}</td>
                <td className="px-3 py-1 text-center bg-accent/5">{formatCLP(MEDIA.MAX.total_clp)}</td>
                <td className="px-3 py-1 text-center bg-accent/5">{formatCLP(MEDIA.MIN.total_clp)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Valor Tierra REP (UF/m²)</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatUF(REP.vt_MAX)} / {formatUF(REP.vt_MIN)}</p>
          <p className="text-[10px] text-muted-foreground">MAX / MIN</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Intervalo STDEV (UF/m²)</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatUF(STDEV.intervalo_MAX)} / {formatUF(STDEV.intervalo_MIN)}</p>
          <p className="text-[10px] text-muted-foreground">MAX / MIN</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Mediana ± Desv.</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatUF(STDEV.mediana)} ± {formatUF(STDEV.desv)}</p>
          <p className="text-[10px] text-muted-foreground">UF/m²</p>
        </div>
      </div>
    </div>
  );
}

function DeptoResults({ result }: { result: DeptoValuationResult }) {
  const { COMP } = result;

  const rows = [
    { label: 'Sup. Útil (UF)', max: COMP.MAX.util_uf, min: COMP.MIN.util_uf, prom: COMP.PROM.util_uf },
    { label: 'Sup. Terraza (UF)', max: COMP.MAX.terraza_uf, min: COMP.MIN.terraza_uf, prom: COMP.PROM.terraza_uf },
    { label: 'Estacionamientos (UF)', max: COMP.MAX.est_uf, min: COMP.MIN.est_uf, prom: COMP.PROM.est_uf },
    { label: 'Bodegas (UF)', max: COMP.MAX.bod_uf, min: COMP.MIN.bod_uf, prom: COMP.PROM.bod_uf },
  ];

  return (
    <div className="space-y-6">
      <div className="border-2 border-accent bg-accent/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="font-bold text-navy">Valor Sugerido — Competencia Directa</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
            <p className="text-xl font-bold text-navy">{formatUF(COMP.MIN.total_uf)} UF</p>
            {COMP.MIN.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(COMP.MIN.total_clp)}</p>}
          </div>
          <div className="border-x border-accent/30">
            <p className="text-xs text-muted-foreground mb-1">⭐ Promedio</p>
            <p className="text-2xl font-bold text-accent">{formatUF(COMP.PROM.total_uf)} UF</p>
            {COMP.PROM.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(COMP.PROM.total_clp)}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Máximo</p>
            <p className="text-xl font-bold text-navy">{formatUF(COMP.MAX.total_uf)} UF</p>
            {COMP.MAX.total_clp && <p className="text-xs text-muted-foreground mt-0.5">{formatCLP(COMP.MAX.total_clp)}</p>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left bg-navy text-white">Componente</th>
              <th className="px-3 py-2 bg-primary/80 text-white text-center">MAX</th>
              <th className="px-3 py-2 bg-primary/60 text-white text-center">MIN</th>
              <th className="px-3 py-2 bg-accent/30 text-navy font-bold text-center">⭐ PROMEDIO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-b hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{r.label}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.max)}</td>
                <td className="px-3 py-2 text-center font-mono">{formatUF(r.min)}</td>
                <td className="px-3 py-2 text-center font-mono bg-accent/5 font-semibold">{formatUF(r.prom)}</td>
              </tr>
            ))}
            <tr className="border-b font-bold bg-muted/30">
              <td className="px-3 py-2">TOTAL UF</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(COMP.MAX.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono">{formatUF(COMP.MIN.total_uf)}</td>
              <td className="px-3 py-2 text-center font-mono bg-accent/5 text-accent">{formatUF(COMP.PROM.total_uf)}</td>
            </tr>
            {COMP.MAX.total_clp && (
              <tr className="text-muted-foreground text-[10px]">
                <td className="px-3 py-1">TOTAL CLP</td>
                <td className="px-3 py-1 text-center">{formatCLP(COMP.MAX.total_clp)}</td>
                <td className="px-3 py-1 text-center">{formatCLP(COMP.MIN.total_clp)}</td>
                <td className="px-3 py-1 text-center bg-accent/5">{formatCLP(COMP.PROM.total_clp)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">CD Últimos 3 (UF/m²)</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatUF(COMP.cd_uf_m2)}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Promedio General (UF/m²)</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatUF(COMP.uf_m2_promedio)}</p>
        </div>
      </div>
    </div>
  );
}

export function ResultsStep({ result, onBack, onNext }: ResultsStepProps) {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Resultados de Tasación</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {result.property_type === 'CASA'
            ? 'Métodos REP + Estadístico + Media ponderada.'
            : 'Método de Competencia Directa (CD).'}
        </p>
      </div>

      {result.property_type === 'CASA'
        ? <CasaResults result={result} />
        : <DeptoResults result={result} />
      }

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft size={16} /> Volver a Comparables
        </Button>
        <Button onClick={onNext} className="gap-2">
          Siguiente: Arriendos <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
