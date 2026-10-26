import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/src/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isOwner } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].primary,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'chart.bar',
                android: 'bar_chart',
                web: 'bar_chart',
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'cube',
                android: 'inventory',
                web: 'inventory',
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'dollarsign.circle',
                android: 'attach_money',
                web: 'attach_money',
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      {isOwner && (
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: 'chart.line.uptrend.xyaxis',
                  android: 'assessment',
                  web: 'assessment',
                }}
                tintColor={color}
                size={28}
              />
            ),
          }}
        />
      )}
      {isOwner && (
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name={{
                  ios: 'gearshape',
                  android: 'settings',
                  web: 'settings',
                }}
                tintColor={color}
                size={28}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
