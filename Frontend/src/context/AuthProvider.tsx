import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth";

import {
  getCurrentUser,
  login as loginRequest,
} from "../services/authService";

import { AuthContext } from "./authContext";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken =
        localStorage.getItem("access_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<User> => {
    const response = await loginRequest({
      email,
      password,
    });

    localStorage.setItem(
      "access_token",
      response.access_token,
    );

    setToken(response.access_token);
    setUser(response.user);

    return response.user;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}