import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notifee = require('@notifee/react-native').default;
import NotificationService from '../services/NotificationService';

interface PermissionContextType {
    checkAndPromptExactAlarm: () => Promise<boolean>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const [showModal, setShowModal] = useState(false);

    const checkAndPromptExactAlarm = async (): Promise<boolean> => {
        if (Platform.OS !== 'android' || Platform.Version < 31) {
            return true;
        }

        const settings = await notifee.getNotificationSettings();
        if (settings.android.alarm === 1) { // 1 = AUTHORIZED
            return true;
        }

        // Not authorized, show modal
        setShowModal(true);
        return false;
    };

    const handleOpenSettings = async () => {
        setShowModal(false);
        await notifee.openAlarmPermissionSettings();
    };

    const handleDismiss = () => {
        setShowModal(false);
    };

    return (
        <PermissionContext.Provider value={{ checkAndPromptExactAlarm }}>
            {children}
            {/* Lazy load modal logic if needed, or just conditional render */}
            {/* Check for circular dependency if importing Component here. It's fine usually. */}
            <PermissionRequestModalInternal
                visible={showModal}
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
