/**
 * Layout Enhancer - Safe & Non-Destructive DOM Enhancement
 * Progressive enhancement that ONLY adds classes - never destroys content
 * Uses existing classes from layout-transformations.css
 */

export interface LayoutEnhancerConfig {
  enabled: boolean;
  enhanceNavigation: boolean;
  enhanceContainers: boolean;
  enhanceCards: boolean;
  addThemeClasses: boolean;
}

export class LayoutEnhancer {
  private isInitialized = false;
  private currentTheme: string = 'light';
  private config: LayoutEnhancerConfig;
  private observer: MutationObserver | null = null;

  constructor(config: Partial<LayoutEnhancerConfig> = {}) {
    this.config = {
      enabled: true,
      enhanceNavigation: true,
      enhanceContainers: true,
      enhanceCards: true,
      addThemeClasses: true,
      ...config
    };
  }

  /**
   * Initialize the layout enhancer safely
   */
  init(): void {
    if (this.isInitialized || !this.config.enabled) return;
    
    console.log('🎨 Layout Enhancer: Starting safe initialization...');
    
    try {
      // Detect current theme
      this.detectCurrentTheme();
      
      // Setup theme change observer
      this.setupThemeObserver();
      
      // Apply progressive enhancements
      this.applyProgressiveEnhancements();
      
      this.isInitialized = true;
      console.log('✅ Layout Enhancer: Ready and safe!');
    } catch (error) {
      console.error('❌ Layout Enhancer initialization failed:', error);
    }
  }

  /**
   * Detect current theme from DOM classes
   */
  private detectCurrentTheme(): void {
    const html = document.documentElement;
    
    if (html.classList.contains('theme-advanced')) {
      this.currentTheme = 'advanced';
    } else if (html.classList.contains('theme-dark')) {
      this.currentTheme = 'dark';
    } else {
      this.currentTheme = 'light';
    }
    
    console.log(`🎨 Current theme detected: ${this.currentTheme}`);
  }

