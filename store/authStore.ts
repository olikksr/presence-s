import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  companyId: string; // ✅ companyId included
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, companyId: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

function isWeb() {
  return typeof window !== 'undefined';
}

async function storeUser(user: User) {
  const userString = JSON.stringify(user);
  if (isWeb()) {
    console.log('Storing user in local storage for web.');
    localStorage.setItem('user', userString);
  } else {
    console.log('Storing user in secure store for iOS/Android.');
    await SecureStore.setItemAsync('user', userString);
  }
}

async function removeUser() {
  if (isWeb()) {
    console.log('Removing user from local storage for web.');
    localStorage.removeItem('user');
  } else {
    console.log('Removing user from secure store for iOS/Android.');
    await SecureStore.deleteItemAsync('user');
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email, password, companyId) => {
    console.log('Attempting to log in...');
    try {
      const response = await fetch('http://localhost:5002/api/employee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, companyId }),
      });
  
      if (response.status !== 200) {
        console.error('Login failed with status:', response.status);
        throw new Error('Login failed');
      }
  
      const { data } = await response.json();
      console.log('Login successful, received user data:', data);
  
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        companyId: data.companyId,
      };
  
      // ✅ Store the user
      await storeUser(user);
  
      set({
        isAuthenticated: true,
        user,
      });
      console.log('User state updated to authenticated.');
  
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async () => {
    console.log('Logging out user...');
    try {
      await removeUser();
      console.log('User data removed from storage.');

      set({
        isAuthenticated: false,
        user: null,
      });
      console.log('User state updated to unauthenticated.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));
