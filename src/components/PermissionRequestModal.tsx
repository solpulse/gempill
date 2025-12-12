import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Dialog, Portal, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PermissionRequestModalProps {
    visible: boolean;
    onDismiss: () => void;
    onOpenSettings: () => void;
}

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
    visible,
    onDismiss,
    onOpenSettings,
}) => {
    const theme = useTheme();

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}>
                <Dialog.Icon icon={() => <MaterialCommunityIcons name="alarm-check" size={32} color={theme.colors.primary} />} />
                <Dialog.Title style={styles.title}>Enable Reminders</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        To ensure you receive your medication reminders on time, Gempill needs permission to schedule exact alarms.
                    </Text>
                    <View style={styles.spacer} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        1. Tap <Text style={{ fontWeight: 'bold' }}>Open Settings</Text> below.{'\n'}
                        2. Find <Text style={{ fontWeight: 'bold' }}>Alarms & Reminders</Text>.{'\n'}
                        3. Toggle the switch <Text style={{ fontWeight: 'bold' }}>ON</Text>.
                    </Text>
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
