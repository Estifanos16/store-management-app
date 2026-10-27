// Store Management App Color Palette
// Import from shared package - DO NOT hard-code hex values here
import { theme } from '@store-management/shared';

export default {
  light: {
    // Brand colors
    primary: theme.colors.primary,
    primaryDark: theme.colors.primaryDark,
    accent: theme.colors.accent,
    
    // Backgrounds
    background: theme.colors.background,
    card: theme.colors.surface,
    
    // Text
    text: theme.colors.text,
    textSecondary: theme.colors.textMuted,
    
    // UI elements
    border: theme.colors.border,
    tint: theme.colors.primary,
    tabIconDefault: theme.colors.textMuted,
    tabIconSelected: theme.colors.primary,
    
    // Status colors
    success: theme.colors.success,
    successBg: theme.colors.successBg,
    successText: theme.colors.successText,
    warning: theme.colors.warning,
    warningBg: theme.colors.warningBg,
    warningText: theme.colors.warningText,
    error: theme.colors.error,
    errorBg: theme.colors.errorBg,
    errorText: theme.colors.errorText,
    info: theme.colors.info,
    infoBg: theme.colors.infoBg,
    infoText: theme.colors.infoText,
    neutral: theme.colors.neutral,
    neutralBg: theme.colors.neutralBg,
    neutralText: theme.colors.neutralText,
  },
  dark: {
    // Brand colors
    primary: theme.dark.primary,
    primaryDark: theme.colors.primaryDark,
    accent: theme.colors.accent,
    
    // Backgrounds
    background: theme.dark.background,
    card: theme.dark.surface,
    
    // Text
    text: theme.dark.text,
    textSecondary: theme.dark.textMuted,
    
    // UI elements
    border: theme.dark.border,
    tint: theme.dark.primary,
    tabIconDefault: theme.colors.textMuted,
    tabIconSelected: theme.dark.primary,
    
    // Status colors (same in dark mode)
    success: theme.colors.success,
    successBg: theme.colors.successBg,
    successText: theme.colors.successText,
    warning: theme.colors.warning,
    warningBg: theme.colors.warningBg,
    warningText: theme.colors.warningText,
    error: theme.colors.error,
    errorBg: theme.colors.errorBg,
    errorText: theme.colors.errorText,
    info: theme.colors.info,
    infoBg: theme.colors.infoBg,
    infoText: theme.colors.infoText,
    neutral: theme.colors.neutral,
    neutralBg: theme.colors.neutralBg,
    neutralText: theme.colors.neutralText,
  },
};
