import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getMe,
  loginUser,
  registerUser,
} from "../services/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const TOKEN_KEY = "@taskflow_token";

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        return;
      }

      const response = await getMe(storedToken);

      if (response.success) {
        setToken(storedToken);
        setUser(response.data.user);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await loginUser(email, password);

    await AsyncStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setToken(response.data.token);
    setUser(response.data.user);
  };

  const register = async (
    email: string,
    password: string
  ) => {
    const response = await registerUser(email, password);

    await AsyncStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);

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
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};