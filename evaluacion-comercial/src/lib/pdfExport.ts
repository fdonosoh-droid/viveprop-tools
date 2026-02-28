import jsPDF from 'jspdf';
import { formatUF, formatCLP, formatPercent, calcArriendoResult } from './engines';
import { STATE_LABELS, MATERIAL_LABELS } from './types';
import type { ValuationResult, MarketParams, Subject, ArriendoAnalysis, ArriendoResult, CasaValuationResult, DeptoValuationResult, SubjectCasa } from './types';

interface PDFParams {
  result: ValuationResult;
  params: MarketParams;
  subject: Partial<Subject>;
  arriendoAnalysis: ArriendoAnalysis;
  arriendoResult: ArriendoResult | null;
}

export function generatePDF({ result, params, subject, arriendoAnalysis, arriendoResult }: PDFParams) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const marginL = 18;
  const pageW = 216;
  const contentW = pageW - marginL * 2;
  let y = 0;
  let pageNum = 1;
  const today = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const checkPage = (need: number) => {
    if (y + need > 255) {
      doc.addPage();
      pageNum++;
      y = 20;
      addFooter();
    }
  };

  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Informe generado el ${today} — Sistema de Valorización Inmobiliaria Viveprop — Página ${pageNum}`, marginL, 268);
    doc.setTextColor(0, 0, 0);
  };

  const sectionTitle = (text: string) => {
    checkPage(10);
    doc.setFillColor(30, 41, 59);
    doc.rect(marginL, y, contentW, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(text, marginL + 2, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 9;
  };

  const addRow = (label: string, value: string, labelW = 55) => {
    checkPage(6);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', marginL, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginL + labelW, y);
    y += 5;
  };

  const drawTable = (headers: string[], rows: string[][], colWidths?: number[]) => {
    const cols = headers.length;
    const defaultW = contentW / cols;
    const widths = colWidths || Array(cols).fill(defaultW);

    checkPage(8);
    // Header row
    doc.setFillColor(30, 41, 59);
    let cx = marginL;
    headers.forEach((h, i) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(cx, y, widths[i], 6, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(h, cx + 1, y + 4.2);
      cx += widths[i];
    });
    doc.setTextColor(0, 0, 0);
    y += 6;

    rows.forEach((row, ri) => {
      checkPage(6);
      cx = marginL;
      if (ri % 2 === 1) {
        doc.setFillColor(241, 245, 249);
        doc.rect(marginL, y, contentW, 5.5, 'F');
      }
      row.forEach((cell, ci) => {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(String(cell), cx + 1, y + 4);
        cx += widths[ci];
      });
      y += 5.5;
    });
    y += 2;
  };

  // ── HEADER ──────────────────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INFORME CASO DE NEGOCIO', marginL, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.property_type === 'CASA' ? 'Casa' : 'Departamento'} — Viveprop Evaluaciones Comerciales`, marginL, 24);
  doc.setFontSize(8);
  doc.text(`Fecha: ${today}`, marginL, 32);
  if (params.uf_value_clp) {
    doc.text(`UF del día: ${formatCLP(params.uf_value_clp)}`, marginL + 80, 32);
  }
  doc.setTextColor(0, 0, 0);
  y = 48;

  addRow('Propietario', subject.client_name || '—');
  addRow('Dirección', subject.address || '—');
  addRow('Comuna', subject.commune || '—');
  addRow('Rol SII', subject.sii_role || '—');
  y += 3;

  // ── I. ANÁLISIS ──────────────────────────────────────────────────────────
  sectionTitle('I. Análisis de la Propiedad');
  addRow('Tipo de Propiedad', result.property_type === 'CASA' ? 'Casa' : 'Departamento');
  if (subject.usable_area_m2) addRow('m² Útiles', `${subject.usable_area_m2} m²`);
  if (subject.terrace_area_m2) addRow('m² Terraza', `${subject.terrace_area_m2} m²`);
  const casa = result.property_type === 'CASA' ? (subject as Partial<SubjectCasa>) : null;
  if (casa?.land_area_m2) addRow('m² Terreno', `${casa.land_area_m2} m²`);
  if (subject.bedrooms) addRow('Dormitorios', `${subject.bedrooms}`);
  if (subject.bathrooms) addRow('Baños', `${subject.bathrooms}`);
  if (subject.parking_spaces) addRow('Estacionamientos', `${subject.parking_spaces}`);
  if (subject.storage_units) addRow('Bodegas', `${subject.storage_units}`);
  if (casa?.construction_year) addRow('Año Construcción', `${casa.construction_year}`);
  if (casa?.state) addRow('Estado Conservación', STATE_LABELS[casa.state]);
  if (casa?.material) addRow('Material', MATERIAL_LABELS[casa.material]);

  if (subject.observaciones_legales) {
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones Legales:', marginL, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(subject.observaciones_legales, contentW);
    lines.forEach((line: string) => { checkPage(5); doc.text(line, marginL, y); y += 4.5; });
    y += 2;
  }

  // ── II. FACTIBILIDAD ─────────────────────────────────────────────────────
  sectionTitle('II. Análisis de Factibilidad Comercial');
  const getRange = () => {
    if (result.property_type === 'CASA') {
      const r = result as CasaValuationResult;
      return { min: r.MEDIA.MIN.total_uf, max: r.MEDIA.MAX.total_uf, prom: r.MEDIA.PROM.total_uf };
    }
    const r = result as DeptoValuationResult;
    return { min: r.COMP.MIN.total_uf, max: r.COMP.MAX.total_uf, prom: r.COMP.PROM.total_uf };
  };
  const range = getRange();
  if (subject.seller_expectation_uf) addRow('Expectativa Vendedor', `${formatUF(subject.seller_expectation_uf)} UF`);
  addRow('Valor Tasación (Promedio)', `${formatUF(range.prom)} UF`);
  if (subject.fiscal_appraisal_uf) addRow('Avalúo Fiscal', `${formatUF(subject.fiscal_appraisal_uf)} UF`);

  if (subject.factores_diferenciadores) {
    checkPage(10);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('Factores Diferenciadores:', marginL, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(subject.factores_diferenciadores, contentW);
    lines.forEach((line: string) => { checkPage(5); doc.text(line, marginL, y); y += 4.5; });
    y += 2;
  }

  // ── ARRIENDOS ────────────────────────────────────────────────────────────
  if (arriendoResult) {
    sectionTitle('Evaluación de Arriendos Comparativos');
    const hdrs = params.uf_value_clp
      ? ['#', 'Referencia', 'm²', 'Pub.', 'Mon.', 'CLP']
      : ['#', 'Referencia', 'm²', 'Pub.', 'Mon.'];
    const arrRows = arriendoResult.comparables.map((c, i) => {
      const base = [`${i+1}`, c.referencia || '—', `${c.util_m2}`, `${c.arriendo_publicado.toLocaleString('es-CL')}`, c.moneda];
      if (params.uf_value_clp) base.push(c.arriendo_clp ? formatCLP(c.arriendo_clp) : '—');
      return base;
    });
    const cw = params.uf_value_clp ? [8, 55, 18, 32, 14, 33] : [8, 65, 20, 40, 20];
    drawTable(hdrs, arrRows, cw);
    addRow('Arriendo promedio', `${formatCLP(arriendoResult.arriendo_promedio_clp)}${arriendoResult.arriendo_promedio_uf ? ` (${formatUF(arriendoResult.arriendo_promedio_uf)} UF)` : ''}`);
    y += 2;
  }

  // ── III. ESTRATEGIA ───────────────────────────────────────────────────────
  sectionTitle('III. Estrategia de Precio y Tiempo');
  const priceRows: string[][] = [['UF', formatUF(range.min), formatUF(range.prom), formatUF(range.max)]];
  if (params.uf_value_clp) {
    priceRows.push(['CLP', formatCLP(range.min * params.uf_value_clp), formatCLP(range.prom * params.uf_value_clp), formatCLP(range.max * params.uf_value_clp)]);
  }
  drawTable(['Precio', 'Mínimo', '★ Promedio', 'Máximo'], priceRows, [30, 50, 55, 45]);

  // ── VACANCIA ─────────────────────────────────────────────────────────────
  if (arriendoResult) {
    sectionTitle('Impacto de la Vacancia en Ingreso Anual');
    const vacRows = arriendoResult.scenarios.map(sc => [
      `${sc.meses} mes${sc.meses > 1 ? 'es' : ''}`,
      formatCLP(sc.arriendo_neto_mensual_clp),
      formatCLP(sc.ingresos_anuales_clp),
      formatCLP(sc.gastos_anuales_clp),
      formatCLP(sc.ingreso_neto_anual_clp),
      sc.cap_rate > 0 ? formatPercent(sc.cap_rate) : '—',
    ]);
    drawTable(['Vacancia', 'Arr.Mensual', 'Ing.Anual', 'Gastos', 'Neto Anual', '★Cap Rate'], vacRows, [22, 35, 35, 30, 35, 23]);
  }

  // ── IV. CONCLUSIONES ──────────────────────────────────────────────────────
  sectionTitle('IV. Conclusiones y Pasos a Seguir');
  let conclusion = `La propiedad ubicada en ${subject.address || 'la dirección indicada'}, ${subject.commune ? `Comuna de ${subject.commune}, ` : ''}presenta un valor de tasación estimado de ${formatUF(range.prom)} UF (promedio), con un rango entre ${formatUF(range.min)} UF y ${formatUF(range.max)} UF.`;
  if (params.uf_value_clp) conclusion += ` Equivale aproximadamente a ${formatCLP(range.prom * params.uf_value_clp)} CLP.`;
  if (arriendoResult) {
    const sc = arriendoResult.scenarios.find(s => s.meses === arriendoAnalysis.vacancia_meses);
    conclusion += ` En términos de rentabilidad, con un arriendo estimado de ${formatCLP(arriendoResult.arriendo_promedio_clp)} mensuales y una vacancia de ${arriendoAnalysis.vacancia_meses} mes(es), el cap rate estimado es de ${sc ? formatPercent(sc.cap_rate) : '—'}.`;
  }
  const conclusionLines = doc.splitTextToSize(conclusion, contentW);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  conclusionLines.forEach((line: string) => { checkPage(6); doc.text(line, marginL, y); y += 5; });

  addFooter();

  // Filename
  const addr = (subject.address || 'Propiedad').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const dateStr = new Date().toISOString().split('T')[0];
  const tipo = result.property_type === 'CASA' ? 'Casa' : 'Depto';
  doc.save(`Informe_${tipo}_${addr}_${dateStr}.pdf`);
}
