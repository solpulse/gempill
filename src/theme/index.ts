import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { fontConfig } from './typography';

// Define the base theme extending MD3LightTheme
export const theme = {
    ...MD3LightTheme,
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#5A55D1', // Purple/Blue from design
        primaryContainer: '#E8E7FA', // Light background for icons (using as container)
        secondary: '#5A55D1', // Using primary as secondary for now due to lack of strict secondary color in legacy

        background: '#F8F9FA', // Light gray background
        surface: '#FFFFFF', // White cards
        surfaceVariant: '#E7E0EC', // MD3 Surface Variant

        onSurface: '#1A1C1E', // Dark text
        onSurfaceVariant: '#49454F', // Darker gray for variant content

        error: '#D50000', // Bright Red
        errorContainer: '#FF8A80', // Vibrant Light Red
        onErrorContainer: '#410002', // Dark red text on error container (Guessing contrast)

        // Custom additions often need to be handled via extending types if we were strict TS, 
        // but for now we map closest standard keys or add extensions if we typed it properly.
        // For standard MD3, we stick to standard keys where possible.

        // Re-mapping legacy 'success' to a custom property requires extending the theme type usually.
        // For simplicity in this step, we will use 'tertiary' for success if appropriate or keep it custom.
        tertiary: '#00C853', // Bright Green
        tertiaryContainer: '#B9F6CA', // Vibrant Light Green

        outline: '#E0E0E0', // Light border
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
    },
};

// Extend the RN Paper Theme type to include custom colors inside the theme object if needed
// For now, we'll access them safely or casting.
