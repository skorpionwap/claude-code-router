import { createMemoryRouter, Navigate } from 'react-router-dom';
import App from './App';
import { Login } from '@/components/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // For this application, we allow access without an API key
  // The App component will handle loading and error states
  return children;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Always show login page
  // The login page will handle empty API keys appropriately
  return children;
};

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><App /></ProtectedRoute>,
  },
], {
  initialEntries: ['/dashboard']
});