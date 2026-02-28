import type { FormData } from '@/types/evaluation';
import { formatCLP } from '@/lib/evaluation-engine';

interface Props { data: FormData; }

const num = (v: number | ''): number => (v === '' ? 0 : Number(v));

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1.5 border-b border-dashed border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

const StepSummary = ({ data }: Props) => (
  <div className="space-y-6">
    <h2 className="font-serif text-2xl text-foreground">Resumen de datos</h2>
    <p className="text-sm text-muted-foreground">Revisa que la información sea correcta antes de evaluar.</p>

    <div className="space-y-4">
      <Section title="Datos personales">
        <SummaryRow label="Nombre" value={data.nombre || '—'} />
        <SummaryRow label="RUT" value={data.rut ? data.rut.replace(/(\d{2})\d+/, '$1•••••') : '—'} />
        <SummaryRow label="Edad" value={data.edad ? `${data.edad} años` : '—'} />
        <SummaryRow label="Estado civil" value={data.estadoCivil} />
        <SummaryRow label="Contrato" value={data.tipoContrato} />
        <SummaryRow label="Antigüedad" value={data.antiguedadMeses ? `${data.antiguedadMeses} meses` : '—'} />
      </Section>

      <Section title="Ingresos mensuales">
        <SummaryRow label="Renta líquida" value={formatCLP(num(data.rentaLiquida))} />
        <SummaryRow label="Variables" value={formatCLP(num(data.ingresosVariables))} />
        <SummaryRow label="Otros ingresos" value={formatCLP(num(data.otrosIngresos))} />
      </Section>

      <Section title="Deudas mensuales">
        <SummaryRow label="Cuotas créditos" value={formatCLP(num(data.cuotasCreditos))} />
        <SummaryRow label="Tarjetas" value={formatCLP(num(data.pagoTarjetas))} />
        <SummaryRow label="Pensiones" value={formatCLP(num(data.pensiones))} />
        <SummaryRow label="Otras" value={formatCLP(num(data.otrasObligaciones))} />
        <SummaryRow label="Morosidad" value={data.morosidad ? '⚠️ Sí' : 'No'} />
      </Section>

      <Section title="Ahorro">
        <SummaryRow label="Pie disponible" value={formatCLP(num(data.pieDisponible))} />
      </Section>

      {data.tieneComplementario && (
        <Section title={`Co-solicitante: ${data.comp_nombre || '—'}`}>
          <SummaryRow label="Renta líquida" value={formatCLP(num(data.comp_rentaLiquida))} />
          <SummaryRow label="Variables" value={formatCLP(num(data.comp_ingresosVariables))} />
          <SummaryRow label="Cuotas + tarjetas" value={formatCLP(num(data.comp_cuotasCreditos) + num(data.comp_pagoTarjetas))} />
          <SummaryRow label="Pie adicional" value={formatCLP(num(data.comp_pieDisponible))} />
        </Section>
      )}

      <Section title="Moneda">
        <SummaryRow label="Preferencia" value={data.moneda === 'CLP' ? 'Pesos (CLP)' : data.moneda === 'UF' ? 'UF' : 'Ambas'} />
      </Section>
    </div>
  </div>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif text-base text-foreground mb-2">{title}</h3>
      <div className="bg-muted/30 rounded-lg p-4">{children}</div>
    </div>
  );
}

export default StepSummary;
