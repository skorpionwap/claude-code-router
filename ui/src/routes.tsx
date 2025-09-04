import { createMemoryRouter } from 'react-router-dom';
import App from './App';
import { Login } from '@/components/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';

export const router = createMemoryRouter([
  {
    path: '/',
    element: <ProtectedRoute><App /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
], {
  initialEntries: ['/']
});