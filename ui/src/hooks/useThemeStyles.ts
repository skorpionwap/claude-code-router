import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook pentru stilizarea bazată pe temă
 * Returnează clase CSS appropriate pentru tema selectată
 */
export const useThemeStyles = () => {
  const { theme } = useTheme();
  const isAdvanced = theme.variant === 'advanced';
  
  return {
    // Card styling
    card: isAdvanced 
      ? 'component-card' 
      : 'modern-card flex h-full flex-col',
    
    // Header styling
    header: isAdvanced 
      ? 'component-header' 
      : 'modern-header',
    
    // Title styling
    title: isAdvanced 
      ? 'component-title' 
      : 'text-lg font-semibold text-card-foreground',
    
    // Content area styling
    content: isAdvanced 
      ? 'component-content' 
      : 'p-6 flex-1 overflow-auto',
    
    // Input styling
    input: isAdvanced 
      ? 'glass-input' 
      : 'modern-input flex h-10 w-full',
    
    // Button styling
    button: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary') => {
      if (isAdvanced) {
        switch (variant) {
          case 'primary':
            return 'glass-button-primary';
          case 'secondary':
            return 'glass-button-secondary';
          default:
            return 'glass-button-secondary';
        }
      }
      // Modern classic theme button classes
      switch (variant) {
        case 'primary':
          return 'modern-button-primary inline-flex items-center justify-center';
        case 'secondary':
          return 'modern-button-secondary inline-flex items-center justify-center';
        case 'outline':
          return 'modern-button-secondary inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground';
        case 'ghost':
          return 'hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors';
        default:
          return 'modern-button-primary inline-flex items-center justify-center';
      }
    },
    
    // Badge styling
    badge: (status: 'success' | 'warning' | 'error' | 'default' = 'default') => {
      if (isAdvanced) {
        return `glass-badge ${status !== 'default' ? status : ''}`;
      }
      // Modern classic theme badge classes
      return `modern-badge ${status !== 'default' ? status : ''}`;
    },
    
    // Dialog styling
    dialog: isAdvanced 
      ? 'glass-dialog' 
      : 'bg-background border shadow-lg rounded-lg',
    
    // Dialog inline styles for advanced theme (to override any external styles)
    dialogStyle: isAdvanced 
      ? {
          background: 'rgba(70, 70, 100, 0.92)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          color: 'rgba(255, 255, 255, 0.95)'
        }
      : {},
    
    // Select/Combobox styling
    select: isAdvanced 
      ? 'glass-select' 
      : 'modern-input flex h-10 w-full items-center justify-between',
    
    // List item styling
    listItem: isAdvanced 
      ? 'glass-list-item' 
      : 'modern-list-item flex items-center justify-between',
    
    // Text styling
    text: {
      primary: isAdvanced 
        ? 'text-[--text-primary]' 
        : 'text-foreground',
      secondary: isAdvanced 
        ? 'text-[--text-secondary]' 
        : 'text-muted-foreground',
      muted: isAdvanced 
        ? 'text-[--text-secondary] opacity-70' 
        : 'text-muted-foreground',
    },
    
    // Helper pentru a determina dacă este tema advanced
    isAdvanced,
    
    // Clase combinate pentru cazuri frecvente
    cardWithHeader: isAdvanced 
      ? 'component-card' 
      : 'modern-card flex h-full flex-col',
    
    // Spacing pentru tema advanced și modern classic
    spacing: {
      card: isAdvanced ? 'p-0' : 'p-0', // Modern cards handle their own padding
      header: isAdvanced ? 'px-5 py-4' : 'p-0', // Modern headers handle their own padding
      content: isAdvanced ? 'px-5 py-4' : 'p-0', // Modern content handles its own padding
    }
  };
};

export type ThemeStyles = ReturnType<typeof useThemeStyles>;