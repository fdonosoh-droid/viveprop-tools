import jsPDF from 'jspdf'
import type { EvaluationOutput } from '@/types/evaluation'
import type { FormData } from '@/types/evaluation'
import type { PropertyEvalOutput, PropertyFormData } from '@/types/property-evaluation'
import { formatCLP, formatUF, clpToUf, formatPercent } from '@/lib/perfilamiento/evaluation-engine'
import {
  drawHeader, drawFooter, drawSectionTitle, drawRow, drawStatusBadge, drawMeta,
  MARGIN_L, CONTENT_W
} from '@/lib/pdf-brand'

const DISCLAIMER = 'Herramienta referencial. No constituye una oferta de crédito.'

function money(clp: number, ufVal: number): string {
  return `${formatCLP(clp)}  ·  ${formatUF(clpToUf(clp, ufVal))}`
}

function statusColor(resultado: string): 'green' | 'orange' | 'red' {
  if (resultado === 'apto') return 'green'
  if (resultado === 'no_apto') return 'red'
  return 'orange'
}

const STATUS_LABELS: Record<string, string> = {
  apto: 'APTO',
  apto_con_condiciones: 'APTO CON CONDICIONES',
  no_apto: 'NO APTO',
}

export function generateEvaluationPDF(result: EvaluationOutput, data: FormData) {
  const doc = new jsPDF()
  const uf = result.ufUsada
  let pageNum = 1

  const checkPage = (need: number) => {
    if (y + need > 270) {
      drawFooter(doc, pageNum, DISCLAIMER)
      doc.addPage()
      pageNum++
      y = 20
    }
  }

  // ── HEADER
  let y = drawHeader(doc, 'Informe de Evaluación Financiera', `Perfilamiento de Compradores`)

  // Meta
  y = drawMeta(doc, y, [
    `UF: $${uf.valor.toLocaleString('es-CL')}`,
    `Fuente: ${uf.fuente}`,
    `Fecha: ${new Date(uf.fecha).toLocaleDateString('es-CL')}`,
  ])

  // ── RESULTADO
  y = drawSectionTitle(doc, y, 'Resultado')
  y = drawStatusBadge(doc, y, STATUS_LABELS[result.resultado] || result.resultado, statusColor(result.resultado))

  doc.setFontSize(8.5)
  doc.setTextColor(136, 136, 160)
  doc.text(`Solicitante: ${data.nombre || 'N/A'}`, MARGIN_L + 6, y)
  y += 8

  // ── DETALLE
  if (result.razones.length > 0) {
    checkPage(15)
    y = drawSectionTitle(doc, y, 'Detalle de la Evaluación')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 46)
    result.razones.forEach(r => {
      checkPage(6)
      doc.text(`•  ${r}`, MARGIN_L + 6, y)
      y += 5.5
    })
    y += 3
  }

  // ── INDICADORES FINANCIEROS
  checkPage(40)
  y = drawSectionTitle(doc, y, 'Indicadores Financieros')
  y = drawRow(doc, y, 'Ingreso evaluable', money(result.ingresoEvaluable, uf.valor))
  y = drawRow(doc, y, 'Carga sin hipotecario', money(result.cargaSinHipotecario, uf.valor))
  y = drawRow(doc, y, 'RCI sin hipotecario', formatPercent(result.rciSinHipotecario))
  y = drawRow(doc, y, 'Dividendo máximo', money(result.dividendoMaximo, uf.valor))
  y = drawRow(doc, y, 'Dividendo / Renta', formatPercent(result.dividendoRentaRatio))
  y = drawRow(doc, y, 'Carga total / Renta', formatPercent(result.cargaTotalRentaRatio))
  y += 3

  // ── VALOR MÁXIMO — SOLO
  checkPage(30)
  y = drawSectionTitle(doc, y, 'Valor Máximo de Propiedad — Solo')
  y = drawRow(doc, y, 'Crédito máximo', money(result.creditoMaximo, uf.valor))
  y = drawRow(doc, y, 'Máx. por PIE', money(result.propiedadMaxPorPie, uf.valor))
  y = drawRow(doc, y, 'Máx. por LTV', money(result.propiedadMaxPorLtv, uf.valor))

  // Highlight max value
  checkPage(10)
  doc.setFillColor(248, 249, 252)
  doc.roundedRect(MARGIN_L + 4, y - 4, CONTENT_W - 4, 8, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 59, 152)
  doc.text('VALOR MÁXIMO', MARGIN_L + 8, y + 1)
  doc.text(money(result.propiedadMaxFinal, uf.valor), 90, y + 1)
  y += 12

  // ── COMBINADO
  if (data.tieneComplementario && result.ingresoEvaluableCombinado != null) {
    checkPage(30)
    y = drawSectionTitle(doc, y, `Valor Máximo — Con ${data.comp_nombre || 'co-solicitante'}`)
    y = drawRow(doc, y, 'Ingreso combinado', money(result.ingresoEvaluableCombinado, uf.valor))
    y = drawRow(doc, y, 'Crédito máximo', money(result.creditoMaximoCombinado!, uf.valor))

    checkPage(10)
    doc.setFillColor(248, 249, 252)
    doc.roundedRect(MARGIN_L + 4, y - 4, CONTENT_W - 4, 8, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 59, 152)
    doc.text('VALOR MÁXIMO COMBINADO', MARGIN_L + 8, y + 1)
    doc.text(money(result.propiedadMaxFinalCombinada!, uf.valor), 90, y + 1)
    y += 12
  }

  // ── FOOTER
  drawFooter(doc, pageNum, DISCLAIMER)
  doc.save(`ViveProp_Evaluacion_${(data.nombre || 'informe').replace(/\s+/g, '_')}.pdf`)
}

