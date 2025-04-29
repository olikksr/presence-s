import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

interface TimeEntry {
  id: string;
  punchIn: Date;
  punchOut: Date | null;
}

interface TimeState {
  currentSession: TimeEntry | null;
  history: TimeEntry[];
  checkStatus: () => Promise<void>;
  punchIn: () => Promise<void>;
  punchOut: () => Promise<void>;
}

function isWeb() {
  return typeof window !== 'undefined';
}

async function getCompanyId() {
  if (isWeb()) {
    const user = localStorage.getItem('user');
    console.log('Retrieved user from local storage:', user);
    return user ? JSON.parse(user).companyId : null;
  } else {
    const user = await SecureStore.getItemAsync('user');
    console.log('Retrieved user from secure store:', user);
    return user ? JSON.parse(user).companyId : null;
  }
}

export async function getCurrentPosition() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log('Location permission status:', status);
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  const location = await Location.getCurrentPositionAsync({});
  console.log('Retrieved current position:', location);
  return location;
}

export const useTimeStore = create<TimeState>((set) => ({
  currentSession: null,
  history: [],
  checkStatus: async () => {
    try {
      const user = useAuthStore.getState().user;
      console.log('Current user:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:5003/api/attendance/status?employee_id=${user.id}`);
      console.log('Attendance status response:', response);
      const data = await response.json();
      console.log('Attendance status data:', data);
      
      if (data.status === 200 && data.message === "Employee is currently clocked in") {
        set({
          currentSession: {
            id: Date.now().toString(),
            punchIn: new Date(),
            punchOut: null,
          },
        });
        console.log('User is currently clocked in, session set.');
      } else {
        set({ currentSession: null });
        console.log('User is not clocked in, session cleared.');
      }
    } catch (error) {
      set({ currentSession: null });
      console.error('Error checking status:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to check status');
    }
  },
  punchIn: async () => {
    try {
      const position = await getCurrentPosition();
      const user = useAuthStore.getState().user;
      const companyId = await getCompanyId();
      console.log('Punch in position:', position);
      console.log('Punch in user:', user);
      console.log('Punch in companyId:', companyId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:5003/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: user.id,
          companyId: companyId,
          type: 'clock_in',
          clock_in: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      console.log('Punch in response:', response);
      const data = await response.json();
      console.log('Punch in data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to punch in');
      }

      set({
        currentSession: {
          id: Date.now().toString(),
          punchIn: new Date(),
          punchOut: null,
        },
      });
      console.log('Punch in successful, session set.');
    } catch (error) {
      console.error('Error punching in:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to punch in');
    }
  },
  punchOut: async () => {
    try {
      const position = await getCurrentPosition();
      const user = useAuthStore.getState().user;
      const companyId = await getCompanyId();
      console.log('Punch out position:', position);
      console.log('Punch out user:', user);
      console.log('Punch out companyId:', companyId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:5003/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: user.id,
          companyId: companyId,
          type: 'clock_out',
          clock_in: false,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      console.log('Punch out response:', response);
      const data = await response.json();
      console.log('Punch out data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to punch out');
      }

      set((state) => {
        if (!state.currentSession) return state;
        
        const completedSession = {
          ...state.currentSession,
          punchOut: new Date(),
        };

        console.log('Punch out successful, session completed:', completedSession);

        return {
          currentSession: null,
          history: [completedSession, ...state.history],
        };
      });
    } catch (error) {
      console.error('Error punching out:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to punch out');
    }
  },
}));