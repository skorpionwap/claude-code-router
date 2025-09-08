import './i18n';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/dashboard.css'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ConfigProvider } from '@/components/ConfigProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>,
)
