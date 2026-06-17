import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios.js";
import { loginTenant, registerTenant } from "../api/auth.js";
import { getTenantProfile } from "../api/tenant.js"


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadTenant = async () => {
    if (token) {
      try {
        
        const data = await getTenantProfile()

        if(data.success){
          setTenant(data.data)
        }
      
      } catch (error) {
        console.error("Error fetching tenant data:", error);
      }
    }
  };

  useEffect(() => {
    loadTenant();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      // loginTenant returns response.data directly!
      const serverPayload = await loginTenant(email, password);

      const { token, data, success } = serverPayload;

      if (!success || !token) {
        throw new Error(serverPayload.message || "Invalid login credentials");
      }

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 'data' here matches the exact inner profile object format from your backend controller
      setTenant(data);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      // registerTenant returns response.data directly!
      const serverPayload = await registerTenant(formData);

      const { token, data, success } = serverPayload;

      if (!success || !token) {
        throw new Error(serverPayload.message || "Registration failed");
      }

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setTenant(data);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Registration failed.",
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setTenant(null);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/api/tenant/profile", profileData);
      const updatedTenant = res.data.data;
      setTenant(updatedTenant);
      return { success: true, tenant: updatedTenant };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        tenant,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