  /**
   * Setup theme change observer
   */
  private setupThemeObserver(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const previousTheme = this.currentTheme;
          this.detectCurrentTheme();
          
          if (previousTheme !== this.currentTheme) {
            console.log(`🔄 Theme changed: ${previousTheme} → ${this.currentTheme}`);
            this.handleThemeChange();
          }
        }
      });
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  /**
   * Handle theme changes safely
   */
  private handleThemeChange(): void {
    // Re-apply all enhancements for new theme
    this.applyProgressiveEnhancements();
    
    // Trigger custom event for other components
    const event = new CustomEvent('layout-enhancer-theme-changed', {
      detail: { theme: this.currentTheme }
    });
    document.dispatchEvent(event);
  }

  /**
   * Apply all progressive enhancements safely
   */
  applyProgressiveEnhancements(): void {
    try {
      if (this.config.enhanceContainers) {
        this.enhanceMainContainers();
      }
      
      if (this.config.enhanceNavigation) {
        this.enhanceNavigation();
      }
      
      if (this.config.enhanceCards) {
        this.enhanceCards();
      }
      
      if (this.config.addThemeClasses) {
        this.addThemeSpecificClasses();
      }
      
      console.log(`✨ Progressive enhancements applied for ${this.currentTheme} theme`);
    } catch (error) {
      console.error('❌ Progressive enhancement failed:', error);
    }
  }

  /**
   * Enhance main containers - SAFE, only adds classes
   */
  private enhanceMainContainers(): void {
    // Enhance main app container
    const mainContainer = document.querySelector('.h-screen');
    if (mainContainer && !mainContainer.classList.contains('theme-enhanced')) {
      mainContainer.classList.add('theme-enhanced');
      
      // For advanced theme, make it centered
      if (this.currentTheme === 'advanced') {
        mainContainer.classList.add('theme-main-content');
      } else {
        mainContainer.classList.remove('theme-main-content');
      }
    }

    // Enhance main content area
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.classList.contains('theme-main-enhanced')) {
      mainContent.classList.add('theme-main-enhanced');
      
      // Apply theme-specific grid if advanced
      if (this.currentTheme === 'advanced') {
        mainContent.classList.add('theme-dashboard-grid');
      } else {
        mainContent.classList.remove('theme-dashboard-grid');
      }
    }
  }

  /**
   * Enhance navigation - SAFE, only adds classes
   */
  private enhanceNavigation(): void {
    // Enhance header
    const header = document.querySelector('header');
    if (header && !header.classList.contains('theme-navigation-enhanced')) {
      header.classList.add('theme-navigation-enhanced', 'theme-navigation-container');
    }

    // Look for tab-like elements and enhance them
    const possibleTabs = document.querySelectorAll('button[class*="tab"], [role="tab"], [data-tab]');
    possibleTabs.forEach(tab => {
      if (!tab.classList.contains('theme-navigation-tab')) {
        tab.classList.add('theme-navigation-tab');
        
        // Add active class detection
        if (tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true') {
          tab.classList.add('active');
        }
      }
    });

    // Create or enhance tab container
    this.enhanceTabContainer();
  }

  /**
   * Enhance or create tab container safely
   */
  private enhanceTabContainer(): void {
    // Look for existing tab containers
    let tabContainer = document.querySelector('[role="tablist"], .tabs-container');
    
    if (tabContainer && !tabContainer.classList.contains('theme-navigation-tabs')) {
      tabContainer.classList.add('theme-navigation-tabs');
      return;
    }

    // If no tab container exists and we have multiple main sections, create navigation
    const mainSections = document.querySelectorAll('main > div, .main-content > div');
    if (mainSections.length >= 2 && this.currentTheme === 'advanced' && !document.querySelector('.theme-navigation-tabs')) {
      this.createSimpleNavigation();
    }
  }

  /**
   * Create simple navigation for advanced theme
   */
  private createSimpleNavigation(): void {
    const header = document.querySelector('header');
    if (!header) return;

    // Check if navigation already exists
    if (header.querySelector('.theme-simple-nav')) return;

    const navContainer = document.createElement('div');
    navContainer.className = 'theme-simple-nav theme-navigation-tabs';
    navContainer.innerHTML = `
      <button class="theme-navigation-tab active" data-tab="dashboard">
        <span class="theme-navigation-tab-icon">📊</span>
        <span>Dashboard</span>
      </button>
      <button class="theme-navigation-tab" data-tab="analytics">
        <span class="theme-navigation-tab-icon">📈</span>
        <span>Analytics</span>
      </button>
    `;

    // Add click handlers
    navContainer.querySelectorAll('.theme-navigation-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.handleTabClick(e.target as HTMLElement));
    });

    // Insert navigation
    header.appendChild(navContainer);
    
    console.log('✨ Simple navigation created for advanced theme');
  }

  /**
   * Handle tab click safely
   */
  private handleTabClick(tab: HTMLElement): void {
    // Remove active from all tabs
    document.querySelectorAll('.theme-navigation-tab').forEach(t => t.classList.remove('active'));
    
    // Add active to clicked tab
    tab.classList.add('active');
    
    const tabId = tab.getAttribute('data-tab');
    console.log(`🔄 Tab clicked: ${tabId}`);
    
    // Emit event for other components to handle
    const event = new CustomEvent('theme-navigation-changed', {
      detail: { tabId, theme: this.currentTheme }
    });
    document.dispatchEvent(event);
  }

  /**
   * Enhance cards - SAFE, only adds classes
   */
  private enhanceCards(): void {
    // Find and enhance card-like elements
    const cardSelectors = [
      '.bg-white:not(.theme-enhanced)',
      '[class*="card"]:not(.theme-enhanced)',
      '.border:not(.theme-enhanced)',
      '.rounded-lg:not(.theme-enhanced)'
    ];

    cardSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        if (card instanceof HTMLElement) {
          card.classList.add('theme-enhanced');
          
          // Add theme-specific classes
          if (this.currentTheme === 'advanced') {
            card.classList.add('theme-dashboard-section');
          } else {
            card.classList.add('theme-enhanced-card');
          }
        }
      });
    });

    // Enhance specific sections
    this.enhanceProviderSection();
    this.enhanceRouterSection();
  }

  /**
   * Enhance provider section
   */
  private enhanceProviderSection(): void {
    // Look for provider-related elements
    const providerContainer = document.querySelector('[class*="provider"], .w-3\\/5');
    if (providerContainer && !providerContainer.classList.contains('theme-provider-enhanced')) {
      providerContainer.classList.add('theme-provider-enhanced');
      
      if (this.currentTheme === 'advanced') {
        providerContainer.classList.add('theme-dashboard-section');
      }
      
      // Add title if missing
      this.addSectionTitle(providerContainer, 'Providers', '🔗');
    }
  }

  /**
   * Enhance router section
   */
  private enhanceRouterSection(): void {
    // Look for router-related elements
    const routerContainer = document.querySelector('[class*="router"], .w-2\\/5');
    if (routerContainer && !routerContainer.classList.contains('theme-router-enhanced')) {
      routerContainer.classList.add('theme-router-enhanced');
      
      if (this.currentTheme === 'advanced') {
        routerContainer.classList.add('theme-dashboard-section');
      }
      
      // Add title if missing
      this.addSectionTitle(routerContainer, 'Configuration', '⚙️');
    }
  }

  /**
   * Add section title safely
   */
  private addSectionTitle(container: Element, title: string, icon: string): void {
    // Check if title already exists
    if (container.querySelector('.theme-dashboard-section-title, h1, h2')) return;
    
    const titleElement = document.createElement('div');
    titleElement.className = 'theme-dashboard-section-title';
    titleElement.innerHTML = `<span class="theme-section-icon">${icon}</span> ${title}`;
    
    // Insert at beginning
    container.insertBefore(titleElement, container.firstChild);
  }

  /**
   * Add theme-specific classes
   */
  private addThemeSpecificClasses(): void {
    const body = document.body;
    
    // Remove previous theme body classes
    body.classList.remove('theme-light-body', 'theme-dark-body', 'theme-advanced-body');
    
    // Add current theme body class
    body.classList.add(`theme-${this.currentTheme}-body`);
    
    // Add advanced theme specific enhancements
    if (this.currentTheme === 'advanced') {
      this.addAdvancedThemeEnhancements();
    } else {
      this.removeAdvancedThemeEnhancements();
    }
  }

  /**
   * Add advanced theme enhancements
   */
  private addAdvancedThemeEnhancements(): void {
    document.documentElement.classList.add('theme-advanced-enhanced');
    
    // Add glassmorphism classes to suitable elements
    document.querySelectorAll('.theme-enhanced:not(.theme-glass-applied)').forEach(element => {
      element.classList.add('theme-glass-applied');
      
      // Add hover effects for advanced theme
      if (element instanceof HTMLElement) {
        element.addEventListener('mouseenter', this.addGlassHover);
        element.addEventListener('mouseleave', this.removeGlassHover);
      }
    });
  }

  /**
   * Remove advanced theme enhancements
   */
  private removeAdvancedThemeEnhancements(): void {
    document.documentElement.classList.remove('theme-advanced-enhanced');
    
    // Remove hover effects
    document.querySelectorAll('.theme-glass-applied').forEach(element => {
      element.classList.remove('theme-glass-applied');
      
      if (element instanceof HTMLElement) {
        element.removeEventListener('mouseenter', this.addGlassHover);
        element.removeEventListener('mouseleave', this.removeGlassHover);
      }
    });
  }

  /**
   * Glass hover effect
   */
  private addGlassHover = (e: Event) => {
    const element = e.target as HTMLElement;
    element.style.transform = 'translateY(-2px)';
    element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
  };

  private removeGlassHover = (e: Event) => {
    const element = e.target as HTMLElement;
    element.style.transform = '';
    element.style.boxShadow = '';
  };

  /**
   * Get current configuration
   */
  getConfig(): LayoutEnhancerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(newConfig: Partial<LayoutEnhancerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isInitialized && this.config.enabled) {
      this.applyProgressiveEnhancements();
    }
  }

  /**
   * Enable or disable the enhancer
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (enabled && !this.isInitialized) {
      this.init();
    } else if (!enabled && this.isInitialized) {
      this.cleanup();
    }
  }

  /**
   * Clean up safely - only removes classes we added
   */
  cleanup(): void {
    try {
      // Remove our added classes
      document.querySelectorAll('.theme-enhanced').forEach(element => {
        element.classList.remove(
          'theme-enhanced',
          'theme-dashboard-section',
          'theme-enhanced-card',
          'theme-provider-enhanced',
          'theme-router-enhanced',
          'theme-glass-applied'
        );
      });

      // Remove navigation if we created it
      document.querySelectorAll('.theme-simple-nav').forEach(nav => nav.remove());
      
      // Remove section titles if we added them
      document.querySelectorAll('.theme-dashboard-section-title').forEach(title => title.remove());

      // Remove body classes
      document.body.classList.remove('theme-light-body', 'theme-dark-body', 'theme-advanced-body');
      document.documentElement.classList.remove('theme-advanced-enhanced');

      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.isInitialized = false;
      console.log('🧹 Layout Enhancer: Cleaned up safely');
    } catch (error) {
      console.error('❌ Layout Enhancer cleanup failed:', error);
    }
  }

  /**
   * Destroy the enhancer
   */
  destroy(): void {
    this.cleanup();
  }
}

// Create and export default instance
export const layoutEnhancer = new LayoutEnhancer();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      layoutEnhancer.init();
    });
  } else {
    layoutEnhancer.init();
  }
}

export default layoutEnhancer;