import { createContext, useContext, useReducer, useEffect } from 'react';
import { tenantAuthService } from '../api/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, user: null, token: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('tenantToken');
      const storedUser = localStorage.getItem('tenantUser');
      if (token && storedUser) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: JSON.parse(storedUser), token },
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = await tenantAuthService.login({ email, password });
      const user = { id: data.data.id, name: data.data.name, email: data.data.email };
      localStorage.setItem('tenantToken', data.token);
      localStorage.setItem('tenantUser', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: data.token } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = await tenantAuthService.register(userData);
      const user = { id: data.data.id, name: data.data.name, email: data.data.email, phone: data.data.phone };
      localStorage.setItem('tenantToken', data.token);
      localStorage.setItem('tenantUser', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: data.token } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('tenantToken');
    localStorage.removeItem('tenantUser');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.token,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
