import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Calculator, Home, TrendingUp, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
{ icon: Calculator, title: 'Evaluación completa', desc: 'Calcula tu capacidad de pago y endeudamiento según políticas bancarias chilenas.' },
{ icon: TrendingUp, title: 'Valor máximo de propiedad', desc: 'Descubre el precio máximo al que puedes optar, solo o con co-solicitante.' },
{ icon: Shield, title: 'Doble moneda', desc: 'Resultados en CLP y UF con conversión automática desde fuentes oficiales.' }];


const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="perfilamiento-scope min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-accent" />
            <span className="font-serif text-xl text-foreground">Perfilamiento Compradores Viveprop</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-16 md:py-24 text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground leading-tight">
            ¿Puedes comprar tu&nbsp;próxima propiedad?
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Evalúa tu capacidad de financiamiento hipotecario o analiza una propiedad específica en minutos.
          </p>
        </section>

        {/* Two function cards */}
        <section className="container pb-12">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent/40" onClick={() => navigate('/perfilamiento/evaluacion')}>
              <Calculator className="h-12 w-12 text-accent mb-4" />
              <h2 className="font-serif text-2xl text-foreground mb-2">Evaluación financiera</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Perfila tu capacidad financiera general para comprar una propiedad con financiamiento hipotecario. Descubre el valor máximo al que puedes optar.
              </p>
              <Button className="mt-auto">Iniciar evaluación</Button>
            </Card>

            <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent/40" onClick={() => navigate('/perfilamiento/propiedad')}>
              <Home className="h-12 w-12 text-accent mb-4" />
              <h2 className="font-serif text-2xl text-foreground mb-2">Evaluar propiedad específica</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ya tienes una propiedad identificada. Evalúa si puedes financiarla considerando bono pie, descuentos, y tu situación financiera.
              </p>
              <Button variant="outline" className="mt-auto">Evaluar propiedad</Button>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((f) =>
            <div key={f.title} className="bg-card rounded-lg border p-6 animate-fade-in">
                <f.icon className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-serif text-lg mb-1 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">Perfilamiento Compradores Viveprop — Herramienta referencial. No constituye una oferta de crédito.

      </footer>
    </div>);

};

export default Index;