import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Settings as SettingsIcon, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={24} color="#fff" />
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Pressable style={styles.option}>
          <Text style={styles.optionText}>Notification Settings</Text>
        </Pressable>
        <Pressable style={styles.option}>
          <Text style={styles.optionText}>Time Format</Text>
        </Pressable>
        <Pressable style={styles.option}>
          <Text style={styles.optionText}>Theme</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.option}>
          <Text style={styles.optionText}>Profile</Text>
        </Pressable>
        <Pressable style={styles.option}>
          <Text style={styles.optionText}>Export Data</Text>
        </Pressable>
      </View>

      <Pressable 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#00ff87',
    marginBottom: 15,
    fontFamily: 'Inter-Bold',
  },
  option: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
    gap: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});