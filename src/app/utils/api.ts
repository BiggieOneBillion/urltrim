import axios from "axios";

// Create axios instance for API calls
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

// API functions for auth
export const authAPI = {
  // Register a new user
  register: async (userData: {name:string, email: string; password: string }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login a user
  login: async (userData: { email: string; password: string }) => {
    const response = await api.post("/auth/login", userData);
    return response.data;
  },

  // Logout a user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Send password reset email
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password
    });
    return response.data;
  },

  // Google sign in
  googleAuth: async (tokenId: string) => {
    const response = await api.post("/auth/google", { tokenId });
    return response.data;
  }
};

// Add request interceptor to add auth token to headers
api.interceptors.request.use(
  config => {
    // Get token from local storage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
