import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PropertyType } from '@/lib/types';

const STEPS = ['Tipo', 'Configuración', 'Inmueble', 'Comparables', 'Resultados', 'Arriendos', 'Informe'];

interface StepIndicatorProps {
  currentStep: number;
  propertyType: PropertyType | null;
  onReset: () => void;
}

export function StepIndicator({ currentStep, propertyType, onReset }: StepIndicatorProps) {
  if (currentStep === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Steps */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {STEPS.map((label, idx) => {
            const wizardIdx = idx; // step 0 = Tipo (idx 0)
            const isCompleted = currentStep > wizardIdx;
            const isActive = currentStep === wizardIdx;
            const isFuture = currentStep < wizardIdx;

            return (
              <div key={label} className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className={`step-circle ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : <span>{idx}</span>}
                  </div>
                  <span
                    className={`text-[9px] font-medium leading-none ${
                      isActive ? 'text-primary' : isFuture ? 'text-muted-foreground' : 'text-green-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-6 mb-3 rounded-full transition-colors ${
                      isCompleted ? 'bg-gold' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {propertyType && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
              {propertyType === 'CASA' ? '🏠 Casa' : '🏢 Depto'}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            Nueva Tasación
          </Button>
        </div>
      </div>
    </div>
  );
}
