import { useState } from 'react';
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { COMUNAS_CHILE } from '@/lib/comunas';
import {
  MATERIAL_LABELS,
  STATE_LABELS,
  FACTOR_ESTADO_OPTIONS,
  FACTOR_ORIENT_OPTIONS,
} from '@/lib/types';
import type {
  PropertyType,
  SubjectCasa,
  SubjectDepto,
  MaterialType,
  ConservationState,
} from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialSubject = Record<string, any>;

interface SubjectStepProps {
  subject: PartialSubject;
  propertyType: PropertyType | null;
  onChange: (s: PartialSubject) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SubjectStep({ subject, propertyType, onChange, onNext, onBack }: SubjectStepProps) {
  const { toast } = useToast();
  const [comunaSearch, setComunaSearch] = useState('');
  const [showComunas, setShowComunas] = useState(false);

  const set = (key: string, value: unknown) => onChange({ ...subject, [key]: value });

  const filteredComunas = COMUNAS_CHILE.filter(c =>
    comunaSearch.length >= 2
      ? c.toLowerCase().includes(comunaSearch.toLowerCase())
      : true
  ).slice(0, 50);

  const handleNext = () => {
    if (propertyType === 'DEPTO') {
      if (!subject.usable_area_m2 || subject.usable_area_m2 <= 0) {
        toast({ title: 'Error', description: 'Ingrese los m² Útiles del inmueble.', variant: 'destructive' });
        return;
      }
      const fe = subject.subject_factor_estado as number | undefined;
      if (!fe || isNaN(fe)) {
        toast({ title: 'Error', description: 'Seleccione el Factor Estado/Antigüedad.', variant: 'destructive' });
        return;
      }
      const fo = subject.subject_factor_orient as number | undefined;
      if (!fo || isNaN(fo)) {
        toast({ title: 'Error', description: 'Seleccione el Factor Orientación/Vista.', variant: 'destructive' });
        return;
      }
      const ff = subject.subject_factor_franja as number | undefined;
      if (!ff || isNaN(ff)) {
        toast({ title: 'Error', description: 'Ingrese el Factor Franja de Valor.', variant: 'destructive' });
        return;
      }
    }
    onNext();
  };

  const numInput = (label: string, key: string, step = 1, required = false) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        type="number"
        step={step}
        value={(subject as Record<string, unknown>)[key] as number ?? ''}
        onChange={e => set(key, e.target.value === '' ? undefined : parseFloat(e.target.value))}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Datos del Inmueble</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ingrese la información del inmueble sujeto a tasación.
        </p>
      </div>

      {/* Identificación */}
      <div className="bg-card border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-navy border-b pb-2">Identificación</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Dirección<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              value={subject.address ?? ''}
              onChange={e => set('address', e.target.value)}
              placeholder="Ej: Av. Principal 123"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1 relative">
            <Label className="text-xs font-medium text-muted-foreground">
              Comuna<span className="text-destructive ml-0.5">*</span>
            </Label>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={subject.commune ?? comunaSearch}
                onChange={e => {
                  setComunaSearch(e.target.value);
                  set('commune', e.target.value);
                  setShowComunas(true);
                }}
                onFocus={() => setShowComunas(true)}
                placeholder="Buscar comuna..."
                className="h-8 text-sm pl-7"
              />
              {showComunas && comunaSearch.length >= 2 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredComunas.map(c => (
                    <button
                      key={c}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        set('commune', c);
                        setComunaSearch(c);
                        setShowComunas(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Cliente / Propietario</Label>
            <Input
              value={subject.client_name ?? ''}
              onChange={e => set('client_name', e.target.value)}
              placeholder="Nombre del cliente"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Rol SII</Label>
            <Input
              value={subject.sii_role ?? ''}
              onChange={e => set('sii_role', e.target.value)}
              placeholder="Ej: 1234-56"
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Superficies */}
      <div className="bg-card border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-navy border-b pb-2">Superficies y Características</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {numInput('m² Útiles', 'usable_area_m2', 0.01, true)}
          {numInput('m² Terraza', 'terrace_area_m2', 0.01)}
          {propertyType === 'CASA' && numInput('m² Loggia', 'loggia_area_m2', 0.01)}
          {propertyType === 'CASA' && numInput('m² Terreno', 'land_area_m2', 0.01, true)}
          {propertyType === 'CASA' && numInput('m² Adicional 1', 'adicional_1_m2', 0.01)}
          {propertyType === 'CASA' && numInput('m² Adicional 2', 'adicional_2_m2', 0.01)}
          {numInput('Dormitorios', 'bedrooms', 1)}
          {numInput('Baños', 'bathrooms', 0.5)}
          {numInput('Estacionamientos', 'parking_spaces', 1)}
          {numInput('Bodegas', 'storage_units', 1)}
          {numInput('Expectativa vendedor (UF)', 'seller_expectation_uf', 0.01)}
          {numInput('Avalúo fiscal (UF)', 'fiscal_appraisal_uf', 0.01)}
        </div>
      </div>

      {/* Casa construcción */}
      {propertyType === 'CASA' && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-navy border-b pb-2">Construcción</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {numInput('Año construcción', 'construction_year', 1, true)}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Material<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Select
                value={subject.material ?? ''}
                onValueChange={v => set('material', v as MaterialType)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MATERIAL_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Estado conservación<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Select
                value={subject.state ?? ''}
                onValueChange={v => set('state', v as ConservationState)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATE_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* DEPTO factores */}
      {propertyType === 'DEPTO' && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-navy border-b pb-2">Factores del Sujeto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Factor Estado/Antigüedad<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Select
                value={subject.subject_factor_estado?.toString() ?? ''}
                onValueChange={v => set('subject_factor_estado', parseFloat(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {FACTOR_ESTADO_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value.toString()} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Factor Orientación/Vista<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Select
                value={subject.subject_factor_orient?.toString() ?? ''}
                onValueChange={v => set('subject_factor_orient', parseFloat(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {FACTOR_ORIENT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value.toString()} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Factor Franja de Valor<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                min={0}
                max={1}
                placeholder="Ej: 0.96"
                value={subject.subject_factor_franja ?? ''}
                onChange={e => set('subject_factor_franja', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Observaciones y factores diferenciadores */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-navy border-b pb-2">Notas del Informe</h3>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Observaciones Legales</Label>
          <Textarea
            value={subject.observaciones_legales ?? ''}
            onChange={e => set('observaciones_legales', e.target.value)}
            placeholder="Ingrese observaciones legales relevantes..."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Factores Diferenciadores</Label>
          <Textarea
            value={subject.factores_diferenciadores ?? ''}
            onChange={e => set('factores_diferenciadores', e.target.value)}
            placeholder="Describa los factores diferenciadores de la propiedad..."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft size={16} />
          Atrás
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Comparables
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
