import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../services/api";
import type { AdminUser } from "../types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  admin: AdminUser | null;
  csrfToken: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    fetchAdminSession()
      .then((session) => {
        if (!active) return;
        setAdmin(session.admin);
        setCsrfToken(session.csrfToken);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        setAdmin(null);
        setCsrfToken(null);
        setStatus("anonymous");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginAdmin(email, password);
    setAdmin(session.admin);
    setCsrfToken(session.csrfToken);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
      setCsrfToken(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo(
    () => ({ admin, csrfToken, status, login, logout }),
    [admin, csrfToken, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
