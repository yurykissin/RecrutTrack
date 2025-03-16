import { useAuth } from "@/components/context/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute check", { isAuthenticated, isLoading });
    if (!isLoading && !isAuthenticated) {
      console.log("User is not authenticated — redirecting to /login");
      try {
        navigate("/login");
      } catch (err) {
        console.error("Navigation to /login failed", err);
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full"></span>
            Loading...
          </p>
          <p className="text-gray-500">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}