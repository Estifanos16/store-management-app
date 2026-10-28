export declare const theme: {
    colors: {
        primary: string;
        primaryDark: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
        border: string;
        success: string;
        successBg: string;
        successText: string;
        warning: string;
        warningBg: string;
        warningText: string;
        error: string;
        errorBg: string;
        errorText: string;
        info: string;
        infoBg: string;
        infoText: string;
        neutral: string;
        neutralBg: string;
        neutralText: string;
    };
    dark: {
        background: string;
        surface: string;
        primary: string;
        text: string;
        textMuted: string;
        border: string;
    };
    typography: {
        fontFamily: string;
        fontWeights: {
            regular: string;
            medium: string;
            semibold: string;
            bold: string;
        };
        fontSizes: {
            screenTitle: {
                small: number;
                large: number;
            };
            body: number;
            secondary: number;
            chip: number;
        };
    };
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    borderRadius: {
        card: number;
        button: {
            small: number;
            large: number;
        };
        chip: {
            small: number;
            large: number;
        };
        input: {
            small: number;
            large: number;
        };
    };
    touchTarget: {
        min: number;
        primaryButton: number;
    };
};
export type Theme = typeof theme;
