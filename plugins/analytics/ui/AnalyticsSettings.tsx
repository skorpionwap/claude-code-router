import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { usePlugins } from '@/contexts/PluginContext';

export function AnalyticsSettings() {
  const { togglePlugin } = usePlugins();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if analytics is enabled from localStorage or config
    const checkEnabled = () => {
      try {
        // Check localStorage first
        if (localStorage.getItem('analytics-enabled') === 'true') {
          return true;
        }
        
        // Check config if exists
        const configElement = document.getElementById('app-config');
        if (configElement?.textContent) {
          const config = JSON.parse(configElement.textContent);
          if (config?.plugins?.analytics?.enabled === true) {
            return true;
          }
        }
      } catch (e) {
        console.warn('Failed to check analytics config:', e);
      }
      return false;
    };

    setIsEnabled(checkEnabled());
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    
    try {
      // Update config via API
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plugins: {
            analytics: {
              enabled: checked
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save config');
      }

      console.log('Analytics config updated successfully');
    } catch (error) {
      console.error('Failed to save analytics config:', error);
    }

    // Save to localStorage for plugin to detect
    localStorage.setItem('analytics-enabled', checked.toString());

    // Notify plugin system
    togglePlugin('analytics', checked);

    // Load analytics plugin UI component dynamically if enabled
    if (checked) {
      try {
        // Import and render the analytics button component
        import('@plugins/analytics/ui/AnalyticsButton').then(module => {
          const AnalyticsButton = module.default;
          
          let analyticsContainer = document.getElementById('analytics-plugin-ui');
          if (!analyticsContainer) {
            // Create a container for the analytics button
            analyticsContainer = document.createElement('div');
            analyticsContainer.id = 'analytics-plugin-ui';
            document.body.appendChild(analyticsContainer);
          }

          // Render the analytics button component
          import('react-dom/client').then(({ createRoot }) => {
            createRoot(analyticsContainer!).render(React.createElement(AnalyticsButton));
            console.log('📊 Analytics UI Plugin loaded and rendered dynamically');
          });
        });
      } catch (error) {
        console.warn('Failed to load Analytics UI Plugin dynamically:', error);
      }
    } else {
      // Remove analytics button if disabled
      const analyticsContainer = document.getElementById('analytics-plugin-ui');
      if (analyticsContainer) {
        analyticsContainer.remove();
      }
    }

    // Small delay to ensure DOM is ready for analytics plugin
    setTimeout(() => {
      console.log('Analytics plugin state updated:', checked);
    }, 100);
  };

  return (
    <div className={`rounded-lg border p-4 ${isEnabled ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Analytics</h3>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Real-time analytics and Mission Control dashboard
      </p>
    </div>
  );
}
