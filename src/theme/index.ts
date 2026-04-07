import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { fontConfig } from './typography';

// Define the base theme extending MD3LightTheme
export const theme = {
    ...MD3LightTheme,
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#324E58', // Slate Blue
        primaryContainer: '#4A6670', // Tonal depth
        onPrimaryContainer: '#FFFFFF',
        
        secondary: '#587C7C', // Muted Teal (from DESIGN.md hints)
        secondaryContainer: '#DDE4E4',

        background: '#FBF9F6', // Warm Stone
        surface: '#FBF9F6', // Warm Stone
        surfaceVariant: '#E4E2DF', // surface-container-highest
        
        onSurface: '#1A1C1E', // Dark text
        onSurfaceVariant: '#49454F',

        error: '#D50000',
        errorContainer: '#FF8A80',

        tertiary: '#738374', // Earthy Sage
        tertiaryContainer: '#DCE5DC',

        outline: '#C2C7CA', // outline-variant (15% opacity use cases)
        outlineVariant: '#E4E2DF',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 20, // Updated 20 spacing token
        xl: 32,
        xxl: 48, // Updated 48 spacing/rounding token
    },
    roundness: {
        lg: 32,
        xl: 48,
    },
};

// Extend the RN Paper Theme type to include custom colors inside the theme object if needed
// For now, we'll access them safely or casting.
