import React from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { Dialog, Portal, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VendorType, PermissionType } from '../context/PermissionContext';

interface PermissionRequestModalProps {
    visible: boolean;
    type: PermissionType;
    vendorType: VendorType;
    onDismiss: () => void;
    onOpenSettings: () => void;
}

// Vendor-specific instruction sets
const getAlarmInstructions = (vendor: VendorType): { steps: string[]; note?: string } => {
    switch (vendor) {
        case 'samsung':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Find "Alarms & reminders"',
                    'Toggle the switch ON',
                ],
                note: 'On One UI, also check: Settings → Apps → Gempill → Battery → Unrestricted',
            };
        case 'xiaomi':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Enable "Alarms & reminders"',
                    'Then go to: Settings → Apps → Manage apps → Gempill',
                    'Enable "Autostart" permission',
                ],
                note: 'MIUI may also require: Security → Battery saver → No restrictions',
            };
        case 'sony':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Enable "Alarms & reminders"',
                ],
                note: 'Sony devices: Also check Settings → Battery → Adaptive battery → Gempill',
            };
        case 'pixel':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Find "Alarms & reminders"',
                    'Toggle the switch ON',
                ],
            };
        default: // stock Android
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Find "Alarms & reminders" or "Schedule exact alarms"',
                    'Toggle the switch ON',
                ],
            };
    }
};

const getBatteryInstructions = (vendor: VendorType): { steps: string[]; note?: string } => {
    switch (vendor) {
        case 'samsung':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Tap "Battery"',
                    'Select "Unrestricted"',
                ],
                note: 'One UI: Also remove Gempill from "Sleeping apps" in Device Care',
            };
        case 'xiaomi':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Tap "Battery saver"',
                    'Select "No restrictions"',
                ],
                note: 'MIUI: Also enable "Autostart" in Security app → Permissions',
            };
        case 'sony':
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Tap "Battery"',
                    'Select "Unrestricted"',
                ],
                note: 'Also check: Settings → Apps → Special access → Battery optimization',
            };
        default: // pixel, stock
            return {
                steps: [
                    'Tap "Open Settings" below',
                    'Tap "App battery usage" or "Battery"',
                    'Select "Unrestricted" or disable optimization',
                ],
            };
    }
};

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
    visible,
    type,
    vendorType,
    onDismiss,
    onOpenSettings,
}) => {
    const theme = useTheme();

    const isAlarm = type === 'alarm';
    const isBattery = type === 'battery';

    const title = isAlarm ? 'Enable Reminders' : isBattery ? 'Disable Battery Saver' : 'Enable Background Access';
    const iconName = isAlarm ? 'alarm-check' : isBattery ? 'battery-off' : 'cellphone-cog';

    const bodyText = isAlarm
        ? 'To ensure you receive your medication reminders on time, Gempill needs permission to schedule exact alarms.'
        : isBattery
            ? 'Battery optimizations may delay your reminders. Please ensure Gempill is set to "Unrestricted" or "No Restrictions".'
            : 'Your device may restrict background apps. Please allow Gempill to run in the background.';

    const instructions = isAlarm
        ? getAlarmInstructions(vendorType)
        : getBatteryInstructions(vendorType);

    const openHelpLink = () => {
        // Links to device-specific instructions
        const baseUrl = 'https://dontkillmyapp.com/';
        const vendorPath = vendorType === 'samsung' ? 'samsung'
            : vendorType === 'xiaomi' ? 'xiaomi'
                : vendorType === 'sony' ? 'sony'
                    : vendorType === 'pixel' ? 'google'
                        : '';
        Linking.openURL(baseUrl + vendorPath);
    };

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

                    {/* Steps */}
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {instructions.steps.map((step, index) => (
                            `${index + 1}. ${step}\n`
                        )).join('')}
                    </Text>

                    {/* Vendor-specific note */}
                    {instructions.note && (
                        <View style={styles.noteContainer}>
                            <MaterialCommunityIcons
                                name="information-outline"
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text variant="labelSmall" style={[styles.noteText, { color: theme.colors.primary }]}>
                                {instructions.note}
                            </Text>
                        </View>
                    )}

                    {/* Help link */}
                    <Button
                        mode="text"
                        compact
                        onPress={openHelpLink}
                        style={styles.helpLink}
                    >
                        Need more help? View device guide
                    </Button>
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
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        padding: 8,
        backgroundColor: 'rgba(103, 80, 164, 0.08)',
        borderRadius: 8,
        gap: 8,
    },
    noteText: {
        flex: 1,
        lineHeight: 18,
    },
    helpLink: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
});
