import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
const { toast } = useToast();

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking existing session...");
      try {
        const response = await apiRequest("GET", "/api/auth/me");

        if (response.ok) {
          const userData = await response.json();
          console.log("Authenticated user:", userData);
          setUser(userData);
        }
      } catch (error) {
        // User is not authenticated
        console.log("User not authenticated", error);
        toast({
          title: "Session check failed",
          description: "You are not logged in or session has expired.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        navigate("/dashboard");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Invalid email or password");
      }
    } catch (error) {
      console.log("User not authenticated", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      console.log("User logged out");
      setTimeout(() => navigate("/login"), 0);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}