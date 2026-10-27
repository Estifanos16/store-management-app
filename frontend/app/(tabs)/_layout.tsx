import { SymbolView } from 'expo-symbols';
import { Link, Tabs, useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/src/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isOwner } = useAuth();
  const router = useRouter();

  const HeaderGearButton = () => (
    <Pressable
      onPress={() => router.push('/modal')}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        marginRight: 15,
      })}
    >
      <SymbolView
        name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
        tintColor={Colors[colorScheme].text}
        size={24}
      />
    </Pressable>
  );

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
          headerRight: () => <HeaderGearButton />,
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
          headerRight: () => <HeaderGearButton />,
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
          headerRight: () => <HeaderGearButton />,
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
            headerRight: () => <HeaderGearButton />,
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
            headerRight: () => <HeaderGearButton />,
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
