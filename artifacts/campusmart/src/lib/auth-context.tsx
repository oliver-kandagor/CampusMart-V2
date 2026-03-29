import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

type User = {
  id: string;
  email: string;
  username: string;
  campus?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem("campusmart_token")
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Register the token getter with the shared fetch client so every API
  // request automatically gets an Authorization: Bearer <token> header.
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("campusmart_token"));
    return () => setAuthTokenGetter(null);
  }, []);

  const { data: user, isError } = useGetCurrentUser({
    query: {
      queryKey: ["currentUser", !!token],
      enabled: !!token,
      retry: false,
    },
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("campusmart_token", newToken);
    } else {
      localStorage.removeItem("campusmart_token");
    }
    setTokenState(newToken);
    // Invalidate all queries so auth-gated data refreshes
    queryClient.invalidateQueries();
    if (!newToken) {
      queryClient.clear();
    }
  };

  const logout = () => {
    setToken(null);
  };

  useEffect(() => {
    if (isError) {
      setToken(null);
    }
  }, [isError]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user as User | null ?? null,
        setToken,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
