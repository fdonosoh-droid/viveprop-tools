● Aca va la paleta completa. Los colores de marca son 4:                                                               
                                                                                                                       
  ┌─────────┬─────────┬───────────────────────┐                                                                        
  │  Color  │   Hex   │          Rol          │                                                                        
  ├─────────┼─────────┼───────────────────────┤                                                                        
  │ Indigo  │ #3B3B98 │ Primary / Sidebar     │                                                                        
  ├─────────┼─────────┼───────────────────────┤                                                                        
  │ Coral   │ #FD5968 │ Secondary / Error     │                                                                        
  ├─────────┼─────────┼───────────────────────┤
  │ Magenta │ #FF006D │ Accent principal      │
  ├─────────┼─────────┼───────────────────────┤
  │ Sky     │ #70A0FE │ Info / Complementario │
  └─────────┴─────────┴───────────────────────┘

  Y el sistema de temas completo con las CSS variables:

  Dataprop Light (default)

  ┌──────────────────┬───────────────────────┬────────────────────┐
  │      Token       │         Valor         │        Uso         │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --bg-base        │ #FFFFFF               │ Fondo principal    │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --bg-surface     │ #F8F9FC               │ Cards, panels      │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --bg-elevated    │ #FFFFFF               │ Inputs, elevated   │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --bg-hover       │ rgba(59,59,152, 0.04) │ Hover states       │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --bg-sidebar     │ #3B3B98               │ Sidebar fondo      │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --border-default │ #E2E4EB               │ Bordes normales    │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --border-subtle  │ rgba(59,59,152, 0.12) │ Bordes sutiles     │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --border-strong  │ #3B3B98               │ Bordes emphasis    │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --text-primary   │ #1A1A2E               │ Texto principal    │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --text-secondary │ #4A4A6A               │ Texto secundario   │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --text-muted     │ #8888A0               │ Texto atenuado     │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --text-inverse   │ #FFFFFF               │ Texto sobre accent │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --accent         │ #FF006D               │ Botones, links     │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --accent-hover   │ #E0005F               │ Hover de accent    │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --accent-muted   │ rgba(255,0,109, 0.12) │ Badges, tags       │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --secondary      │ #3B3B98               │ Indigo             │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --success        │ #10B981               │ OK                 │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --warning        │ #F59E0B               │ Warning            │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --error          │ #FD5968               │ Error              │
  ├──────────────────┼───────────────────────┼────────────────────┤
  │ --info           │ #70A0FE               │ Info               │
  └──────────────────┴───────────────────────┴────────────────────┘

  Clases Tailwind disponibles

  Fondos:     bg-base, bg-surface, bg-elevated, bg-hover, bg-sidebar, bg-accent, bg-accent-muted
  Texto:      text-primary, text-secondary, text-muted, text-inverse, text-accent
  Bordes:     border-default, border-subtle, border-strong
  Estados:    text-success, bg-success-muted, text-error, bg-error-muted, text-warning, bg-warning-muted
  Sidebar:    text-sidebar, text-sidebar-text-muted, text-sidebar-accent, bg-sidebar-hover

  Fonts

  --font-sans: 'Hind Vadodara', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  --font-mono: 'JetBrains Mono', ui-monospace, monospace

  El index.css completo esta en web/src/index.css -- tiene los 4 temas (light, dark, coral, blue) con todas las
  variables. Lo puedes copiar directo.