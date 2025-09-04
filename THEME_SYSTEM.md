# Sistemul de Teme Hibrid

## Prezentare Generală

Am implementat un sistem de teme hibrid care oferă utilizatorilor patru opțiuni de teme:
1. **Classic Light** - Tema clasică light
2. **Classic Dark** - Tema clasică dark
3. **Advanced Light** - Tema avansată light cu efecte glassmorphism
4. **Advanced Dark** - Tema avansată dark cu efecte glassmorphism

## Componente Implementate

### 1. ThemeContext
- Localizare: `ui/src/contexts/ThemeContext.tsx`
- Oferă contextul React pentru gestionarea temei în aplicație
- Salvează tema aleasă în localStorage pentru persistență
- Aplică tema la nivel de document

### 2. Fișiere de Stil
- `ui/src/styles/classic-theme.css` - Definiții pentru temele classic
- `ui/src/styles/advanced-theme.css` - Definiții pentru temele avansate cu efecte glassmorphism

### 3. ThemeSelector
- Localizare: `ui/src/components/ThemeSelector.tsx`
- Componenta UI pentru alegerea temei
- Integrată în SettingsDialog

## Funcționalități

### Persistență
Tema aleasă de utilizator este salvată în localStorage și restabilită la încărcarea aplicației.

### Compatibilitate
Toate componentele existente sunt compatibile cu noul sistem de teme.

### Tranziții
Sistemul suportă tranziții fluide între diferite teme.

## Utilizare

Utilizatorii pot schimba tema din secțiunea de setări a aplicației, unde vor găsi un combobox cu cele 4 opțiuni de teme disponibile.