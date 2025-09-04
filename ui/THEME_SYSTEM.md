# Sistemul Hibrid de Teme - Claude Code Router UI

## Prezentare Generală

Sistemul de teme al aplicației Claude Code Router UI oferă utilizatorilor **4 combinații complete**:
- **Classic Light** - Tema clasică pentru lumină
- **Classic Dark** - Tema clasică pentru întuneric  
- **Advanced Light** - Tema cu efecte pentru lumină
- **Advanced Dark** - Tema cu efecte pentru întuneric

## Arhitectura Sistemului

### 1. Context de Tema (ThemeContext.tsx)

```typescript
interface ThemeContextType {
  mode: 'light' | 'dark';
  variant: 'classic' | 'advanced';
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggleMode: () => void;
}
```

**Functionalități**:
- Persistența în localStorage pentru ambele setări
- Aplicarea automată a claselor CSS pe `documentElement`
- Data attributes pentru CSS specificity

### 2. Variabile CSS (index.css)

Sistemul folosește **CSS Custom Properties** organizate ierarhic:

```css
/* Structura claselor pentru fiecare combinație */
:root.theme-classic.light { /* Classic Light */ }
:root.theme-classic.dark  { /* Classic Dark */ }
:root.theme-advanced.light { /* Advanced Light */ }
:root.theme-advanced.dark  { /* Advanced Dark */ }
```

**Variabile definite pentru fiecare temă**:
- Variabile semantice shadcn/ui: `--background`, `--foreground`, `--card`, etc.
- Variabile dashboard: `--dashboard-bg`, `--glass-bg`, `--glass-border`, etc.
- Variabile advanced: `--glow-primary`, `--glow-accent`, `--transition-slow`, etc.

### 3. Stiluri Enhanced (advanced-theme.css)

Efectele speciale pentru tema Advanced includ:
- **Glass morphism effects** cu blur și transparență
- **Glow effects** pentru primary și accent colors
- **Shimmer animations** pentru stat cards
- **Smooth transitions** pentru toate elementele interactive
- **Enhanced hover states** cu transform și shadow

## Componente Suportate

### Componente Shadcn/UI (Semantic)
Toate componentele shadcn/ui folosesc automat variabilele semantice:
- Cards, Buttons, Inputs - `bg-card`, `text-foreground`
- Borders - `border-border`
- Muted elements - `text-muted-foreground`

### Componente Dashboard Custom
Componentele custom au fost refactorizate pentru consistență:

**OverviewTab.tsx** și **MissionControlTab.tsx**:
- `.glass-card` - Container principal cu glass effect
- `.stat-card` - Cards pentru statistici 
- `.service-status-card` - Cards pentru status servicii
- Culorile hardcoded înlocuite cu variabile semantice

### Componente Autor (Providers.tsx)
Componentele existente ale autorului folosesc deja sistemul corect și sunt compatibile.

## Utilizare

### Schimbarea Temei în Cod

```typescript
const { mode, variant, setMode, setVariant } = useTheme();

// Schimbă modul
setMode('dark'); // sau 'light'

// Schimbă varianta
setVariant('advanced'); // sau 'classic'
```

### CSS Custom Classes

Pentru componente noi, folosiți clasele semantice:

```jsx
// ✅ Corect - Folosește variabilele semantice
<div className="bg-card text-card-foreground border border-border">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ Incorect - Culori hardcoded
<div className="bg-gray-800 text-white border border-gray-600">
  <h2 className="text-white">Title</h2>
  <p className="text-gray-400">Description</p>
</div>
```

### Clasa Glass Effect (Advanced)

Pentru tema Advanced, folosiți clasa `.glass-card`:

```jsx
<div className="glass-card">
  {/* Conținut cu glass morphism effect */}
</div>
```

## Paleta de Culori

### Classic Light
- Background: `oklch(1 0 0)` (alb pur)
- Foreground: `oklch(0.145 0 0)` (negru închis)
- Primary: `oklch(0.205 0 0)` (gri închis)
- Accent: `oklch(0.97 0 0)` (gri deschis)

### Classic Dark  
- Background: `oklch(0.145 0 0)` (negru închis)
- Foreground: `oklch(0.985 0 0)` (alb aproape pur)
- Primary: `oklch(0.922 0 0)` (gri foarte deschis)
- Accent: `oklch(0.269 0 0)` (gri mediu)

### Advanced Light
- Background: `oklch(0.98 0.015 270)` (bleu foarte deschis)
- Primary: `oklch(0.6 0.2 260)` (violet-bleu saturat)
- Accent: `oklch(0.7 0.15 300)` (magenta soft)
- Glass effects cu blur și glow

### Advanced Dark
- Background: `oklch(0.08 0.05 280)` (bleu foarte închis)
- Primary: `oklch(0.7 0.25 280)` (violet-bleu luminos)
- Accent: `oklch(0.75 0.2 320)` (magenta luminos)
- Enhanced glow effects

## Fallback și Compatibilitate

Sistemul include fallback complet:
```css
:root:not(.theme-classic):not(.theme-advanced),
:root.theme-classic:not(.light):not(.dark) {
  /* Aplicarea Classic Light ca fallback */
}
```

## Testare

Pentru testarea tuturor combinațiilor:

1. **Classic Light**: Tema default, business-friendly
2. **Classic Dark**: Pentru utilizare nocturnă, ochi obosiți
3. **Advanced Light**: Experiență vizuală îmbunătățită în timpul zilei
4. **Advanced Dark**: Experiență premium pentru utilizare nocturnă

## Best Practices

### Pentru Dezvoltatori

1. **Folosiți întotdeauna variabile semantice**: `text-foreground` în loc de `text-white`
2. **Testați în toate cele 4 teme** înainte de commit
3. **Nu folosiți culori hardcoded** în componente noi
4. **Preferiți clasele Tailwind semantice**: `bg-card`, `border-border`

### Pentru Designeri

1. **Classic** = Professional, minimal, accessibility-first
2. **Advanced** = Modern, interactive, visual effects
3. **Light** = Productivity, daytime usage
4. **Dark** = Comfort, nighttime usage

## Implementare Tehnică

### Clasa Aplicată pe Document
```javascript
// În ThemeContext.tsx
document.documentElement.classList.add(mode);          // 'light' sau 'dark'
document.documentElement.classList.add(`theme-${variant}`); // 'theme-classic' sau 'theme-advanced'
```

### CSS Selector Specificity
```css
/* Specificitate maximă pentru override-uri */
:root.theme-advanced.dark .glass-card {
  /* Stiluri specifice pentru Advanced Dark */
}
```

## Concluzie

Sistemul hibrid de teme oferă:
- ✅ **Flexibilitate completă** - 4 combinații distincte
- ✅ **Consistență** - Toate componentele respectă același sistem
- ✅ **Extensibilitate** - Ușor de adăugat noi variante
- ✅ **Performance** - CSS variables pentru re-rendering optimizat
- ✅ **Accessibility** - Contrastul corect în toate modurile
- ✅ **Developer Experience** - API simplu și intuitiv

Sistemul permite utilizatorilor să aleagă experiența vizuală perfectă pentru necesitățile lor, oferind în același timp dezvoltatorilor un framework robust și ușor de întreținut.