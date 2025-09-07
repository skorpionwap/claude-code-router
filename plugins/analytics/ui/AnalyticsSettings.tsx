import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

export function AnalyticsSettings() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Simple check from localStorage only
    const enabled = localStorage.getItem('analytics-enabled') === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    
    // Simple localStorage save only
    localStorage.setItem('analytics-enabled', checked.toString());
    
    // console.log(`Analytics ${checked ? 'enabled' : 'disabled'}`); // REMOVED DEBUG LOG
  };

  return (
    <div className={`rounded-lg border p-4 ${isEnabled ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold">Analytics</h3>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Real-time analytics and Mission Control dashboard
      </p>
      
      <div className="border-t pt-3">
        {isEnabled ? (
          <div className="p-2 text-center text-green-600 text-xs">
            ✅ Analytics enabled
          </div>
        ) : (
          <div className="p-2 text-center text-muted-foreground text-xs">
            Enable to activate analytics tracking
          </div>
        )}
      </div>
    </div>
  );
}
