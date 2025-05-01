import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, companyId: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const isWeb = typeof window !== 'undefined';

// Custom storage engine based on platform
const zustandStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email, password, companyId) => {
        console.log('Attempting to log in...');
        try {
          const response = await fetch('https://api.peppypresence.com:5002/api/employee/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, companyId }),
          });

          if (response.status !== 200) {
            console.error('Login failed with status:', response.status);
            return false;
          }

          const { data } = await response.json();
          console.log('Login successful, received user data:', data);

          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            companyId: data.companyId,
          };

          set({ user, isAuthenticated: true });
          return true;
        } catch (err) {
          console.error('Login error:', err);
          return false;
        }
      },

      logout: async () => {
        console.log('Logging out user...');
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: async (key: string) => {
          const value = await zustandStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key: string, value: any) => {
          await zustandStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: zustandStorage.removeItem,
      },
    }
  )
);
