import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform, AppState, AppStateStatus, NativeModules, Linking, PermissionsAndroid } from 'react-native';
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

import AsyncStorage from '@react-native-async-storage/async-storage'; 

const STORAGE_KEY_BATTERY_NAG = '@battery_nag_ignored';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [permissionType, setPermissionType] = useState<PermissionType>('alarm');
    const [vendorType] = useState<VendorType>(getVendorType);
    const [batteryNagIgnored, setBatteryNagIgnored] = useState(false);
    const appState = useRef(AppState.currentState);
    const pendingCheck = useRef(false);

    useEffect(() => {
        loadNagStatus();
    }, []);

    const loadNagStatus = async () => {
        const ignored = await AsyncStorage.getItem(STORAGE_KEY_BATTERY_NAG);
        if (ignored === 'true') setBatteryNagIgnored(true);
    };

    // AppState listener to re-check permissions when returning from settings
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                pendingCheck.current
            ) {
                // User returned from settings, re-check permissions
                console.log('[PermissionContext] User returned from settings, triggered re-check');
                pendingCheck.current = false;
                setTimeout(() => {
                    checkPermissionsInternal(true);
                }, 800); // Increased delay slightly for better reliability
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

        console.log(`[Permission] Starting check (First Check: ${!isRecheck})`);

        // ---------------------------------------------------------
        // Step 1: Handle Notification (POST_NOTIFICATIONS) for Android 13+
        // ---------------------------------------------------------
        if (Platform.Version >= 33) {
            let hasNoticePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            console.log('[Permission] POST_NOTIFICATIONS status:', hasNoticePerm);
            
            if (!hasNoticePerm) {
                const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                console.log('[Permission] POST_NOTIFICATIONS request result:', result);
                
                // If they just granted it, give the system a moment to propagate
                if (result === 'granted') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                // We DON'T return here; we want to proceed to check other things 
                // but we should check if they granted or denied it for logging
            }
        } else {
            const settings = await notifee.getNotificationSettings();
            if (settings.authorizationStatus !== 1) { // 1 = AUTHORIZED
                const result = await notifee.requestPermission();
                if (result.authorizationStatus === 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // ---------------------------------------------------------
        // Step 2: Handle Exact Alarms (Android 12+)
        // This is where EXEMPTIONS or the manual toggle apply.
        // ---------------------------------------------------------
        if (Platform.Version >= 31) {
            // Sequential Check for Alarms
            let updatedSettings = await notifee.getNotificationSettings();
            let alarmStatus = updatedSettings.android?.alarm;
            console.log('[Permission] Exact alarm status:', alarmStatus);
            
            // On some devices, notifee might need a quick retry if checked right after perms
            if (alarmStatus !== 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
                updatedSettings = await notifee.getNotificationSettings();
                alarmStatus = updatedSettings.android?.alarm;
                console.log('[Permission] Exact alarm status (after retry):', alarmStatus);
            }

            if (alarmStatus !== 1) { // 1 = AUTHORIZED
                console.log('[Permission] Showing Alarm Modal');
                setPermissionType('alarm');
                setModalVisible(true);
                return;
            }
        }

        // ---------------------------------------------------------
        // Step 3: Handle Battery Optimization (Dose Throttling)
        // ---------------------------------------------------------
        if (batteryNagIgnored && !isRecheck) {
            console.log('[Permission] Skipping battery optimization check (User ignored nag)');
        } else {
            const isRestricted = await notifee.isBatteryOptimizationEnabled();
            console.log('[Permission] Battery optimization RESTRICTED:', isRestricted);
            
            if (isRestricted) {
                setPermissionType('battery');
                setModalVisible(true);
                return;
            }
        }

        console.log('[Permission] All critical permissions are verified.');
    };

    const checkPermissions = async (force: boolean = false): Promise<void> => {
        if (force) {
            console.log('[Permission] Manual check triggered, resetting ignore flag temporarily');
            // We don't change the state permanently, just pass it through the logic
        }
        await checkPermissionsInternal(force);
    };

    const recheckOnResume = () => {
        pendingCheck.current = true;
    };

    const handleOpenSettings = async () => {
        setModalVisible(false);
        pendingCheck.current = true; // Set flag to recheck when returning

        if (permissionType === 'alarm') {
            await notifee.openAlarmPermissionSettings();
        } else if (permissionType === 'battery' || permissionType === 'vendor') {
            // Open App Settings page for battery handling natively instead of global app list
            await Linking.openSettings();
        }
    };

    const handleDismiss = async () => {
        setModalVisible(false);

        // If user dismisses battery optimization modal, mark it as ignored
        if (permissionType === 'battery') {
            console.log('[Permission] User dismissed battery nag, marking as ignored');
            setBatteryNagIgnored(true);
            await AsyncStorage.setItem(STORAGE_KEY_BATTERY_NAG, 'true');
        }

        // Chain to next permission check if they dismissed current one (e.g. they skipped alarm, check battery next)
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
