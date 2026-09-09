/**
 * App.jsx — Root Component
 *
 * Đây là component gốc của ứng dụng.
 * Nơi bọc các Providers (Context) và Router.
 * 
 */

import AppRouter from './routers/AppRouter';
import { ToastProvider } from './components/ui/toast/ToastProvider';

const App = () => {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
};

export default App;
