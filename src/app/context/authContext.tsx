"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/utils/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  googleLogin: (tokenId: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const { data } = await authAPI.getMe();
            setUser(data);
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error("Error loading user", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
       setError(null); // Reset error before attempting registration
    
      setLoading(true);
      const { token, user } = await authAPI.register({ name, email, password });
      
      // Save to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setError(null);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
       setError(null);
      setLoading(true);
      const { token, user } = await authAPI.login({ email, password });
      
      // Save to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setError(null);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
     
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Update state
      setToken(null);
      setUser(null);
      
      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.log(error)
      setError(error.response?.data?.error || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
       setError(null);
      setLoading(true);
      await authAPI.forgotPassword(email);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
       setError(null);
      setLoading(true);
      await authAPI.resetPassword(token, password);
      setError(null);
      
      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.error || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const googleLogin = async (tokenId: string) => {
    try {
       setError(null);
      setLoading(true);
      const { token, user } = await authAPI.googleAuth(tokenId);
      
      // Save to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setError(null);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.error || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        googleLogin,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};