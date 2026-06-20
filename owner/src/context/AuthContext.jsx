import { createContext, useContext, useReducer, useEffect } from 'react';
import { ownerAuthService } from '../api/authService';

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
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('ownerToken');
      const storedUser = localStorage.getItem('ownerUser');
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
      const data = await ownerAuthService.login({ email, password });
      const user = { id: data.data.id, name: data.data.name, email: data.data.email };
      localStorage.setItem('ownerToken', data.token);
      localStorage.setItem('ownerUser', JSON.stringify(user));
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
      const data = await ownerAuthService.register(userData);
      // Registration no longer returns a token or auto-login
      // Owner must wait for admin approval - just clear loading
      dispatch({ type: 'AUTH_FAILURE', payload: null });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('ownerUser');
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
