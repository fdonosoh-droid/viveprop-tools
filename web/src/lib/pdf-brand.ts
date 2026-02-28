import jsPDF from 'jspdf'

// ViveProp brand colors
export const BRAND = {
  indigo: [59, 59, 152] as const,    // #3B3B98
  coral: [253, 89, 104] as const,    // #FD5968
  magenta: [255, 0, 109] as const,   // #FF006D
  sky: [112, 160, 254] as const,     // #70A0FE
  dark: [26, 26, 46] as const,       // #1A1A2E
  muted: [136, 136, 160] as const,   // #8888A0
  light: [248, 249, 252] as const,   // #F8F9FC
  white: [255, 255, 255] as const,
  black: [0, 0, 0] as const,
}

const MARGIN_L = 18
const PAGE_W = 210 // A4
const CONTENT_W = PAGE_W - MARGIN_L * 2

/**
 * Draw the ViveProp text logo: "Vive" in coral + "prop" in indigo
 */
export function drawLogo(doc: jsPDF, x: number, y: number, size = 18) {
  doc.setFontSize(size)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND.coral)
  doc.text('Vive', x, y)
  const viveW = doc.getTextWidth('Vive')
  doc.setTextColor(...BRAND.indigo)
  doc.text('prop', x + viveW, y)
}

/**
 * Draw a professional header with brand identity
 */
export function drawHeader(doc: jsPDF, title: string, subtitle?: string): number {
  // Top accent bar (magenta → indigo gradient effect via two bars)
  doc.setFillColor(...BRAND.indigo)
  doc.rect(0, 0, PAGE_W, 3, 'F')
  doc.setFillColor(...BRAND.magenta)
  doc.rect(0, 0, 60, 3, 'F')
  doc.setFillColor(...BRAND.coral)
  doc.rect(60, 0, 40, 3, 'F')
  doc.setFillColor(...BRAND.sky)
  doc.rect(100, 0, 30, 3, 'F')

  // Logo
  drawLogo(doc, MARGIN_L, 18, 22)

  // Title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND.dark)
  doc.text(title, MARGIN_L, 30)

  // Subtitle
  let y = 36
  if (subtitle) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BRAND.muted)
    doc.text(subtitle, MARGIN_L, y)
    y += 5
  }

  // Separator
  doc.setDrawColor(...BRAND.indigo)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_L, y, PAGE_W - MARGIN_L, y)

  return y + 6
}

/**
 * Draw footer with page number and disclaimer
 */
export function drawFooter(doc: jsPDF, pageNum: number, disclaimer: string) {
  const footerY = 284
  // Thin line
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(MARGIN_L, footerY - 3, PAGE_W - MARGIN_L, footerY - 3)

  // Logo small
  drawLogo(doc, MARGIN_L, footerY, 8)

  // Disclaimer
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BRAND.muted)
  doc.text(disclaimer, MARGIN_L + 25, footerY)

  // Page number
  doc.text(`Pág. ${pageNum}`, PAGE_W - MARGIN_L - 12, footerY)
}

/**
 * Draw a section title with indigo accent bar
 */
export function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(...BRAND.indigo)
  doc.rect(MARGIN_L, y, 3, 7, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND.dark)
  doc.text(title, MARGIN_L + 6, y + 5.5)
  return y + 11
}

/**
 * Draw a key-value row
 */
export function drawRow(doc: jsPDF, y: number, label: string, value: string, valueX = 90): number {
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BRAND.muted)
  doc.text(label, MARGIN_L + 6, y)
  doc.setTextColor(...BRAND.dark)
  doc.text(value, valueX, y)
  return y + 5.5
}

/**
 * Draw a highlighted status badge
 */
export function drawStatusBadge(doc: jsPDF, y: number, label: string, color: 'green' | 'orange' | 'red'): number {
  const colors = {
    green: { bg: [16, 185, 129] as const, text: [255, 255, 255] as const },
    orange: { bg: [245, 158, 11] as const, text: [255, 255, 255] as const },
    red: { bg: [253, 89, 104] as const, text: [255, 255, 255] as const },
  }
  const c = colors[color]
  const w = doc.getTextWidth(label) * 1.3 + 12
  doc.setFillColor(c.bg[0], c.bg[1], c.bg[2])
  doc.roundedRect(MARGIN_L + 6, y - 4.5, w, 7, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(c.text[0], c.text[1], c.text[2])
  doc.text(label, MARGIN_L + 12, y)
  return y + 10
}

/**
 * Draw a table with professional styling
 */
export function drawTable(
  doc: jsPDF, y: number,
  headers: string[], rows: string[][],
  colWidths?: number[]
): number {
  const cols = headers.length
  const defaultW = CONTENT_W / cols
  const widths = colWidths || Array(cols).fill(defaultW)

  // Header row
  let cx = MARGIN_L
  doc.setFillColor(...BRAND.indigo)
  headers.forEach((h, i) => {
    doc.rect(cx, y, widths[i], 6.5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRAND.white)
    doc.text(h, cx + 2, y + 4.5)
    cx += widths[i]
  })
  y += 6.5

  // Data rows
  rows.forEach((row, ri) => {
    cx = MARGIN_L
    if (ri % 2 === 0) {
      doc.setFillColor(...BRAND.light)
      doc.rect(MARGIN_L, y, CONTENT_W, 5.5, 'F')
    }
    row.forEach((cell, ci) => {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...BRAND.dark)
      doc.text(String(cell), cx + 2, y + 4)
      cx += widths[ci]
    })
    y += 5.5
  })

  return y + 3
}

/**
 * Metadata line (date, UF, etc.)
 */
export function drawMeta(doc: jsPDF, y: number, items: string[]): number {
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BRAND.muted)
  doc.text(items.join('   |   '), MARGIN_L, y)
  return y + 6
}

export { MARGIN_L, PAGE_W, CONTENT_W }
