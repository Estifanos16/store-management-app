import { useColorScheme as useColorSchemeCore } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

export const useColorScheme = () => {
  const { theme } = useTheme();
  return theme;
};
