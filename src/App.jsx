/**
 * App.jsx — Root Component
 *
 * Đây là component gốc của ứng dụng.
 * Nơi bọc các Providers (Context) và Router.
 * 
 */

import AppRouter from './routers/AppRouter';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import { AdminThemeProvider } from './shared/context/ThemeContext';
import ErrorBoundary from './shared/components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <AdminThemeProvider defaultTheme="dark" defaultAccent="#f5b14a">
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AdminThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

