import type { EvaluationOutput } from '@/types/evaluation';
import type { FormData } from '@/types/evaluation';
import { formatCLP, formatUF, clpToUf, formatPercent } from '@/lib/evaluation-engine';
import { CheckCircle2, AlertTriangle, XCircle, Info, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateEvaluationPDF } from '@/lib/pdf-generator';

interface Props {
  result: EvaluationOutput;
  data: FormData;
}

const statusConfig = {
  apto: { label: 'Apto', icon: CheckCircle2, bg: 'bg-success/10', border: 'border-success/30', text: 'text-success' },
  apto_con_condiciones: { label: 'Apto con condiciones', icon: AlertTriangle, bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning' },
  no_apto: { label: 'No apto', icon: XCircle, bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' },
};

const ResultsPanel = ({ result, data }: Props) => {
  const st = statusConfig[result.resultado];
  const Icon = st.icon;
  const uf = result.ufUsada.valor;
  const showCLP = data.moneda === 'CLP' || data.moneda === 'ambas';
  const showUF = data.moneda === 'UF' || data.moneda === 'ambas';

  const money = (clp: number) => {
    const parts: string[] = [];
    if (showCLP) parts.push(formatCLP(clp));
    if (showUF) parts.push(formatUF(clpToUf(clp, uf)));
    return parts.join(' · ');
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`${st.bg} ${st.border} border-2 p-6 text-center`}>
        <Icon className={`h-12 w-12 mx-auto mb-3 ${st.text}`} />
        <h2 className={`font-serif text-3xl ${st.text}`}>{st.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Evaluación para {data.nombre || 'Solicitante'}
        </p>
      </Card>

      {/* Razones */}
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-3 text-foreground">Detalle de evaluación</h3>
        <ul className="space-y-2">
          {result.razones.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-foreground">{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Ratios */}
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-4 text-foreground">Indicadores financieros</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Metric label="Ingreso evaluable" value={money(result.ingresoEvaluable)} />
          <Metric label="Carga sin hipotecario" value={money(result.cargaSinHipotecario)} />
          <Metric label="Carga/Renta (sin hipotecario)" value={formatPercent(result.rciSinHipotecario)} sub={`Máx carga total: ${formatPercent(result.params.cargaTotalRentaMaximo)}`} />
          <Metric label="Dividendo máximo" value={money(result.dividendoMaximo)} />
          <Metric label="Dividendo/Renta" value={formatPercent(result.dividendoRentaRatio)} sub={`Óptimo ≤${formatPercent(result.params.dividendoRentaMaximo)} · Rechazo >${formatPercent(result.params.dividendoRentaMaximo + result.params.dividendoRentaTolerancia)}`} />
          <Metric label="Carga total/Renta" value={formatPercent(result.cargaTotalRentaRatio)} sub={`Óptimo ≤${formatPercent(result.params.cargaTotalRentaMaximo)} · Rechazo >${formatPercent(result.params.cargaTotalRentaMaximo + result.params.cargaTotalRentaTolerancia)}`} />
          <Metric label="Tasa / Plazo" value={`${(result.params.tasaAnual * 100).toFixed(2)}% / ${result.params.plazoMeses / 12} años`} />
        </div>
      </Card>

      {/* Property Max - Solo */}
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-4 text-foreground">
          Valor máximo de propiedad — Solo
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Metric label="Crédito máximo" value={money(result.creditoMaximo)} />
          <Metric label="Máx. por PIE" value={money(result.propiedadMaxPorPie)} sub={`PIE mín: ${formatPercent(result.params.pieMinimoPorcentaje)}`} />
          <Metric label="Máx. por LTV" value={money(result.propiedadMaxPorLtv)} sub={`LTV máx: ${formatPercent(result.params.ltvMaximo)}`} />
        </div>
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor máximo de propiedad</p>
          <p className="font-serif text-2xl text-primary">{money(result.propiedadMaxFinal)}</p>
        </div>
      </Card>

      {/* Property Max - Combinado */}
      {data.tieneComplementario && result.ingresoEvaluableCombinado != null && (
        <Card className="p-6 border-accent/30">
          <h3 className="font-serif text-xl mb-4 text-foreground">
            Valor máximo — Con {data.comp_nombre || 'co-solicitante'}
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Metric label="Ingreso combinado" value={money(result.ingresoEvaluableCombinado)} />
            <Metric label="Crédito máximo" value={money(result.creditoMaximoCombinado!)} />
            <Metric label="Dividendo máximo" value={money(result.dividendoMaximoCombinado!)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <Metric label="Máx. por PIE" value={money(result.propiedadMaxPorPieCombinada!)} />
            <Metric label="Máx. por LTV" value={money(result.propiedadMaxPorLtvCombinada!)} />
          </div>
          <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor máximo combinado</p>
            <p className="font-serif text-2xl text-accent">{money(result.propiedadMaxFinalCombinada!)}</p>
          </div>
        </Card>
      )}

      {/* PDF + UF */}
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => generateEvaluationPDF(result, data)}>
          <Download className="h-4 w-4 mr-2" />
          Descargar informe PDF
        </Button>
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg w-full">
          UF utilizada: {formatUF(uf).replace(' UF', '')} CLP/UF — Fuente: {result.ufUsada.fuente}
          <br />Fecha: {new Date(result.ufUsada.fecha).toLocaleString('es-CL')}
        </div>
      </div>
    </div>
  );
};

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground break-all">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default ResultsPanel;
