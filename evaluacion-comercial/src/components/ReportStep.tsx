import { useMemo } from 'react';
import { FileText, Download, ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calcArriendoResult, formatUF, formatCLP, formatPercent } from '@/lib/engines';
import { STATE_LABELS, MATERIAL_LABELS } from '@/lib/types';
import type { ValuationResult, MarketParams, Subject, ArriendoAnalysis, CasaValuationResult, DeptoValuationResult } from '@/lib/types';
import { generatePDF } from '@/lib/pdfExport';

interface ReportStepProps {
  result: ValuationResult;
  params: MarketParams;
  subject: Partial<Subject>;
  arriendoAnalysis: ArriendoAnalysis;
  onBack: () => void;
  onReset: () => void;
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-navy text-white font-semibold text-sm px-3 py-1.5 rounded mb-3 flex items-center gap-2">
      <span>{title}</span>
    </div>
  );
}

export function ReportStep({ result, params, subject, arriendoAnalysis, onBack, onReset }: ReportStepProps) {
  const today = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const arriendoResult = useMemo(() => {
    try {
      return calcArriendoResult(arriendoAnalysis, params.uf_value_clp);
    } catch {
      return null;
    }
  }, [arriendoAnalysis, params.uf_value_clp]);

  const getValorProm = () => {
    if (result.property_type === 'CASA') {
      return (result as CasaValuationResult).MEDIA.PROM.total_uf;
    }
    return (result as DeptoValuationResult).COMP.PROM.total_uf;
  };

  const getRange = () => {
    if (result.property_type === 'CASA') {
      const r = result as CasaValuationResult;
      return { min: r.MEDIA.MIN.total_uf, max: r.MEDIA.MAX.total_uf, prom: r.MEDIA.PROM.total_uf };
    }
    const r = result as DeptoValuationResult;
    return { min: r.COMP.MIN.total_uf, max: r.COMP.MAX.total_uf, prom: r.COMP.PROM.total_uf };
  };

  const range = getRange();
  const valorProm = getValorProm();

  const handleDownload = () => {
    generatePDF({ result, params, subject, arriendoAnalysis, arriendoResult });
  };

  const casa = result.property_type === 'CASA' ? (subject as Partial<import('@/lib/types').SubjectCasa>) : null;
  const depto = result.property_type === 'DEPTO' ? (subject as Partial<import('@/lib/types').SubjectDepto>) : null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Header toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-navy">Informe Caso de Negocio</h2>
        </div>
        <Button onClick={handleDownload} className="gap-2 bg-navy hover:bg-navy/90">
          <Download size={16} /> Descargar PDF
        </Button>
      </div>

      {/* Report body */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm print:shadow-none" id="report-content">
        {/* Report header */}
        <div className="bg-navy text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold font-serif">INFORME CASO DE NEGOCIO</h1>
              <p className="text-white/80 text-sm">
                {result.property_type === 'CASA' ? 'Casa' : 'Departamento'} — Viveprop Evaluaciones Comerciales
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-white/70">Fecha: {today}</p>
              {params.uf_value_clp && (
                <p className="text-gold font-medium">UF: {formatCLP(params.uf_value_clp)}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 pt-3 border-t border-white/20">
            <div><p className="text-white/60 text-[10px]">PROPIETARIO</p><p className="text-sm font-medium">{subject.client_name || '—'}</p></div>
            <div><p className="text-white/60 text-[10px]">DIRECCIÓN</p><p className="text-sm font-medium">{subject.address || '—'}</p></div>
            <div><p className="text-white/60 text-[10px]">COMUNA</p><p className="text-sm font-medium">{subject.commune || '—'}</p></div>
            <div><p className="text-white/60 text-[10px]">ROL SII</p><p className="text-sm font-medium">{subject.sii_role || '—'}</p></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* I. Análisis propiedad */}
          <section>
            <SectionHeader title="I. Análisis de la Propiedad" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <Field label="Tipo de Propiedad" value={result.property_type === 'CASA' ? 'Casa' : 'Departamento'} />
              <Field label="m² Útiles" value={subject.usable_area_m2 ? `${subject.usable_area_m2} m²` : null} />
              <Field label="m² Terraza" value={subject.terrace_area_m2 ? `${subject.terrace_area_m2} m²` : null} />
              {casa?.land_area_m2 && <Field label="m² Terreno" value={`${casa.land_area_m2} m²`} />}
              <Field label="Dormitorios" value={subject.bedrooms} />
              <Field label="Baños" value={subject.bathrooms} />
              <Field label="Estacionamientos" value={subject.parking_spaces} />
              <Field label="Bodegas" value={subject.storage_units} />
              {casa?.construction_year && <Field label="Año Construcción" value={casa.construction_year} />}
              {casa?.state && <Field label="Estado Conservación" value={STATE_LABELS[casa.state]} />}
              {casa?.material && <Field label="Material" value={MATERIAL_LABELS[casa.material]} />}
              {depto?.subject_factor_estado && <Field label="Factor Estado" value={depto.subject_factor_estado.toFixed(2)} />}
              {depto?.subject_factor_orient && <Field label="Factor Orientación" value={depto.subject_factor_orient.toFixed(2)} />}
              {depto?.subject_factor_franja && <Field label="Factor Franja" value={depto.subject_factor_franja.toFixed(2)} />}
            </div>
            {subject.observaciones_legales && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">OBSERVACIONES LEGALES</p>
                <p className="text-sm whitespace-pre-wrap">{subject.observaciones_legales}</p>
              </div>
            )}
          </section>

          {/* II. Factibilidad comercial */}
          <section>
            <SectionHeader title="II. Análisis de Factibilidad Comercial" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {subject.seller_expectation_uf ? <Field label="Expectativa Vendedor" value={`${formatUF(subject.seller_expectation_uf)} UF`} /> : null}
              <Field label="Valor Tasación (Promedio)" value={`${formatUF(valorProm)} UF`} />
              {subject.fiscal_appraisal_uf ? <Field label="Avalúo Fiscal" value={`${formatUF(subject.fiscal_appraisal_uf)} UF`} /> : null}
            </div>
            {subject.factores_diferenciadores && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">FACTORES DIFERENCIADORES</p>
                <p className="text-sm whitespace-pre-wrap">{subject.factores_diferenciadores}</p>
              </div>
            )}
          </section>

          {/* Comparables arriendo */}
          {arriendoResult && (
            <section>
              <SectionHeader title="Evaluación de Arriendos Comparativos" />
              <div className="overflow-x-auto">
                <table className="text-xs w-full border rounded">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Referencia</th>
                      <th className="px-3 py-2 text-center">m²Útiles</th>
                      <th className="px-3 py-2 text-center">Arriendo Pub.</th>
                      <th className="px-3 py-2 text-center">Moneda</th>
                      {params.uf_value_clp && <th className="px-3 py-2 text-center">CLP</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {arriendoResult.comparables.map((comp, i) => (
                      <tr key={comp.id} className="border-t hover:bg-muted/20">
                        <td className="px-3 py-1.5">{i + 1}</td>
                        <td className="px-3 py-1.5">{comp.referencia || '—'}</td>
                        <td className="px-3 py-1.5 text-center">{comp.util_m2}</td>
                        <td className="px-3 py-1.5 text-center font-mono">{comp.arriendo_publicado.toLocaleString('es-CL')}</td>
                        <td className="px-3 py-1.5 text-center">{comp.moneda}</td>
                        {params.uf_value_clp && <td className="px-3 py-1.5 text-center font-mono">{comp.arriendo_clp ? formatCLP(comp.arriendo_clp) : '—'}</td>}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30 font-semibold">
                      <td colSpan={params.uf_value_clp ? 5 : 4} className="px-3 py-1.5 text-sm">
                        Arriendo estimado (promedio):
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono">
                        {formatCLP(arriendoResult.arriendo_promedio_clp)}
                        {arriendoResult.arriendo_promedio_uf && ` (${formatUF(arriendoResult.arriendo_promedio_uf)} UF)`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* III. Estrategia de precio */}
          <section>
            <SectionHeader title="III. Estrategia de Precio y Tiempo" />
            <div className="overflow-x-auto">
              <table className="text-xs w-full border rounded">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left bg-navy text-white">Precio Sugerido</th>
                    <th className="px-3 py-2 text-center bg-navy text-white">Mínimo</th>
                    <th className="px-3 py-2 text-center bg-accent/40 text-navy font-bold">⭐ Promedio</th>
                    <th className="px-3 py-2 text-center bg-navy text-white">Máximo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2 font-medium">UF</td>
                    <td className="px-3 py-2 text-center font-mono">{formatUF(range.min)}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-accent bg-accent/5">{formatUF(range.prom)}</td>
                    <td className="px-3 py-2 text-center font-mono">{formatUF(range.max)}</td>
                  </tr>
                  {params.uf_value_clp && (
                    <tr className="text-muted-foreground text-[10px]">
                      <td className="px-3 py-1.5">CLP</td>
                      <td className="px-3 py-1.5 text-center">{formatCLP(range.min * params.uf_value_clp)}</td>
                      <td className="px-3 py-1.5 text-center bg-accent/5">{formatCLP(range.prom * params.uf_value_clp)}</td>
                      <td className="px-3 py-1.5 text-center">{formatCLP(range.max * params.uf_value_clp)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Impacto vacancia */}
          {arriendoResult && (
            <section>
              <SectionHeader title="Impacto de la Vacancia en Ingreso Anual" />
              <div className="overflow-x-auto">
                <table className="text-xs w-full border rounded">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-3 py-2 text-left">Vacancia</th>
                      <th className="px-3 py-2 text-center">Arriendo Mensual</th>
                      <th className="px-3 py-2 text-center">Ingresos Anuales</th>
                      <th className="px-3 py-2 text-center">Gastos Anuales</th>
                      <th className="px-3 py-2 text-center">Ingreso Neto Anual</th>
                      <th className="px-3 py-2 text-center">⭐ Cap Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arriendoResult.scenarios.map(sc => {
                      const isSelected = sc.meses === arriendoAnalysis.vacancia_meses;
                      return (
                        <tr key={sc.meses} className={`border-t ${isSelected ? 'bg-accent/10 font-semibold' : 'hover:bg-muted/20'}`}>
                          <td className="px-3 py-1.5">{sc.meses} mes{sc.meses > 1 ? 'es' : ''}</td>
                          <td className="px-3 py-1.5 text-center font-mono">{formatCLP(sc.arriendo_neto_mensual_clp)}</td>
                          <td className="px-3 py-1.5 text-center font-mono">{formatCLP(sc.ingresos_anuales_clp)}</td>
                          <td className="px-3 py-1.5 text-center font-mono">{formatCLP(sc.gastos_anuales_clp)}</td>
                          <td className="px-3 py-1.5 text-center font-mono">{formatCLP(sc.ingreso_neto_anual_clp)}</td>
                          <td className={`px-3 py-1.5 text-center font-mono bg-accent/5 ${isSelected ? 'text-accent font-bold' : ''}`}>
                            {sc.cap_rate > 0 ? formatPercent(sc.cap_rate) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* IV. Conclusiones */}
          <section>
            <SectionHeader title="IV. Conclusiones y Pasos a Seguir" />
            <div className="bg-muted/30 border rounded-lg p-4 text-sm leading-relaxed">
              <p>
                La propiedad ubicada en <strong>{subject.address || 'la dirección indicada'}</strong>, 
                {subject.commune ? ` Comuna de ${subject.commune},` : ''} presenta un valor de tasación estimado de{' '}
                <strong className="text-primary">{formatUF(range.prom)} UF</strong> (promedio), con un rango entre{' '}
                <strong>{formatUF(range.min)} UF</strong> y <strong>{formatUF(range.max)} UF</strong>.
                {params.uf_value_clp && ` Esto equivale aproximadamente a ${formatCLP(range.prom * params.uf_value_clp)} CLP.`}
              </p>
              {arriendoResult && (
                <p className="mt-2">
                  En términos de rentabilidad, con un arriendo estimado de{' '}
                  <strong>{formatCLP(arriendoResult.arriendo_promedio_clp)}</strong> mensuales y una vacancia de{' '}
                  <strong>{arriendoAnalysis.vacancia_meses} mes(es)</strong>, el cap rate estimado es de{' '}
                  <strong className="text-primary">
                    {formatPercent(arriendoResult.scenarios.find(s => s.meses === arriendoAnalysis.vacancia_meses)?.cap_rate)}
                  </strong>.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-muted/30 text-center text-[10px] text-muted-foreground">
          Informe generado el {today} — Sistema de Valorización Inmobiliaria Viveprop
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft size={16} /> Volver
        </Button>
        <div className="flex gap-3">
          <Button onClick={handleDownload} variant="outline" className="gap-2 border-navy text-navy">
            <Download size={16} /> Descargar PDF
          </Button>
          <Button onClick={onReset} className="gap-2 bg-gold hover:bg-gold/90 text-navy font-semibold">
            <RotateCcw size={16} /> Nueva Tasación
          </Button>
        </div>
      </div>
    </div>
  );
}
