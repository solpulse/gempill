import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MedicationIcon } from './MedicationIcon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Text as PaperText } from 'react-native-paper';

interface MedicationListItemProps {
    name: string;
    details: string;
    iconColor?: string;
    icon?: string;
    onPress?: () => void;
}

export const MedicationListItem: React.FC<MedicationListItemProps> = ({
    name,
    details,
    iconColor,
    icon = 'pill',
    onPress
}) => {
    const theme = useTheme();

    return (
        <TouchableOpacity 
            style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} 
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
                <MedicationIcon name={icon} size={22} color={theme.colors.primary} />
            </View>

            <View style={styles.textContainer}>
                <PaperText variant="titleMedium" style={[styles.name, { color: theme.colors.primary }]}>{name}</PaperText>
                <PaperText variant="bodySmall" style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>{details}</PaperText>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32, // theme.roundness.lg
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14, // Squircle
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
    },
});
