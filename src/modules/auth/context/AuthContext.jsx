import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import { setAccessToken, clearAccessToken } from '@/config/axios.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getUser());
  // Chỉ bật loading nếu trước đó đã có session cần phục hồi
  const [isInitializing, setIsInitializing] = useState(() => !!authService.getUser());

  // Silent refresh khi ứng dụng khởi chạy lần đầu hoặc khi người dùng F5 / mở lại trình duyệt
  useEffect(() => {
    if (!authService.getUser()) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await authService.refreshToken();
        if (res?.success && res?.data?.token) {
          setAccessToken(res.data.token);
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
          setIsAuthenticated(true);
        } else {
          clearAccessToken();
          setUser(null);
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch {
        clearAccessToken();
        setUser(null);
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginSuccess = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
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
