import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useConfig } from "@/components/ConfigProvider";
import api from "@/lib/api";
import { Toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import "@/styles/animations.css";
import "@/styles/dashboard.css";
import "@/styles/dashboard-theme.css";
import "@/styles/charts-enhancement.css";
// Import theme plugin IT orchestrator
import { ItOrchestrator } from "@/plugins/themes/components/it-orchestrator";

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { config, error } = useConfig();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  // 版本检查状态
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState<{ version: string; changelog: string } | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [hasCheckedUpdate, setHasCheckedUpdate] = useState(false);
  const hasAutoCheckedUpdate = useRef(false);

  const saveConfig = async () => {
    // Handle case where config might be null or undefined
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }
    
    try {
      // Save to API
      const response = await api.updateConfig(config);
      // Show success message or handle as needed
      console.log('Config saved successfully');
      
      // 根据响应信息进行提示
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; message?: string };
        if (apiResponse.success) {
          setToast({ message: apiResponse.message || t('app.config_saved_success'), type: 'success' });
        } else {
          setToast({ message: apiResponse.message || t('app.config_saved_failed'), type: 'error' });
        }
      } else {
        // 默认成功提示
        setToast({ message: t('app.config_saved_success'), type: 'success' });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      // Handle error appropriately
      setToast({ message: t('app.config_saved_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  const saveConfigAndRestart = async () => {
    // Handle case where config might be null or undefined
    if (!config) {
      setToast({ message: t('app.config_missing'), type: 'error' });
      return;
    }
    
    try {
      // Save to API
      const response = await api.updateConfig(config);
      
      // Check if save was successful before restarting
      let saveSuccessful = true;
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; message?: string };
        if (!apiResponse.success) {
          saveSuccessful = false;
          setToast({ message: apiResponse.message || t('app.config_saved_failed'), type: 'error' });
        }
      }
      
      // Only restart if save was successful
      if (saveSuccessful) {
        // Restart service
        const response = await api.restartService();
        
        // Show success message or handle as needed
        console.log('Config saved and service restarted successfully');
        
        // 根据响应信息进行提示
        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as { success: boolean; message?: string };
          if (apiResponse.success) {
            setToast({ message: apiResponse.message || t('app.config_saved_restart_success'), type: 'success' });
          }
        } else {
          // 默认成功提示
          setToast({ message: t('app.config_saved_restart_success'), type: 'success' });
        }
      }
    } catch (error) {
      console.error('Failed to save config and restart:', error);
      // Handle error appropriately
      setToast({ message: t('app.config_saved_restart_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };
  
  // 检查更新函数
  const checkForUpdates = useCallback(async (showDialog: boolean = true) => {
    // 如果已经检查过且有新版本，根据参数决定是否显示对话框
    if (hasCheckedUpdate && isNewVersionAvailable) {
      if (showDialog) {
        setIsUpdateDialogOpen(true);
      }
      return;
    }
    
    setIsCheckingUpdate(true);
    try {
      const updateInfo = await api.checkForUpdates();
      
      if (updateInfo.hasUpdate && updateInfo.latestVersion && updateInfo.changelog) {
        setIsNewVersionAvailable(true);
        setNewVersionInfo({
          version: updateInfo.latestVersion,
          changelog: updateInfo.changelog
        });
        // 只有在showDialog为true时才显示对话框
        if (showDialog) {
          setIsUpdateDialogOpen(true);
        }
      } else if (showDialog) {
        // 只有在showDialog为true时才显示没有更新的提示
        setToast({ message: t('app.no_updates_available'), type: 'success' });
      }
      
      setHasCheckedUpdate(true);
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (showDialog) {
        setToast({ message: t('app.update_check_failed') + ': ' + (error as Error).message, type: 'error' });
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [hasCheckedUpdate, isNewVersionAvailable, t]);

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a config, we're authenticated
      if (config) {
        setIsCheckingAuth(false);
        // 自动检查更新，但不显示对话框
        if (!hasCheckedUpdate && !hasAutoCheckedUpdate.current) {
          hasAutoCheckedUpdate.current = true;
          checkForUpdates(false);
        }
        return;
      }
      
      // For empty API key, allow access without checking config
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        setIsCheckingAuth(false);
        return;
      }
      
      // If we don't have a config, try to fetch it
      try {
        await api.getConfig();
        // If successful, we don't need to do anything special
        // The ConfigProvider will handle setting the config
      } catch (err) {
        // If it's a 401, the API client will redirect to login
        // For other errors, we still show the app to display the error
        console.error('Error checking auth:', err);
        // Redirect to login on authentication error
        if ((err as Error).message === 'Unauthorized') {
          navigate('/login');
        }
      } finally {
        setIsCheckingAuth(false);
        // 在获取配置完成后检查更新，但不显示对话框
        if (!hasCheckedUpdate && !hasAutoCheckedUpdate.current) {
          hasAutoCheckedUpdate.current = true;
          checkForUpdates(false);
        }
      }
    };

    checkAuth();
    
    // Listen for unauthorized events
    const handleUnauthorized = () => {
      navigate('/login');
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [config, navigate, hasCheckedUpdate, checkForUpdates]);
  
  // 执行更新函数
  const performUpdate = async () => {
    if (!newVersionInfo) return;
    
    try {
      const result = await api.performUpdate();
      
      if (result.success) {
        setToast({ message: t('app.update_successful'), type: 'success' });
        setIsNewVersionAvailable(false);
        setIsUpdateDialogOpen(false);
        setHasCheckedUpdate(false); // 重置检查状态，以便下次重新检查
      } else {
        setToast({ message: t('app.update_failed') + ': ' + result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Failed to perform update:', error);
      setToast({ message: t('app.update_failed') + ': ' + (error as Error).message, type: 'error' });
    }
  };

  
  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-gray-500">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  // Handle case where config is null or undefined
  if (!config) {
    return (
      <div className="h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-gray-500">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Theme Plugin IT Orchestrator - Global coordination component */}
      <ItOrchestrator />
      
      <DashboardWrapper
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSaveConfig={saveConfig}
        onSaveAndRestart={saveConfigAndRestart}
      >
        <Dashboard 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSaveConfig={saveConfig}
          onSaveAndRestart={saveConfigAndRestart}
        />
      </DashboardWrapper>
      
      {/* Settings Dialog */}
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      
      {/* Version Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('app.new_version_available')}
              {newVersionInfo && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  v{newVersionInfo.version}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('app.update_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-4">
            {newVersionInfo?.changelog ? (
              <div className="whitespace-pre-wrap text-sm">
                {newVersionInfo.changelog}
              </div>
            ) : (
              <div className="text-muted-foreground">
                {t('app.no_changelog_available')}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              {t('app.later')}
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              onClick={performUpdate}
            >
              {t('app.update_now')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default App;
