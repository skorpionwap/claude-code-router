import './i18n';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/dashboard.css'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ConfigProvider } from '@/components/ConfigProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Import plugin CSS files
import '@/plugins/themes/styles/themes.css';
import '@/plugins/themes/styles/layout-transformations.css';
import '@/plugins/themes/styles/advanced-animations.css';
import '@/plugins/themes/styles/component-integration.css';
import '@/plugins/themes/styles/advanced-complete.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ConfigProvider>
  </StrictMode>,
)
