import { House, Building2 } from 'lucide-react';
import type { PropertyType } from '@/lib/types';

interface PropertyTypeSelectorProps {
  onSelect: (type: PropertyType) => void;
}

export function PropertyTypeSelector({ onSelect }: PropertyTypeSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy/5 via-background to-primary/5 px-4">
      {/* Logo / Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Building2 size={22} className="text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-semibold text-navy">Viveprop</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-2 font-serif">
          Evaluaciones Comerciales
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Sistema de tasación y caso de negocio inmobiliario para Chile
        </p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          <span>🇨🇱</span>
          <span>Normativa Chilena · Tabla Ross-Heidecke · Método REP + Estadístico</span>
        </div>
      </div>

      {/* Type cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl animate-fade-in">
        <button
          onClick={() => onSelect('CASA')}
          className="type-card flex-1 border-primary/20 bg-card hover:border-primary hover:bg-primary/5 text-center group"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <House size={40} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy mb-1">Valorizar Casa</h2>
              <p className="text-sm text-muted-foreground">
                Método REP + Estadístico<br />
                Tabla Ross-Heidecke
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              ✓ Terreno · Construcción · Adicionales
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelect('DEPTO')}
          className="type-card flex-1 border-gold/20 bg-card hover:border-gold hover:bg-gold/5 text-center group"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <Building2 size={40} className="text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy mb-1">Valorizar Departamento</h2>
              <p className="text-sm text-muted-foreground">
                Método Competencia Directa<br />
                Factores de ajuste
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gold bg-gold/10 px-3 py-1 rounded-full">
              ✓ Sup. Útil · Terraza · Estac. · Bodega
            </span>
          </div>
        </button>
      </div>

      <p className="mt-8 text-xs text-muted-foreground animate-fade-in">
        100% client-side · Sin backend · Sin autenticación requerida
      </p>
    </div>
  );
}
