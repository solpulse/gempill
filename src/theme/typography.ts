import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
    h1: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    body: {
        fontSize: 16,
        color: colors.text,
    },
    bodySecondary: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    caption: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    button: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.surface,
    },
});
