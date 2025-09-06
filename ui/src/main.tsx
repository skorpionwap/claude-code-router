import './i18n';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../plugins/themes/styles/themes.css'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ConfigProvider } from '@/components/ConfigProvider';
import { ThemeProvider } from '../../plugins/themes/contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ConfigProvider>
  </StrictMode>,
)
