import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { authApi } from '../src/services/api/authApi';
import { User } from '../src/types/auth';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '../src/contexts/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Check authentication status and user role on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await authApi.getToken();
        if (token) {
          setIsAuthenticated(true);
          // Fetch user details to get role
          try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
          } catch (err) {
            // If getCurrentUser fails, still consider authenticated but without user data
            console.warn('Failed to fetch user data:', err);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthChecked(true);
      }
    };

    if (loaded) {
      checkAuth();
    }
  }, [loaded]);

  if (!loaded || !isAuthChecked) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <RootLayoutNav isAuthenticated={isAuthenticated} user={user} />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

function RootLayoutNav({ isAuthenticated, user }: { isAuthenticated: boolean; user: User | null }) {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="login" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
