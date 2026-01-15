"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData } from "@/types/user";
import { getCookie, deleteCookie, setCookie } from "@/utils/cookies";
import { AUTH_TOKEN_KEY } from "@/types";

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "user_data";
const TOKEN_STORAGE_KEY = "auth_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data and token from storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || getCookie(AUTH_TOKEN_KEY);
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }
      
      if (storedToken) {
        setToken(storedToken);
      }
      
      setLoading(false);
    }
  }, []);

  // Save user data to storage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, [user]);

  // Save token to storage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        // Also set as cookie for axios interceptor
        setCookie(AUTH_TOKEN_KEY, token, 7);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        deleteCookie(AUTH_TOKEN_KEY);
      }
    }
  }, [token]);

  const handleSetUser = (newUser: UserData | null) => {
    setUser(newUser);
  };

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      deleteCookie(AUTH_TOKEN_KEY);
      sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        setUser: handleSetUser,
        setToken: handleSetToken,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
