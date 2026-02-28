export type PropertyType = 'CASA' | 'DEPTO';

export type ConservationState = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type MaterialType =
  | 'acero'
  | 'hormigon'
  | 'albanileria_ladrillo_armada'
  | 'albanileria_ladrillo_simple'
  | 'albanileria_bloque'
  | 'madera'
  | 'steel_frame'
  | 'adobe'
  | 'prefabricado';

export const MATERIAL_VIDA_UTIL: Record<MaterialType, number> = {
  acero: 100,
  hormigon: 80,
  albanileria_ladrillo_armada: 80,
  albanileria_ladrillo_simple: 60,
  albanileria_bloque: 60,
  madera: 50,
  steel_frame: 50,
  adobe: 40,
  prefabricado: 40,
};

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  acero: 'Acero / Estructura metálica',
  hormigon: 'Hormigón armado',
  albanileria_ladrillo_armada: 'Albañilería ladrillo armada/reforzada',
  albanileria_ladrillo_simple: 'Albañilería ladrillo simple',
  albanileria_bloque: 'Albañilería bloque de cemento',
  madera: 'Madera (estructura)',
  steel_frame: 'Perfiles livianos / steel frame',
  adobe: 'Adobe',
  prefabricado: 'Prefabricado (hormigón / EPS)',
};

export const STATE_LABELS: Record<ConservationState, string> = {
  A: 'A — Excelente / Óptimo',
  B: 'B — Muy Bueno',
  C: 'C — Bueno',
  D: 'D — Regular',
  E: 'E — Deficiente',
  F: 'F — Malo',
  G: 'G — Muy Malo',
  H: 'H — Demolición',
};

export interface MarketParams {
  uf_value_clp: number | null;
  negotiation_factor: number;
  parking_uf_casa: number;
  parking_uf_depto: number;
  storage_uf: number;
  terrace_weight_casa_area: number;
  terrace_weight_depto_area: number;
  terrace_price_weight_depto: number;
  construction_cost_rep: number;
  construction_cost_stdev: number;
  additional_cost: number;
  stdev_factor_adj: number;
}

export const DEFAULT_PARAMS: MarketParams = {
  uf_value_clp: null,
  negotiation_factor: 0.95,
  parking_uf_casa: 450,
  parking_uf_depto: 400,
  storage_uf: 70,
  terrace_weight_casa_area: 0.70,
  terrace_weight_depto_area: 0.50,
  terrace_price_weight_depto: 0.70,
  construction_cost_rep: 4.94,
  construction_cost_stdev: 24.00,
  additional_cost: 3.40,
  stdev_factor_adj: 0.05,
};

interface SubjectCommon {
  client_name: string;
  address: string;
  commune: string;
  sii_role: string;
  property_type: PropertyType;
  usable_area_m2: number;
  terrace_area_m2: number;
  parking_spaces: number;
  storage_units: number;
  fiscal_appraisal_uf: number;
  bedrooms: number;
  bathrooms: number;
  seller_expectation_uf: number;
  observaciones_legales?: string;
  factores_diferenciadores?: string;
}

export interface SubjectCasa extends SubjectCommon {
  property_type: 'CASA';
  land_area_m2: number;
  loggia_area_m2: number;
  adicional_1_m2: number;
  adicional_2_m2: number;
  construction_year: number;
  material: MaterialType;
  state: ConservationState;
}

export interface SubjectDepto extends SubjectCommon {
  property_type: 'DEPTO';
  subject_factor_estado: number;
  subject_factor_orient: number;
  subject_factor_franja: number;
}

export type Subject = SubjectCasa | SubjectDepto;

export interface ComparableCasa {
  id: number;
  active: boolean;
  comp_price_pub_uf: number;
  comp_land_m2: number;
  comp_built_m2: number;
  comp_year: number;
  comp_material: MaterialType;
  comp_state: ConservationState;
  comp_cost_uf_m2: number;
  comp_parking: number;
  comp_storage: number;
  comp_pub_date: string;
  comp_portal: string;
  // Calculated
  precio_venta_uf?: number;
  pct_vida?: number;
  FK_RH?: number;
  costo_dep_uf_m2?: number;
  costo_total_uf?: number;
  precio_neto_uf?: number;
  terreno_uf_m2?: number;
  precio_stdev_uf?: number;
  precio_neto_stdev?: number;
  terreno_stdev_m2?: number;
  dias_mercado?: number;
}

export interface ComparableDepto {
  id: number;
  active: boolean;
  comp_price_pub_uf: number;
  comp_util_m2: number;
  comp_terrace_m2: number;
  comp_factor_estado: number;
  comp_factor_orient: number;
  comp_factor_antipub: number;
  comp_parking: number;
  comp_storage: number;
  comp_pub_date: string;
  comp_portal: string;
  // Calculated
  precio_venta_uf?: number;
  m2_total_comp?: number;
  precio_neto_uf?: number;
  valor_nominal_uf_m2?: number;
  valor_ajustado_uf_m2?: number;
  dias_mercado?: number;
}

export interface ScenarioResult {
  terreno_uf: number;
  construc_uf: number;
  adic1_uf: number;
  adic2_uf: number;
  total_uf: number;
  total_clp: number | null;
}

export interface REPResult {
  MAX: ScenarioResult;
  MIN: ScenarioResult;
  PROM: ScenarioResult;
  vt_MAX: number;
  vt_MIN: number;
  vt_PROM: number;
}

export interface STDEVResult {
  MAX: ScenarioResult;
  MIN: ScenarioResult;
  PROM: ScenarioResult;
  mediana: number;
  desv: number;
  intervalo_MAX: number;
  intervalo_MIN: number;
}

