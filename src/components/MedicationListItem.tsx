import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MedicationIcon } from './MedicationIcon';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

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
    // Default to tertiary container if no color provided, similar to successLight
    const backgroundColor = iconColor || theme.colors.tertiaryContainer;

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
                <MedicationIcon name={icon} size={24} color={theme.colors.onSurface} />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
                <Text style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>{details}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
    },
});
