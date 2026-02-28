import jsPDF from 'jspdf'
import { formatUF, formatCLP, formatPercent, calcArriendoResult } from './engines'
import { STATE_LABELS, MATERIAL_LABELS } from './types'
import type { ValuationResult, MarketParams, Subject, ArriendoAnalysis, ArriendoResult, CasaValuationResult, DeptoValuationResult, SubjectCasa } from './types'
import {
  drawHeader, drawFooter, drawSectionTitle, drawRow, drawTable, drawMeta,
  MARGIN_L, CONTENT_W
} from '@/lib/pdf-brand'

interface PDFParams {
  result: ValuationResult
  params: MarketParams
  subject: Partial<Subject>
  arriendoAnalysis: ArriendoAnalysis
  arriendoResult: ArriendoResult | null
}

export function generatePDF({ result, params, subject, arriendoAnalysis, arriendoResult }: PDFParams) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let pageNum = 1
  const today = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const disclaimer = 'Herramienta referencial. No constituye una tasación oficial.'

  const checkPage = (need: number) => {
    if (y + need > 270) {
      drawFooter(doc, pageNum, disclaimer)
      doc.addPage()
      pageNum++
      y = 20
    }
  }

  const tipo = result.property_type === 'CASA' ? 'Casa' : 'Departamento'

  // ── HEADER
  let y = drawHeader(doc, 'INFORME CASO DE NEGOCIO', `Evaluación Comercial — ${tipo}`)

  // Meta
  const metaItems = [`Fecha: ${today}`]
  if (params.uf_value_clp) metaItems.push(`UF: ${formatCLP(params.uf_value_clp)}`)
  y = drawMeta(doc, y, metaItems)

  // Owner info
  y = drawSectionTitle(doc, y, 'Datos del Inmueble')
  y = drawRow(doc, y, 'Propietario', subject.client_name || '—')
  y = drawRow(doc, y, 'Dirección', subject.address || '—')
  y = drawRow(doc, y, 'Comuna', subject.commune || '—')
  y = drawRow(doc, y, 'Rol SII', subject.sii_role || '—')
  y += 3

  // ── I. ANÁLISIS DE LA PROPIEDAD
  checkPage(40)
  y = drawSectionTitle(doc, y, 'I. Análisis de la Propiedad')
  y = drawRow(doc, y, 'Tipo de Propiedad', tipo)
  if (subject.usable_area_m2) y = drawRow(doc, y, 'm² Útiles', `${subject.usable_area_m2} m²`)
  if (subject.terrace_area_m2) y = drawRow(doc, y, 'm² Terraza', `${subject.terrace_area_m2} m²`)
  const casa = result.property_type === 'CASA' ? (subject as Partial<SubjectCasa>) : null
  if (casa?.land_area_m2) y = drawRow(doc, y, 'm² Terreno', `${casa.land_area_m2} m²`)
  if (subject.bedrooms) y = drawRow(doc, y, 'Dormitorios', `${subject.bedrooms}`)
  if (subject.bathrooms) y = drawRow(doc, y, 'Baños', `${subject.bathrooms}`)
  if (subject.parking_spaces) y = drawRow(doc, y, 'Estacionamientos', `${subject.parking_spaces}`)
  if (subject.storage_units) y = drawRow(doc, y, 'Bodegas', `${subject.storage_units}`)
  if (casa?.construction_year) y = drawRow(doc, y, 'Año Construcción', `${casa.construction_year}`)
  if (casa?.state) y = drawRow(doc, y, 'Estado Conservación', STATE_LABELS[casa.state])
  if (casa?.material) y = drawRow(doc, y, 'Material', MATERIAL_LABELS[casa.material])

  if (subject.observaciones_legales) {
    checkPage(12)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(136, 136, 160)
    doc.text('Observaciones Legales:', MARGIN_L + 6, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 46)
    const lines = doc.splitTextToSize(subject.observaciones_legales, CONTENT_W - 6)
    lines.forEach((line: string) => { checkPage(5); doc.text(line, MARGIN_L + 6, y); y += 4.5 })
    y += 2
  }

  if (subject.factores_diferenciadores) {
    checkPage(12)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(136, 136, 160)
    doc.text('Factores Diferenciadores:', MARGIN_L + 6, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 46)
    const lines = doc.splitTextToSize(subject.factores_diferenciadores, CONTENT_W - 6)
    lines.forEach((line: string) => { checkPage(5); doc.text(line, MARGIN_L + 6, y); y += 4.5 })
    y += 2
  }
  y += 3

  // ── II. FACTIBILIDAD COMERCIAL
  checkPage(30)
  y = drawSectionTitle(doc, y, 'II. Análisis de Factibilidad Comercial')
  const getRange = () => {
    if (result.property_type === 'CASA') {
      const r = result as CasaValuationResult
      return { min: r.MEDIA.MIN.total_uf, max: r.MEDIA.MAX.total_uf, prom: r.MEDIA.PROM.total_uf }
    }
    const r = result as DeptoValuationResult
    return { min: r.COMP.MIN.total_uf, max: r.COMP.MAX.total_uf, prom: r.COMP.PROM.total_uf }
  }
  const range = getRange()
  if (subject.seller_expectation_uf) y = drawRow(doc, y, 'Expectativa Vendedor', `${formatUF(subject.seller_expectation_uf)} UF`)
  y = drawRow(doc, y, 'Valor Tasación (Promedio)', `${formatUF(range.prom)} UF`)
  if (params.uf_value_clp) y = drawRow(doc, y, 'Equivalente CLP', formatCLP(range.prom * params.uf_value_clp))
  if (subject.fiscal_appraisal_uf) y = drawRow(doc, y, 'Avalúo Fiscal', `${formatUF(subject.fiscal_appraisal_uf)} UF`)
  y += 3

  // ── ESTRATEGIA DE PRECIO
  checkPage(25)
  y = drawSectionTitle(doc, y, 'III. Estrategia de Precio')
  const priceRows: string[][] = [['UF', formatUF(range.min), formatUF(range.prom), formatUF(range.max)]]
  if (params.uf_value_clp) {
    priceRows.push(['CLP', formatCLP(range.min * params.uf_value_clp), formatCLP(range.prom * params.uf_value_clp), formatCLP(range.max * params.uf_value_clp)])
  }
  y = drawTable(doc, y, ['Moneda', 'Mínimo', '★ Promedio', 'Máximo'], priceRows, [30, 50, 55, 39])

  // ── ARRIENDOS
  if (arriendoResult) {
    checkPage(30)
    y = drawSectionTitle(doc, y, 'IV. Evaluación de Arriendos Comparativos')
    const hdrs = params.uf_value_clp
      ? ['#', 'Referencia', 'm²', 'Pub.', 'Mon.', 'CLP']
      : ['#', 'Referencia', 'm²', 'Pub.', 'Mon.']
    const arrRows = arriendoResult.comparables.map((c, i) => {
      const base = [`${i + 1}`, c.referencia || '—', `${c.util_m2}`, `${c.arriendo_publicado.toLocaleString('es-CL')}`, c.moneda]
      if (params.uf_value_clp) base.push(c.arriendo_clp ? formatCLP(c.arriendo_clp) : '—')
      return base
    })
    const cw = params.uf_value_clp ? [8, 55, 18, 32, 14, 47] : [8, 65, 20, 40, 41]
    y = drawTable(doc, y, hdrs, arrRows, cw)
    y = drawRow(doc, y, 'Arriendo promedio', `${formatCLP(arriendoResult.arriendo_promedio_clp)}${arriendoResult.arriendo_promedio_uf ? ` (${formatUF(arriendoResult.arriendo_promedio_uf)} UF)` : ''}`)
    y += 3

    // VACANCIA
    checkPage(30)
    y = drawSectionTitle(doc, y, 'V. Impacto de la Vacancia en Ingreso Anual')
    const vacRows = arriendoResult.scenarios.map(sc => [
      `${sc.meses} mes${sc.meses > 1 ? 'es' : ''}`,
      formatCLP(sc.arriendo_neto_mensual_clp),
      formatCLP(sc.ingresos_anuales_clp),
      formatCLP(sc.gastos_anuales_clp),
      formatCLP(sc.ingreso_neto_anual_clp),
      sc.cap_rate > 0 ? formatPercent(sc.cap_rate) : '—',
    ])
    y = drawTable(doc, y, ['Vacancia', 'Arr.Mensual', 'Ing.Anual', 'Gastos', 'Neto Anual', '★Cap Rate'], vacRows, [22, 32, 32, 30, 32, 26])
  }

  // ── CONCLUSIONES
  checkPage(30)
  y = drawSectionTitle(doc, y, arriendoResult ? 'VI. Conclusiones' : 'IV. Conclusiones')
  let conclusion = `La propiedad ubicada en ${subject.address || 'la dirección indicada'}, ${subject.commune ? `Comuna de ${subject.commune}, ` : ''}presenta un valor de tasación estimado de ${formatUF(range.prom)} UF (promedio), con un rango entre ${formatUF(range.min)} UF y ${formatUF(range.max)} UF.`
  if (params.uf_value_clp) conclusion += ` Equivale aproximadamente a ${formatCLP(range.prom * params.uf_value_clp)} CLP.`
  if (arriendoResult) {
    const sc = arriendoResult.scenarios.find(s => s.meses === arriendoAnalysis.vacancia_meses)
    conclusion += ` En términos de rentabilidad, con un arriendo estimado de ${formatCLP(arriendoResult.arriendo_promedio_clp)} mensuales y una vacancia de ${arriendoAnalysis.vacancia_meses} mes(es), el cap rate estimado es de ${sc ? formatPercent(sc.cap_rate) : '—'}.`
  }
  const conclusionLines = doc.splitTextToSize(conclusion, CONTENT_W - 6)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(26, 26, 46)
  conclusionLines.forEach((line: string) => { checkPage(6); doc.text(line, MARGIN_L + 6, y); y += 5 })

  // Footer
  drawFooter(doc, pageNum, disclaimer)

  // Save
  const addr = (subject.address || 'Propiedad').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
  const dateStr = new Date().toISOString().split('T')[0]
  doc.save(`ViveProp_Informe_${tipo}_${addr}_${dateStr}.pdf`)
}
