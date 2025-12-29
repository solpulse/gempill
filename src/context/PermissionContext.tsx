import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform, AppState, AppStateStatus, NativeModules } from 'react-native';
import NotificationService from '../services/NotificationService';
import notifee from '@notifee/react-native';

// Get device manufacturer for vendor-specific handling
const getDeviceManufacturer = (): string => {
    if (Platform.OS !== 'android') return 'unknown';

    // Access device info through React Native's NativeModules
    // This requires the platform constants that are available in RN
    const { PlatformConstants } = NativeModules;
    const brand = PlatformConstants?.Brand?.toLowerCase() ||
        PlatformConstants?.Manufacturer?.toLowerCase() ||
        'unknown';
    return brand;
};

// Categorize manufacturers into vendor types
export type VendorType = 'samsung' | 'xiaomi' | 'pixel' | 'sony' | 'stock';

const getVendorType = (): VendorType => {
    const manufacturer = getDeviceManufacturer();

    if (manufacturer.includes('samsung')) return 'samsung';
    if (manufacturer.includes('xiaomi') || manufacturer.includes('redmi') || manufacturer.includes('poco')) return 'xiaomi';
    if (manufacturer.includes('google')) return 'pixel';
    if (manufacturer.includes('sony')) return 'sony';

    // Default to stock Android behavior for other manufacturers
    return 'stock';
};

export type PermissionType = 'alarm' | 'battery' | 'vendor';

interface PermissionContextType {
    checkPermissions: () => Promise<void>;
    vendorType: VendorType;
    recheckOnResume: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [permissionType, setPermissionType] = useState<PermissionType>('alarm');
    const [vendorType] = useState<VendorType>(getVendorType);
    const appState = useRef(AppState.currentState);
    const pendingCheck = useRef(false);

    // AppState listener to re-check permissions when returning from settings
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                pendingCheck.current
            ) {
                // User returned from settings, re-check permissions
                pendingCheck.current = false;
                setTimeout(() => {
                    checkPermissionsInternal(true);
                }, 500); // Small delay to ensure settings have been applied
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const checkPermissionsInternal = async (isRecheck: boolean = false): Promise<void> => {
        if (Platform.OS !== 'android') {
            await notifee.requestPermission();
            return;
        }

        // 1. Check Basic Notification Permission
        const settings = await notifee.getNotificationSettings();
        if (settings.authorizationStatus !== 1) { // 1 = AUTHORIZED
            await notifee.requestPermission();
        }

        // 2. Check for Exact Alarm Permission (Android 12+)
        if (Platform.Version >= 31) {
            const updatedSettings = await notifee.getNotificationSettings();
            if (updatedSettings.android.alarm !== 1) { // 1 = AUTHORIZED
                if (!isRecheck) {
                    setPermissionType('alarm');
                    setModalVisible(true);
                    return;
                }
                // On recheck, if still not granted, show modal again
                // but don't block - continue to battery check
            }
        }

        // 3. Check for Battery Optimization
        const battery = await notifee.isBatteryOptimizationEnabled();
        if (battery) {
            setPermissionType('battery');
            setModalVisible(true);
            return;
        }

        // 4. For vendor-specific ROMs (Xiaomi, Samsung), suggest additional settings
        // Only show vendor instructions on first check, not on resume recheck
        if (!isRecheck && (vendorType === 'xiaomi' || vendorType === 'samsung')) {
            // We could show vendor-specific modal here, but it's been moved to
            // the modal component itself with instructions
        }
    };

    const checkPermissions = async (): Promise<void> => {
        await checkPermissionsInternal(false);
    };

    const recheckOnResume = () => {
        pendingCheck.current = true;
    };

    const handleOpenSettings = async () => {
        setModalVisible(false);
        pendingCheck.current = true; // Set flag to recheck when returning

        if (permissionType === 'alarm') {
            await notifee.openAlarmPermissionSettings();
        } else if (permissionType === 'battery') {
            await notifee.openBatteryOptimizationSettings();
        } else if (permissionType === 'vendor') {
            // For vendor-specific settings, open power manager
            await notifee.openPowerManagerSettings();
        }
    };

    const handleDismiss = () => {
        setModalVisible(false);

        // Chain to next permission check if they dismissed current one
        if (permissionType === 'alarm') {
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
    };

    return (
        <PermissionContext.Provider value={{ checkPermissions, vendorType, recheckOnResume }}>
            {children}
            <PermissionRequestModalInternal
                visible={modalVisible}
                type={permissionType}
                vendorType={vendorType}
                onDismiss={handleDismiss}
                onOpenSettings={handleOpenSettings}
            />
        </PermissionContext.Provider>
    );
};

// Internal component wrapper
import { PermissionRequestModal } from '../components/PermissionRequestModal';

const PermissionRequestModalInternal = PermissionRequestModal;

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};
