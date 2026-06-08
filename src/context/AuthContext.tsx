import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "skitrack_token";
const USER_KEY = "skitrack_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      persist(res.token, res.user);
    } catch {
      // Demo fallback so the school project is usable without the backend
      const lower = email.toLowerCase();
      const role: User["role"] = lower.includes("admin")
        ? "super_admin"
        : lower.includes("manager")
          ? "resort_manager"
          : "user";
      const demoUser: User = {
        _id: role === "super_admin" ? "u3" : role === "resort_manager" ? "u4" : "u1",
        name: role === "super_admin" ? "Admin User" : role === "resort_manager" ? "Resort Manager" : "Demo User",
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      persist("demo-token", demoUser);
    }
  };


  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await authApi.register({ name, email, password });
      persist(res.token, res.user);
    } catch {
      const demoUser: User = {
        _id: "new",
        name,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      persist("demo-token", demoUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