export interface MEDIAResult {
  MAX: ScenarioResult;
  MIN: ScenarioResult;
  PROM: ScenarioResult;
}

export interface DeptoScenarioResult {
  util_uf: number;
  terraza_uf: number;
  est_uf: number;
  bod_uf: number;
  total_uf: number;
  total_clp: number | null;
  uf_m2_util: number;
  uf_m2_terraza: number;
}

export interface COMPResult {
  MAX: DeptoScenarioResult;
  MIN: DeptoScenarioResult;
  PROM: DeptoScenarioResult;
  cd_uf_m2: number;
  uf_m2_promedio: number;
}

export interface CasaValuationResult {
  property_type: 'CASA';
  REP: REPResult;
  STDEV: STDEVResult;
  MEDIA: MEDIAResult;
  comparables: ComparableCasa[];
}

export interface DeptoValuationResult {
  property_type: 'DEPTO';
  COMP: COMPResult;
  comparables: ComparableDepto[];
}

export type ValuationResult = CasaValuationResult | DeptoValuationResult;

export type MonedaArriendo = 'CLP' | 'UF';
export type VacanciaMeses = 1 | 2 | 3;

export interface ComparableArriendo {
  id: number;
  referencia: string;
  util_m2: number;
  arriendo_publicado: number;
  moneda: MonedaArriendo;
  arriendo_clp?: number;
}

export interface ArriendoAnalysis {
  comparables: ComparableArriendo[];
  valor_propiedad_uf: number;
  vacancia_meses: VacanciaMeses;
}

export interface VacanciaScenarionResult {
  meses: VacanciaMeses;
  arriendo_neto_mensual_clp: number;
  ingresos_anuales_clp: number;
  gastos_anuales_clp: number;
  ingreso_neto_anual_clp: number;
  cap_rate: number;
}

export interface ArriendoResult {
  arriendo_promedio_clp: number;
  arriendo_promedio_uf: number | null;
  valor_propiedad_clp: number | null;
  scenarios: VacanciaScenarionResult[];
  selected_meses: VacanciaMeses;
  comparables: ComparableArriendo[];
}

export function createEmptyArriendoAnalysis(): ArriendoAnalysis {
  return {
    comparables: [
      { id: 1, referencia: '', util_m2: 0, arriendo_publicado: 0, moneda: 'CLP' },
      { id: 2, referencia: '', util_m2: 0, arriendo_publicado: 0, moneda: 'CLP' },
      { id: 3, referencia: '', util_m2: 0, arriendo_publicado: 0, moneda: 'CLP' },
    ],
    valor_propiedad_uf: 0,
    vacancia_meses: 1,
  };
}

export const FACTOR_ESTADO_OPTIONS = Array.from({ length: 81 }, (_, i) => ({
  value: Math.round((1.00 - i * 0.01) * 100) / 100,
  label: `${i} años → ${(1.00 - i * 0.01).toFixed(2)}`,
}));

export const FACTOR_ORIENT_OPTIONS = [
  { value: 1.10, label: '0 — Excepcional (1.10)' },
  { value: 1.08, label: '1 — Muy buena (1.08)' },
  { value: 1.06, label: '2 — Buena (1.06)' },
  { value: 1.04, label: '3 — Favorable (1.04)' },
  { value: 1.02, label: '4 — Sobre promedio (1.02)' },
  { value: 1.00, label: '5 — Promedio (1.00)' },
  { value: 0.98, label: '6 — Bajo promedio (0.98)' },
  { value: 0.96, label: '7 — Desfavorable (0.96)' },
  { value: 0.94, label: '8 — Mala (0.94)' },
  { value: 0.92, label: '9 — Obstruida (0.92)' },
  { value: 0.90, label: '10 — Muy desfavorable (0.90)' },
];

export const FACTOR_ANTIPUB_OPTIONS = [
  { value: 1.00, label: '0 — < 1 mes (1.00)' },
  { value: 0.98, label: '1 — 1-2 meses (0.98)' },
  { value: 0.96, label: '2 — 2-4 meses (0.96)' },
  { value: 0.94, label: '3 — 4-6 meses (0.94)' },
  { value: 0.92, label: '4 — 6-9 meses (0.92)' },
  { value: 0.90, label: '5 — 9-12 meses (0.90)' },
  { value: 0.88, label: '6 — 12-18 meses (0.88)' },
  { value: 0.86, label: '7 — 18-24 meses (0.86)' },
  { value: 0.84, label: '8 — 24-36 meses (0.84)' },
  { value: 0.82, label: '9 — 36-48 meses (0.82)' },
  { value: 0.80, label: '10 — >48 meses (0.80)' },
];

export function createEmptyCasaComparables(): ComparableCasa[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    active: true,
    comp_price_pub_uf: 0,
    comp_land_m2: 0,
    comp_built_m2: 0,
    comp_year: 2000,
    comp_material: 'hormigon' as MaterialType,
    comp_state: 'C' as ConservationState,
    comp_cost_uf_m2: 0,
    comp_parking: 0,
    comp_storage: 0,
    comp_pub_date: '',
    comp_portal: '',
  }));
}

export function createEmptyDeptoComparables(): ComparableDepto[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    active: true,
    comp_price_pub_uf: 0,
    comp_util_m2: 0,
    comp_terrace_m2: 0,
    comp_factor_estado: 1.00,
    comp_factor_orient: 1.00,
    comp_factor_antipub: 1.00,
    comp_parking: 0,
    comp_storage: 0,
    comp_pub_date: '',
    comp_portal: '',
  }));
}
