import jsPDF from 'jspdf';
import type { EvaluationOutput } from '@/types/evaluation';
import type { FormData } from '@/types/evaluation';
import type { PropertyEvalOutput, PropertyFormData } from '@/types/property-evaluation';
import { formatCLP, formatUF, clpToUf, formatPercent } from '@/lib/evaluation-engine';

function addHeader(doc: jsPDF, title: string, uf: { valor: number; fecha: string; fuente: string }) {
  doc.setFontSize(20);
  doc.setTextColor(20, 60, 80);
  doc.text('Viveprop', 20, 25);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 20, 35);
  doc.setFontSize(8);
  doc.text(`UF: $${uf.valor.toLocaleString('es-CL')} — Fuente: ${uf.fuente}`, 20, 42);
  doc.text(`Fecha: ${new Date(uf.fecha).toLocaleString('es-CL')}`, 20, 47);
  doc.setDrawColor(200);
  doc.line(20, 50, 190, 50);
  return 55;
}

function addSection(doc: jsPDF, y: number, title: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setTextColor(20, 60, 80);
  doc.text(title, 20, y);
  return y + 7;
}

function addRow(doc: jsPDF, y: number, label: string, value: string): number {
  if (y > 275) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(label, 25, y);
  doc.setTextColor(30);
  doc.text(value, 110, y);
  return y + 6;
}

function money(clp: number, ufVal: number): string {
  return `${formatCLP(clp)}  ·  ${formatUF(clpToUf(clp, ufVal))}`;
}

