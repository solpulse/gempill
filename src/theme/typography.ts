import { StyleSheet } from 'react-native';
// import { colors } from './colors';

export const typography = StyleSheet.create({
    h1: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1C1E', // colors.text
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1C1E', // colors.text
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1C1E', // colors.text
    },
    body: {
        fontSize: 16,
        color: '#1A1C1E', // colors.text
    },
    bodySecondary: {
        fontSize: 16,
        color: '#49454F', // colors.textSecondary
    },
    caption: {
        fontSize: 14,
        color: '#49454F', // colors.textSecondary
    },
    button: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF', // colors.surface
    },
});

export const fontConfig = {
    web: {
        regular: {
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'sans-serif-medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'sans-serif-light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'sans-serif-thin',
            fontWeight: 'normal',
        },
    },
    ios: {
        regular: {
            fontFamily: 'System',
            fontWeight: '400',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300',
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100',
        },
    },
    android: {
        regular: {
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'sans-serif-medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'sans-serif-light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'sans-serif-thin',
            fontWeight: 'normal',
        },
    },
};
