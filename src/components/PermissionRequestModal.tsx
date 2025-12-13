import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Dialog, Portal, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PermissionRequestModalProps {
    visible: boolean;
    type: 'alarm' | 'battery';
    onDismiss: () => void;
    onOpenSettings: () => void;
}

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
    visible,
    type,
    onDismiss,
    onOpenSettings,
}) => {
    const theme = useTheme();

    const isAlarm = type === 'alarm';
    const title = isAlarm ? 'Enable Reminders' : 'Disable Battery Saver';
    const iconName = isAlarm ? 'alarm-check' : 'battery-off';

    // Content differences
    const bodyText = isAlarm
        ? 'To ensure you receive your medication reminders on time, Gempill needs permission to schedule exact alarms.'
        : 'Battery optimizations may delay your reminders. Please ensure Gempill is set to "Unrestricted" or "No Restrictions".';

    const steps = isAlarm ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            1. Tap <Text style={{ fontWeight: 'bold' }}>Open Settings</Text> below.{'\n'}
            2. Find <Text style={{ fontWeight: 'bold' }}>Alarms & Reminders</Text>.{'\n'}
            3. Toggle the switch <Text style={{ fontWeight: 'bold' }}>ON</Text>.
        </Text>
    ) : (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            1. Tap <Text style={{ fontWeight: 'bold' }}>Open Settings</Text> below.{'\n'}
            2. Select <Text style={{ fontWeight: 'bold' }}>Battery</Text> or App Battery Usage.{'\n'}
            3. Choose <Text style={{ fontWeight: 'bold' }}>Unrestricted</Text> / No Restrictions.
        </Text>
    );


    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}>
                <Dialog.Icon icon={() => <MaterialCommunityIcons name={iconName} size={32} color={theme.colors.primary} />} />
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {bodyText}
                    </Text>
                    <View style={styles.spacer} />
                    {steps}
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor={theme.colors.secondary}>Cancel</Button>
                    <Button mode="text" onPress={onOpenSettings}>Open Settings</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 28,
    },
    title: {
        textAlign: 'center',
    },
    spacer: {
        height: 16,
    },
});
