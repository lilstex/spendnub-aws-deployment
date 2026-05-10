import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  isSubscribed: boolean;
  trialExpiration: string;
  currency: {
    code: string;
    symbol: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        Cookies.set("spendnub-token", token, { expires: 7 });
      },
      logout: () => {
        set({ user: null, token: null });
        Cookies.remove("spendnub-token");
      },
    }),
    {
      name: "spendnub-auth", // Key in localStorage
    }
  )
);
