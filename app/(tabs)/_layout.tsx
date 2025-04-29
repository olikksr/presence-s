import { Tabs } from 'expo-router';
import { Clock, History, Settings } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

function TabBarIcon({ Icon, focused }: { Icon: any, focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(focused ? 1.2 : 1) },
    ],
    opacity: withTiming(focused ? 1 : 0.5),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={24} color={focused ? '#00ff87' : '#888'} />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(26, 26, 26, 0.98)',
          borderTopColor: '#333',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            style={[
              props.style,
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={Clock} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={History} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon Icon={Settings} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}