import type { PropertyEvalOutput, PropertyFormData } from '@/types/property-evaluation';
import { formatCLP, formatUF, formatPercent } from '@/lib/perfilamiento/evaluation-engine';
import { CheckCircle2, AlertTriangle, XCircle, Info, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generatePropertyPDF } from '@/lib/perfilamiento/pdf-generator';

interface Props {
  result: PropertyEvalOutput;
  data: PropertyFormData;
}

const statusConfig = {
  apto: { label: 'Apto', icon: CheckCircle2, bg: 'bg-success/10', border: 'border-success/30', text: 'text-success' },
  apto_con_condiciones: { label: 'Apto con condiciones', icon: AlertTriangle, bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning' },
  no_apto: { label: 'No apto', icon: XCircle, bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' },
};

const PropertyResultsPanel = ({ result, data }: Props) => {
  const st = statusConfig[result.resultado];
  const Icon = st.icon;
  const ufVal = result.ufUsada.valor;

  const dual = (uf: number) => `${formatUF(uf)}  ·  ${formatCLP(uf * ufVal)}`;
  const moneyCLP = (clp: number) => `${formatCLP(clp)}  ·  ${formatUF(clp / ufVal)}`;

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card className={`${st.bg} ${st.border} border-2 p-6 text-center`}>
        <Icon className={`h-12 w-12 mx-auto mb-3 ${st.text}`} />
        <h2 className={`font-serif text-3xl ${st.text}`}>{st.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.ubicacion || 'Propiedad'} — {data.nombre || 'Solicitante'}
        </p>
      </Card>

      {/* Property breakdown */}
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-4 text-foreground">Desglose de la propiedad</h3>
        <div className="space-y-2">
          <Row label="Valor lista" value={dual(result.valorPropiedadUF)} />
          <Row label={`Bono Pie (${data.bonoPiePct}%)`} value={`- ${dual(result.bonoPieUF)}`} />
          <Row label={`Descuento (${data.descuentoPct}%)`} value={`- ${dual(result.descuentoUF)}`} />
          <Row label="Pie aportado" value={`- ${dual(result.pieAportadoUF)}`} />
          <div className="border-t pt-2 mt-2">
            <Row label="Financiamiento hipotecario" value={dual(result.financiamientoUF)} bold />
          </div>
        </div>
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

      {/* Financial - Solo */}
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-4 text-foreground">Indicadores financieros — Solo</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Metric label="Ingreso evaluable" value={moneyCLP(result.ingresoEvaluable)} />
          <Metric label="Carga sin hipotecario" value={moneyCLP(result.cargaSinHipotecario)} />
          <Metric label="Dividendo estimado" value={moneyCLP(result.dividendoEstimado)} />
          <Metric label="RCI sin hipotecario" value={formatPercent(result.rciSinHipotecario)} />
          <Metric label="RCI con hipotecario" value={formatPercent(result.rciConHipotecario)} highlight />
        </div>
      </Card>

      {/* Financial - Combinado */}
      {data.tieneComplementario && result.ingresoEvaluableCombinado != null && (
        <Card className="p-6 border-accent/30">
          <h3 className="font-serif text-xl mb-4 text-foreground">
            Indicadores — Con {data.comp_nombre || 'codeudor'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Metric label="Ingreso combinado" value={moneyCLP(result.ingresoEvaluableCombinado)} />
            <Metric label="Carga combinada" value={moneyCLP(result.cargaSinHipotecarioCombinada!)} />
            <Metric label="Dividendo estimado" value={moneyCLP(result.dividendoEstimadoCombinado!)} />
            <Metric label="RCI con hipotecario" value={formatPercent(result.rciConHipotecarioCombinado!)} highlight />
          </div>
        </Card>
      )}

      {/* PDF + UF */}
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => generatePropertyPDF(result, data)}>
          <Download className="h-4 w-4 mr-2" />
          Descargar informe PDF
        </Button>
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg w-full">
          UF utilizada: ${ufVal.toLocaleString('es-CL')} CLP/UF — Fuente: {result.ufUsada.fuente}
          <br />Fecha: {new Date(result.ufUsada.fecha).toLocaleString('es-CL')}
        </div>
      </div>
    </div>
  );
};

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={`text-muted-foreground ${bold ? 'font-semibold text-foreground' : ''}`}>{label}</span>
      <span className={`text-foreground ${bold ? 'font-bold' : ''}`}>{value}</span>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground break-all">{value}</p>
    </div>
  );
}

export default PropertyResultsPanel;
