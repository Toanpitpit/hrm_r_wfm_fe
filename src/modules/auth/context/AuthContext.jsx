import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const loginSuccess = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  useEffect(() => {
    const request = new AbortController();

    // Remove credentials left by previous frontend versions.
    ['accessToken', 'refreshToken', 'token'].forEach(key => localStorage.removeItem(key));

    const restoreSession = async () => {
      try {
        const result = await authService.getSession(request.signal);
        if (!request.signal.aborted && result.success && result.data) {
          loginSuccess(result.data);
        }
      } catch {
        if (!request.signal.aborted) {
          localStorage.removeItem('user');
        }
      } finally {
        if (!request.signal.aborted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();
    return () => request.abort();
  }, [loginSuccess]);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('user');
    setUser(null);
    sessionStorage.clear();
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isInitializing,
        loginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
