import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { theme } from '@store-management/shared';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'destructive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: any;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      minHeight: 56,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textSecondary : colors.primary,
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textSecondary : colors.accent,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: disabled ? colors.textSecondary : colors.primary,
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textSecondary : colors.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      fontWeight: '600' as const,
    };

    switch (variant) {
      case 'primary':
      case 'accent':
      case 'destructive':
        return { ...baseStyle, color: '#FFFFFF' };
      case 'outline':
        return { ...baseStyle, color: disabled ? colors.textSecondary : colors.primary };
      default:
        return baseStyle;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return '#FFFFFF';
    if (variant === 'outline') return colors.primary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <SymbolView
          name={icon}
          tintColor={getIconColor()}
          size={20}
          style={styles.icon}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  icon: {
    marginRight: 8,
  },
});
