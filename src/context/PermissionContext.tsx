import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import NotificationService from '../services/NotificationService';
import notifee from '@notifee/react-native';

interface PermissionContextType {
    checkPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [permissionType, setPermissionType] = useState<'alarm' | 'battery'>('alarm');

    const checkPermissions = async (): Promise<void> => {
        if (Platform.OS === 'android') {
            // 0. Check Basic Notification Permission first
            const settings = await notifee.getNotificationSettings();
            if (settings.authorizationStatus !== 1) { // 1 = AUTHORIZED
                await notifee.requestPermission();
                // We continue to next checks even if they deny, or return? 
                // Usually allow them to continue to next checks which are critical for Alarms.
            }

            // 1. Check for Exact Alarm (Android 12+)
            if (Platform.Version >= 31) {
                const updatedSettings = await notifee.getNotificationSettings(); // Refresh settings
                if (updatedSettings.android.alarm !== 1) { // 1 = AUTHORIZED
                    setPermissionType('alarm');
                    setModalVisible(true);
                    return; // Stop here, wait for user action
                }
            }

            // 2. Check for Battery Optimization
            // Only check if we haven't just shown something else
            const battery = await notifee.isBatteryOptimizationEnabled();
            if (battery) {
                setPermissionType('battery');
                setModalVisible(true);
            }
        } else {
            // iOS / other
            await notifee.requestPermission();
        }
    };

    const handleOpenSettings = async () => {
        setModalVisible(false); // Close first
        if (permissionType === 'alarm') {
            await notifee.openAlarmPermissionSettings();
        } else {
            await notifee.openBatteryOptimizationSettings();
        }
        // Ideally, we'd loop back to checkPermissions() on app resume, 
        // which AppState listener in App.tsx or similar could trigger, 
        // or just rely on next startup if critical.
        // For simpler UX, we won't force-loop immediately to avoid nagging loop traps.
    };

    const handleDismiss = () => {
        setModalVisible(false);
        // If they dismissed Alarm, we MIGHT want to check Battery anyway?
        // Let's chain it.
        if (permissionType === 'alarm') {
            // Check battery next even if they ignored alarm? 
            // Probably better to check battery optimization regardless.
            setTimeout(() => {
                checkBatteryOnly();
            }, 500);
        }
    };

    const checkBatteryOnly = async () => {
        if (Platform.OS === 'android') {
            const battery = await notifee.isBatteryOptimizationEnabled();
            if (battery) {
                setPermissionType('battery');
                setModalVisible(true);
            }
        }
    }

    return (
        <PermissionContext.Provider value={{ checkPermissions }}>
            {children}
            <PermissionRequestModalInternal
                visible={modalVisible}
                type={permissionType}
                onDismiss={handleDismiss}
                onOpenSettings={handleOpenSettings}
            />
        </PermissionContext.Provider>
    );
};

// Internal component to avoid circular dependency issues if any, 
// though importing the component directly is usually fine.
import { PermissionRequestModal } from '../components/PermissionRequestModal';

const PermissionRequestModalInternal = PermissionRequestModal;

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};
