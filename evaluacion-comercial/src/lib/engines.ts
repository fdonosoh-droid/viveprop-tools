import { getRHFactor } from './rh-table';
import { MATERIAL_VIDA_UTIL } from './types';
import type {
  MarketParams,
  SubjectCasa,
  SubjectDepto,
  ComparableCasa,
  ComparableDepto,
  ScenarioResult,
  REPResult,
  STDEVResult,
  MEDIAResult,
  COMPResult,
  DeptoScenarioResult,
  CasaValuationResult,
  DeptoValuationResult,
  ArriendoAnalysis,
  ArriendoResult,
  VacanciaScenarionResult,
  VacanciaMeses,
  ComparableArriendo,
} from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

export const r2 = (n: number): number => Math.round(n * 100) / 100;

export const toClp = (uf: number, ufClp: number | null): number | null =>
  ufClp ? r2(uf * ufClp) : null;

export const formatUF = (v: number | null | undefined): string => {
  if (v == null || isNaN(v)) return '—';
  return v.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatCLP = (v: number | null | undefined): string => {
  if (v == null || isNaN(v)) return '—';
  return '$' + Math.round(v).toLocaleString('es-CL');
};

export const formatPercent = (v: number | null | undefined): string => {
  if (v == null || isNaN(v)) return '—';
  return v.toFixed(2) + '%';
};

// ── CASA comparable processing ────────────────────────────────────────────────

export function processComparableCasa(
  comp: ComparableCasa,
  params: MarketParams,
  currentYear: number
): ComparableCasa {
  if (!comp.active || !comp.comp_price_pub_uf) return comp;

  const { negotiation_factor, parking_uf_casa, storage_uf, stdev_factor_adj } = params;

  const edad = currentYear - comp.comp_year;
  const vidaUtil = MATERIAL_VIDA_UTIL[comp.comp_material] ?? 80;
  const pctVida = (edad / vidaUtil) * 100;

  const { FK_RH: fkRaw } = getRHFactor(pctVida, comp.comp_state);
  const FK_RH = Math.round(fkRaw * 10000) / 10000;

  const precio_venta_uf = r2(comp.comp_price_pub_uf * negotiation_factor);
  const costo_dep_uf_m2 = r2(comp.comp_cost_uf_m2 * FK_RH);
  const costo_total_uf = r2(comp.comp_built_m2 * costo_dep_uf_m2);
  const precio_neto_uf = r2(
    precio_venta_uf - comp.comp_parking * parking_uf_casa - comp.comp_storage * storage_uf
  );

  let terreno_uf_m2 = 0;
  if (comp.comp_land_m2 > 0 && precio_neto_uf - costo_total_uf >= 0) {
    terreno_uf_m2 = r2((precio_neto_uf - costo_total_uf) / comp.comp_land_m2);
  }

  const precio_stdev_uf = r2(comp.comp_price_pub_uf * (FK_RH - stdev_factor_adj));
  const precio_neto_stdev = r2(precio_stdev_uf - comp.comp_parking * parking_uf_casa);

  let terreno_stdev_m2 = 0;
  if (comp.comp_land_m2 > 0 && precio_neto_stdev > 0) {
    terreno_stdev_m2 = r2(precio_neto_stdev / comp.comp_land_m2);
  }

  let dias_mercado: number | undefined;
  if (comp.comp_pub_date) {
    const pub = new Date(comp.comp_pub_date);
    const now = new Date();
    dias_mercado = Math.floor((now.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    ...comp,
    precio_venta_uf,
    pct_vida: r2(pctVida),
    FK_RH,
    costo_dep_uf_m2,
    costo_total_uf,
    precio_neto_uf,
    terreno_uf_m2,
    precio_stdev_uf,
    precio_neto_stdev,
    terreno_stdev_m2,
    dias_mercado,
  };
}

// ── DEPTO comparable processing ───────────────────────────────────────────────

export function processComparableDepto(
  comp: ComparableDepto,
  params: MarketParams
): ComparableDepto {
  if (!comp.active || !comp.comp_price_pub_uf) return comp;

  const { parking_uf_depto, storage_uf, terrace_weight_depto_area } = params;

  const precio_venta_uf = r2(comp.comp_price_pub_uf * (comp.comp_factor_estado - 0.05));
  const m2_total_comp = r2(comp.comp_util_m2 + comp.comp_terrace_m2 * terrace_weight_depto_area);
  const precio_neto_uf = r2(
    precio_venta_uf - comp.comp_parking * parking_uf_depto - comp.comp_storage * storage_uf
  );

  let valor_nominal_uf_m2 = 0;
  if (comp.comp_price_pub_uf > 0 && m2_total_comp > 0) {
    valor_nominal_uf_m2 = r2(precio_neto_uf / m2_total_comp);
  }

  let valor_ajustado_uf_m2 = 0;
  if (valor_nominal_uf_m2 > 0) {
    valor_ajustado_uf_m2 = r2(
      valor_nominal_uf_m2 * comp.comp_factor_estado * comp.comp_factor_orient * comp.comp_factor_antipub
    );
  }

  let dias_mercado: number | undefined;
  if (comp.comp_pub_date) {
    const pub = new Date(comp.comp_pub_date);
    const now = new Date();
    dias_mercado = Math.floor((now.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    ...comp,
    precio_venta_uf,
    m2_total_comp,
    precio_neto_uf,
    valor_nominal_uf_m2,
    valor_ajustado_uf_m2,
    dias_mercado,
  };
}

// ── REP ───────────────────────────────────────────────────────────────────────

export function calcREP(
  subject: SubjectCasa,
  comparables: ComparableCasa[],
  params: MarketParams
): REPResult {
  const { uf_value_clp, parking_uf_casa, storage_uf, terrace_weight_casa_area,
    construction_cost_rep, additional_cost } = params;

  const activos = comparables.filter(c => c.active && (c.terreno_uf_m2 ?? 0) > 0);
  const last4 = activos.slice(-4);

  const vt_MAX = last4.length > 0
    ? r2(last4.reduce((s, c) => s + (c.terreno_uf_m2 ?? 0), 0) / last4.length)
    : 0;
  const vt_MIN = r2(vt_MAX * 0.95);
  const vt_PROM = r2((vt_MAX + vt_MIN) / 2);

  const m2_c = (subject.usable_area_m2 ?? 0) +
    (subject.terrace_area_m2 ?? 0) * terrace_weight_casa_area +
    (subject.loggia_area_m2 ?? 0);
  const m2_t = subject.land_area_m2 ?? 0;
  const m2_ad1 = subject.adicional_1_m2 ?? 0;
  const m2_ad2 = subject.adicional_2_m2 ?? 0;

  const makeScenario = (vt: number, ccFactor: number): ScenarioResult => {
    const terreno_uf = r2(m2_t * vt);
    const construc_uf = r2(m2_c * construction_cost_rep * ccFactor);
    const adic1_uf = r2(m2_ad1 * additional_cost);
    const adic2_uf = r2(m2_ad2 * additional_cost);
    const total_uf = r2(terreno_uf + construc_uf + adic1_uf + adic2_uf);
    return { terreno_uf, construc_uf, adic1_uf, adic2_uf, total_uf, total_clp: toClp(total_uf, uf_value_clp) };
  };

  const MAX = makeScenario(vt_MAX, 1);
  const MIN = makeScenario(vt_MIN, 0.95);
  const PROM: ScenarioResult = {
    terreno_uf: r2((MAX.terreno_uf + MIN.terreno_uf) / 2),
    construc_uf: r2((MAX.construc_uf + MIN.construc_uf) / 2),
    adic1_uf: MAX.adic1_uf,
    adic2_uf: MAX.adic2_uf,
    total_uf: r2((MAX.total_uf + MIN.total_uf) / 2),
    total_clp: toClp(r2((MAX.total_uf + MIN.total_uf) / 2), uf_value_clp),
  };

  // Not needed for REP but included for compatibility
  void parking_uf_casa; void storage_uf;

  return { MAX, MIN, PROM, vt_MAX, vt_MIN, vt_PROM };
}

// ── STDEV ─────────────────────────────────────────────────────────────────────

export function calcSTDEV(
  subject: SubjectCasa,
  comparables: ComparableCasa[],
  params: MarketParams
): STDEVResult {
  const { uf_value_clp, terrace_weight_casa_area, construction_cost_stdev, additional_cost } = params;

  const activos = comparables.filter(c => c.active && (c.terreno_stdev_m2 ?? 0) > 0);
  const last3 = activos.slice(-3);
  const vals = last3.map(c => c.terreno_stdev_m2 ?? 0);

  if (vals.length < 2) {
    throw new Error('Se requieren al menos 2 comparables activos para el Método Estadístico.');
  }

  const sorted = [...vals].sort((a, b) => a - b);
  const n = sorted.length;
  const mediana = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const mean = vals.reduce((s, v) => s + v, 0) / n;
  const desv = r2(Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1)));

  const intervalo_MAX = r2(mediana + desv);
  const intervalo_MIN = r2(mediana - desv);

  const m2_c = (subject.usable_area_m2 ?? 0) +
    (subject.terrace_area_m2 ?? 0) * terrace_weight_casa_area +
    (subject.loggia_area_m2 ?? 0);
  const m2_t = subject.land_area_m2 ?? 0;
  const m2_ad1 = subject.adicional_1_m2 ?? 0;
  const m2_ad2 = subject.adicional_2_m2 ?? 0;

  const makeScenario = (vt: number, ccFactor: number): ScenarioResult => {
    const terreno_uf = r2(m2_t * vt);
    const construc_uf = r2(m2_c * construction_cost_stdev * ccFactor);
    const adic1_uf = r2(m2_ad1 * additional_cost);
    const adic2_uf = r2(m2_ad2 * additional_cost);
    const total_uf = r2(terreno_uf + construc_uf + adic1_uf + adic2_uf);
    return { terreno_uf, construc_uf, adic1_uf, adic2_uf, total_uf, total_clp: toClp(total_uf, uf_value_clp) };
  };

  const MAX = makeScenario(intervalo_MAX, 1);
  const MIN = makeScenario(intervalo_MIN, 0.95);
  const PROM: ScenarioResult = {
    terreno_uf: r2((MAX.terreno_uf + MIN.terreno_uf) / 2),
    construc_uf: r2((MAX.construc_uf + MIN.construc_uf) / 2),
    adic1_uf: MAX.adic1_uf,
    adic2_uf: MAX.adic2_uf,
    total_uf: r2((MAX.total_uf + MIN.total_uf) / 2),
    total_clp: toClp(r2((MAX.total_uf + MIN.total_uf) / 2), uf_value_clp),
  };

  return { MAX, MIN, PROM, mediana: r2(mediana), desv, intervalo_MAX, intervalo_MIN };
}

// ── MEDIA ─────────────────────────────────────────────────────────────────────

export function calcMEDIA(
  rep: REPResult,
  stdev: STDEVResult,
  subject: SubjectCasa,
  params: MarketParams
): MEDIAResult {
  const { uf_value_clp, terrace_weight_casa_area, construction_cost_rep, construction_cost_stdev, additional_cost } = params;

  const m2_c = (subject.usable_area_m2 ?? 0) +
    (subject.terrace_area_m2 ?? 0) * terrace_weight_casa_area +
    (subject.loggia_area_m2 ?? 0);
  const m2_t = subject.land_area_m2 ?? 0;
  const m2_ad1 = subject.adicional_1_m2 ?? 0;
  const m2_ad2 = subject.adicional_2_m2 ?? 0;

  const makeScenario = (vtRep: number, vtStdev: number, ccRep: number, ccStdev: number, ccFactor: number): ScenarioResult => {
    const vt = r2((vtRep + vtStdev) / 2);
    const cc = r2((ccRep + ccStdev) / 2);
    const terreno_uf = r2(m2_t * vt);
    const construc_uf = r2(m2_c * cc * ccFactor);
    const adic1_uf = r2(m2_ad1 * additional_cost);
    const adic2_uf = r2(m2_ad2 * additional_cost);
    const total_uf = r2(terreno_uf + construc_uf + adic1_uf + adic2_uf);
    return { terreno_uf, construc_uf, adic1_uf, adic2_uf, total_uf, total_clp: toClp(total_uf, uf_value_clp) };
  };

  const MAX = makeScenario(rep.vt_MAX, stdev.intervalo_MAX, construction_cost_rep, construction_cost_stdev, 1);
  const MIN = makeScenario(rep.vt_MIN, stdev.intervalo_MIN, construction_cost_rep, construction_cost_stdev, 0.95);
  const PROM: ScenarioResult = {
    terreno_uf: r2((MAX.terreno_uf + MIN.terreno_uf) / 2),
    construc_uf: r2((MAX.construc_uf + MIN.construc_uf) / 2),
    adic1_uf: MAX.adic1_uf,
    adic2_uf: MAX.adic2_uf,
    total_uf: r2((MAX.total_uf + MIN.total_uf) / 2),
    total_clp: toClp(r2((MAX.total_uf + MIN.total_uf) / 2), uf_value_clp),
  };

  return { MAX, MIN, PROM };
}

// ── COMP ──────────────────────────────────────────────────────────────────────

export function calcCOMP(
  subject: SubjectDepto,
  comparables: ComparableDepto[],
  params: MarketParams
): COMPResult {
  const { uf_value_clp, parking_uf_depto, storage_uf, terrace_price_weight_depto } = params;

  const activos = comparables.filter(c => c.active && (c.valor_ajustado_uf_m2 ?? 0) > 0);
  if (activos.length < 3) {
    throw new Error('Se requieren al menos 3 comparables activos para la Competencia Directa.');
  }

  const uf_m2_promedio = r2(activos.reduce((s, c) => s + (c.valor_ajustado_uf_m2 ?? 0), 0) / activos.length);
  const cdActivos = activos.slice(-3);
  const cd_uf_m2 = r2(cdActivos.reduce((s, c) => s + (c.valor_ajustado_uf_m2 ?? 0), 0) / cdActivos.length);

  const fe = subject.subject_factor_estado;
  const fo = subject.subject_factor_orient;
  const ff = subject.subject_factor_franja;

  if (!fe || !fo || !ff || isNaN(fe) || isNaN(fo) || isNaN(ff)) {
    throw new Error('Debe completar los factores del sujeto (estado, orientación y franja de valor).');
  }

  const makeMAX = (): DeptoScenarioResult => {
    const uf_m2_util = r2(cd_uf_m2 * fe * fo);
    const uf_m2_terraza = r2(uf_m2_util * terrace_price_weight_depto);
    const util_uf = r2((subject.usable_area_m2 ?? 0) * uf_m2_util);
    const terraza_uf = r2((subject.terrace_area_m2 ?? 0) * uf_m2_terraza);
    const est_uf = r2((subject.parking_spaces ?? 0) * parking_uf_depto);
    const bod_uf = r2((subject.storage_units ?? 0) * storage_uf);
    const total_uf = r2(util_uf + terraza_uf + est_uf + bod_uf);
    return { util_uf, terraza_uf, est_uf, bod_uf, total_uf, total_clp: toClp(total_uf, uf_value_clp), uf_m2_util, uf_m2_terraza };
  };

  const makeMIN = (): DeptoScenarioResult => {
    const uf_m2_util = r2(cd_uf_m2 * fe * ff);
    const uf_m2_terraza = r2(uf_m2_util * terrace_price_weight_depto);
    const util_uf = r2((subject.usable_area_m2 ?? 0) * uf_m2_util);
    const terraza_uf = r2((subject.terrace_area_m2 ?? 0) * uf_m2_terraza);
    const est_uf = r2((subject.parking_spaces ?? 0) * parking_uf_depto * ff);
    const bod_uf = r2((subject.storage_units ?? 0) * storage_uf * ff);
    const total_uf = r2(util_uf + terraza_uf + est_uf + bod_uf);
    return { util_uf, terraza_uf, est_uf, bod_uf, total_uf, total_clp: toClp(total_uf, uf_value_clp), uf_m2_util, uf_m2_terraza };
  };

  const MAX = makeMAX();
  const MIN = makeMIN();
  const total_uf_prom = r2((MAX.total_uf + MIN.total_uf) / 2);
  const PROM: DeptoScenarioResult = {
    util_uf: r2((MAX.util_uf + MIN.util_uf) / 2),
    terraza_uf: r2((MAX.terraza_uf + MIN.terraza_uf) / 2),
    est_uf: r2((MAX.est_uf + MIN.est_uf) / 2),
    bod_uf: r2((MAX.bod_uf + MIN.bod_uf) / 2),
    total_uf: total_uf_prom,
    total_clp: toClp(total_uf_prom, uf_value_clp),
    uf_m2_util: r2((MAX.uf_m2_util + MIN.uf_m2_util) / 2),
    uf_m2_terraza: r2((MAX.uf_m2_terraza + MIN.uf_m2_terraza) / 2),
  };

  return { MAX, MIN, PROM, cd_uf_m2, uf_m2_promedio };
}

// ── Arriendos ─────────────────────────────────────────────────────────────────

export function calcArriendoResult(
  analysis: ArriendoAnalysis,
  uf_value_clp: number | null
): ArriendoResult {
  const comparables: ComparableArriendo[] = analysis.comparables.map(comp => {
    let arriendo_clp: number | undefined;
    if (comp.moneda === 'UF') {
      if (!uf_value_clp) {
        throw new Error('Se requiere el valor UF del día para homologar comparables en UF.');
      }
      arriendo_clp = r2(comp.arriendo_publicado * uf_value_clp);
    } else {
      arriendo_clp = comp.arriendo_publicado;
    }
    return { ...comp, arriendo_clp };
  });

  const validComps = comparables.filter(c => (c.arriendo_clp ?? 0) > 0);
  if (validComps.length < 3) {
    throw new Error('Se requieren al menos 3 comparables de arriendo con valores válidos.');
  }

  const arriendo_promedio_clp = r2(
    validComps.reduce((s, c) => s + (c.arriendo_clp ?? 0), 0) / validComps.length
  );
  const arriendo_promedio_uf = uf_value_clp ? r2(arriendo_promedio_clp / uf_value_clp) : null;
  const valor_propiedad_clp =
    uf_value_clp && analysis.valor_propiedad_uf > 0
      ? r2(analysis.valor_propiedad_uf * uf_value_clp)
      : null;

  const gastos_anuales_clp = r2(arriendo_promedio_clp * 12 * 0.10);

  const scenarios: VacanciaScenarionResult[] = ([1, 2, 3] as VacanciaMeses[]).map(meses => {
    const meses_ocupados = 12 - meses;
    const ingresos_anuales_clp = r2(arriendo_promedio_clp * meses_ocupados);
    const ingreso_neto_anual_clp = r2(ingresos_anuales_clp - gastos_anuales_clp);
    const cap_rate = valor_propiedad_clp && valor_propiedad_clp > 0
      ? r2((arriendo_promedio_clp / valor_propiedad_clp) * meses_ocupados * 0.90 * 100)
      : 0;
    return {
      meses,
      arriendo_neto_mensual_clp: arriendo_promedio_clp,
      ingresos_anuales_clp,
      gastos_anuales_clp,
      ingreso_neto_anual_clp,
      cap_rate,
    };
  });

  return {
    arriendo_promedio_clp,
    arriendo_promedio_uf,
    valor_propiedad_clp,
    scenarios,
    selected_meses: analysis.vacancia_meses,
    comparables,
  };
}

// ── Orchestrators ─────────────────────────────────────────────────────────────

export function runCasaValuation(
  subject: SubjectCasa,
  comparables: ComparableCasa[],
  params: MarketParams
): CasaValuationResult {
  const currentYear = new Date().getFullYear();
  const processed = comparables.map(c => processComparableCasa(c, params, currentYear));
  const REP = calcREP(subject, processed, params);
  const STDEV = calcSTDEV(subject, processed, params);
  const MEDIA = calcMEDIA(REP, STDEV, subject, params);
  return { property_type: 'CASA', REP, STDEV, MEDIA, comparables: processed };
}

export function runDeptoValuation(
  subject: SubjectDepto,
  comparables: ComparableDepto[],
  params: MarketParams
): DeptoValuationResult {
  const processed = comparables.map(c => processComparableDepto(c, params));
  const COMP = calcCOMP(subject, processed, params);
  return { property_type: 'DEPTO', COMP, comparables: processed };
}
