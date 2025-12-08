import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MedicationIcon } from './MedicationIcon';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

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
    iconColor = colors.successLight,
    icon = 'pill',
    onPress
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
                <MedicationIcon name={icon} size={24} color={colors.text} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.details}>{details}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        ...shadows.small,
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
        color: colors.text,
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});
