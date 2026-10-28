"use strict";
// Design tokens for Store Management App
// Define all colors ONCE here. Never hard-code hex values in components.
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
exports.theme = {
    // Brand and surface tokens (light theme)
    colors: {
        primary: '#0F766E', // deep teal: buttons, headers, active tabs
        primaryDark: '#115E59', // pressed state, top bar elements
        accent: '#F59E0B', // amber: ONLY the main Scan button, scan line and key highlights
        background: '#F8FAFC',
        surface: '#FFFFFF', // cards, sheets
        text: '#0F172A',
        textMuted: '#64748B',
        border: '#E2E8F0',
        // Status tokens
        success: '#16A34A', // in_stock, completed sale, profit
        successBg: '#DCFCE7', // chip background
        successText: '#166534', // chip text
        warning: '#F59E0B', // low stock
        warningBg: '#FEF3C7', // chip background
        warningText: '#92400E', // chip text
        error: '#DC2626', // damaged, lost, ITEM_ALREADY_SOLD, destructive actions
        errorBg: '#FEE2E2', // chip background
        errorText: '#991B1B', // chip text
        info: '#2563EB', // returned, tips
        infoBg: '#DBEAFE', // chip background
        infoText: '#1E40AF', // chip text
        neutral: '#64748B', // sold
        neutralBg: '#F1F5F9', // chip background
        neutralText: '#334155', // chip text
    },
    // Dark mode tokens
    dark: {
        background: '#0B1220',
        surface: '#111827',
        primary: '#2DD4BF',
        text: '#F1F5F9',
        textMuted: '#94A3B8',
        border: '#1E293B',
    },
    // Typography
    typography: {
        fontFamily: 'Inter',
        fontWeights: {
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        fontSizes: {
            screenTitle: { small: 20, large: 24 },
            body: 15,
            secondary: 13,
            chip: 12,
        },
    },
    // Spacing scale (multiples of 4)
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },
    // Corner radius
    borderRadius: {
        card: 16,
        button: { small: 14, large: 16 },
        chip: { small: 8, large: 10 },
        input: { small: 10, large: 12 },
    },
    // Touch targets
    touchTarget: {
        min: 44,
        primaryButton: 56,
    },
};
