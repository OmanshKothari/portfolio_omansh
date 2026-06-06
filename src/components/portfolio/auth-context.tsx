import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { me, logout } from "@/lib/auth.functions";

type AuthCtx = {
  isAdmin: boolean;
  email: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => me() });

  const value: AuthCtx = {
    isAdmin: data?.isAdmin ?? false,
    email: data?.email ?? null,
    loading: isLoading,
    refresh: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
    signOut: async () => {
      await logout();
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