export function generateEvaluationPDF(result: EvaluationOutput, data: FormData) {
  const doc = new jsPDF();
  const uf = result.ufUsada;
  let y = addHeader(doc, 'Informe de Evaluación Financiera', uf);

  // Status
  const statusLabels = { apto: 'APTO', apto_con_condiciones: 'APTO CON CONDICIONES', no_apto: 'NO APTO' };
  y = addSection(doc, y, 'Resultado');
  doc.setFontSize(14);
  doc.setTextColor(result.resultado === 'apto' ? 40 : result.resultado === 'no_apto' ? 180 : 200, result.resultado === 'apto' ? 140 : result.resultado === 'no_apto' ? 40 : 140, result.resultado === 'apto' ? 60 : 40);
  doc.text(statusLabels[result.resultado], 25, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Solicitante: ${data.nombre || 'N/A'}`, 25, y); y += 8;

  // Razones
  y = addSection(doc, y, 'Detalle');
  result.razones.forEach(r => { y = addRow(doc, y, '•', r); });
  y += 4;

  // Indicadores
  y = addSection(doc, y, 'Indicadores financieros');
  y = addRow(doc, y, 'Ingreso evaluable:', money(result.ingresoEvaluable, uf.valor));
  y = addRow(doc, y, 'Carga sin hipotecario:', money(result.cargaSinHipotecario, uf.valor));
  y = addRow(doc, y, 'RCI sin hipotecario:', formatPercent(result.rciSinHipotecario));
  y = addRow(doc, y, 'Dividendo máximo:', money(result.dividendoMaximo, uf.valor));
  y = addRow(doc, y, 'Dividendo/Renta:', formatPercent(result.dividendoRentaRatio));
  y = addRow(doc, y, 'Carga total/Renta:', formatPercent(result.cargaTotalRentaRatio));
  y += 4;

  // Property max solo
  y = addSection(doc, y, 'Valor máximo de propiedad — Solo');
  y = addRow(doc, y, 'Crédito máximo:', money(result.creditoMaximo, uf.valor));
  y = addRow(doc, y, 'Máx. por PIE:', money(result.propiedadMaxPorPie, uf.valor));
  y = addRow(doc, y, 'Máx. por LTV:', money(result.propiedadMaxPorLtv, uf.valor));
  y = addRow(doc, y, 'VALOR MÁXIMO:', money(result.propiedadMaxFinal, uf.valor));
  y += 4;

  // Combinado
  if (data.tieneComplementario && result.ingresoEvaluableCombinado != null) {
    y = addSection(doc, y, `Valor máximo — Con ${data.comp_nombre || 'co-solicitante'}`);
    y = addRow(doc, y, 'Ingreso combinado:', money(result.ingresoEvaluableCombinado, uf.valor));
    y = addRow(doc, y, 'Crédito máximo:', money(result.creditoMaximoCombinado!, uf.valor));
    y = addRow(doc, y, 'VALOR MÁXIMO:', money(result.propiedadMaxFinalCombinada!, uf.valor));
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Viveprop — Herramienta referencial. No constituye una oferta de crédito.', 20, 285);

  doc.save(`evaluacion-${data.nombre || 'informe'}.pdf`);
}

export function generatePropertyPDF(result: PropertyEvalOutput, data: PropertyFormData) {
  const doc = new jsPDF();
  const uf = result.ufUsada;
  let y = addHeader(doc, 'Informe de Evaluación por Propiedad Específica', uf);

  // Property info
  y = addSection(doc, y, 'Datos de la propiedad');
  y = addRow(doc, y, 'Ubicación:', data.ubicacion || 'N/A');
  y = addRow(doc, y, 'Tipología:', data.tipologia || 'N/A');
  y = addRow(doc, y, 'Valor lista (UF):', formatUF(data.valorPropiedadUF));
  y = addRow(doc, y, 'Valor lista (CLP):', formatCLP(data.valorPropiedadUF * uf.valor));
  y += 4;

  // Adjustments
  y = addSection(doc, y, 'Ajustes al precio');
  y = addRow(doc, y, 'Bono Pie:', `${data.bonoPiePct}%  →  ${formatUF(result.bonoPieUF)}  ·  ${formatCLP(result.bonoPieUF * uf.valor)}`);
  y = addRow(doc, y, 'Descuento:', `${data.descuentoPct}%  →  ${formatUF(result.descuentoUF)}  ·  ${formatCLP(result.descuentoUF * uf.valor)}`);
  y = addRow(doc, y, 'Pie aportado:', `${formatUF(result.pieAportadoUF)}  ·  ${formatCLP(result.pieAportadoUF * uf.valor)}`);
  y = addRow(doc, y, 'FINANCIAMIENTO:', `${formatUF(result.financiamientoUF)}  ·  ${formatCLP(result.financiamientoUF * uf.valor)}`);
  y += 4;

  // Status
  const statusLabels = { apto: 'APTO', apto_con_condiciones: 'APTO CON CONDICIONES', no_apto: 'NO APTO' };
  y = addSection(doc, y, 'Resultado Evaluación');
  doc.setFontSize(14);
  doc.setTextColor(result.resultado === 'apto' ? 40 : result.resultado === 'no_apto' ? 180 : 200, result.resultado === 'apto' ? 140 : result.resultado === 'no_apto' ? 40 : 140, result.resultado === 'apto' ? 60 : 40);
  doc.text(statusLabels[result.resultado], 25, y); y += 8;

  // Razones
  doc.setFontSize(9);
  result.razones.forEach(r => { y = addRow(doc, y, '•', r); });
  y += 4;

  // Financial
  y = addSection(doc, y, 'Indicadores financieros — Solo');
  y = addRow(doc, y, 'Ingreso evaluable:', money(result.ingresoEvaluable, uf.valor));
  y = addRow(doc, y, 'Carga sin hipotecario:', money(result.cargaSinHipotecario, uf.valor));
  y = addRow(doc, y, 'Dividendo estimado:', money(result.dividendoEstimado, uf.valor));
  y = addRow(doc, y, 'RCI con hipotecario:', formatPercent(result.rciConHipotecario));
  y += 4;

  if (data.tieneComplementario && result.dividendoEstimadoCombinado != null) {
    y = addSection(doc, y, `Indicadores — Con ${data.comp_nombre || 'codeudor'}`);
    y = addRow(doc, y, 'Ingreso combinado:', money(result.ingresoEvaluableCombinado!, uf.valor));
    y = addRow(doc, y, 'Dividendo estimado:', money(result.dividendoEstimadoCombinado, uf.valor));
    y = addRow(doc, y, 'RCI con hipotecario:', formatPercent(result.rciConHipotecarioCombinado!));
  }

  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Viveprop — Herramienta referencial. No constituye una oferta de crédito.', 20, 285);

  doc.save(`evaluacion-propiedad-${data.nombre || 'informe'}.pdf`);
}