export function generatePropertyPDF(result: PropertyEvalOutput, data: PropertyFormData) {
  const doc = new jsPDF()
  const uf = result.ufUsada
  let pageNum = 1

  const checkPage = (need: number) => {
    if (y + need > 270) {
      drawFooter(doc, pageNum, DISCLAIMER)
      doc.addPage()
      pageNum++
      y = 20
    }
  }

  // ── HEADER
  let y = drawHeader(doc, 'Informe de Evaluación por Propiedad', `Perfilamiento de Compradores`)

  // Meta
  y = drawMeta(doc, y, [
    `UF: $${uf.valor.toLocaleString('es-CL')}`,
    `Fuente: ${uf.fuente}`,
    `Fecha: ${new Date(uf.fecha).toLocaleDateString('es-CL')}`,
  ])

  // ── DATOS DE LA PROPIEDAD
  y = drawSectionTitle(doc, y, 'Datos de la Propiedad')
  y = drawRow(doc, y, 'Ubicación', data.ubicacion || 'N/A')
  y = drawRow(doc, y, 'Tipología', data.tipologia || 'N/A')
  y = drawRow(doc, y, 'Valor lista (UF)', formatUF(data.valorPropiedadUF))
  y = drawRow(doc, y, 'Valor lista (CLP)', formatCLP(data.valorPropiedadUF * uf.valor))
  y += 3

  // ── AJUSTES AL PRECIO
  checkPage(25)
  y = drawSectionTitle(doc, y, 'Ajustes al Precio')
  y = drawRow(doc, y, 'Bono Pie', `${data.bonoPiePct}%  →  ${formatUF(result.bonoPieUF)}  ·  ${formatCLP(result.bonoPieUF * uf.valor)}`)
  y = drawRow(doc, y, 'Descuento', `${data.descuentoPct}%  →  ${formatUF(result.descuentoUF)}  ·  ${formatCLP(result.descuentoUF * uf.valor)}`)
  y = drawRow(doc, y, 'Pie aportado', `${formatUF(result.pieAportadoUF)}  ·  ${formatCLP(result.pieAportadoUF * uf.valor)}`)

  // Highlight financiamiento
  checkPage(10)
  doc.setFillColor(248, 249, 252)
  doc.roundedRect(MARGIN_L + 4, y - 4, CONTENT_W - 4, 8, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 59, 152)
  doc.text('FINANCIAMIENTO', MARGIN_L + 8, y + 1)
  doc.text(`${formatUF(result.financiamientoUF)}  ·  ${formatCLP(result.financiamientoUF * uf.valor)}`, 90, y + 1)
  y += 12

  // ── RESULTADO
  checkPage(20)
  y = drawSectionTitle(doc, y, 'Resultado de la Evaluación')
  y = drawStatusBadge(doc, y, STATUS_LABELS[result.resultado] || result.resultado, statusColor(result.resultado))

  doc.setFontSize(8.5)
  doc.setTextColor(136, 136, 160)
  doc.text(`Solicitante: ${data.nombre || 'N/A'}`, MARGIN_L + 6, y)
  y += 8

  // Razones
  if (result.razones.length > 0) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 46)
    result.razones.forEach(r => {
      checkPage(6)
      doc.text(`•  ${r}`, MARGIN_L + 6, y)
      y += 5.5
    })
    y += 3
  }

  // ── INDICADORES FINANCIEROS — SOLO
  checkPage(25)
  y = drawSectionTitle(doc, y, 'Indicadores Financieros — Solo')
  y = drawRow(doc, y, 'Ingreso evaluable', money(result.ingresoEvaluable, uf.valor))
  y = drawRow(doc, y, 'Carga sin hipotecario', money(result.cargaSinHipotecario, uf.valor))
  y = drawRow(doc, y, 'Dividendo estimado', money(result.dividendoEstimado, uf.valor))
  y = drawRow(doc, y, 'RCI con hipotecario', formatPercent(result.rciConHipotecario))
  y += 3

  // ── COMBINADO
  if (data.tieneComplementario && result.dividendoEstimadoCombinado != null) {
    checkPage(20)
    y = drawSectionTitle(doc, y, `Indicadores — Con ${data.comp_nombre || 'codeudor'}`)
    y = drawRow(doc, y, 'Ingreso combinado', money(result.ingresoEvaluableCombinado!, uf.valor))
    y = drawRow(doc, y, 'Dividendo estimado', money(result.dividendoEstimadoCombinado, uf.valor))
    y = drawRow(doc, y, 'RCI con hipotecario', formatPercent(result.rciConHipotecarioCombinado!))
  }

  // ── FOOTER
  drawFooter(doc, pageNum, DISCLAIMER)
  doc.save(`ViveProp_Propiedad_${(data.nombre || 'informe').replace(/\s+/g, '_')}.pdf`)
}
