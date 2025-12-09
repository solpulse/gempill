import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationActionData {
    doseId: string;
    medicationId: string;
    medName: string;
    scheduledTime: string;
}

interface NotificationActionContextType {
    activeNotification: NotificationActionData | null;
    showNotificationAction: (data: NotificationActionData) => void;
    hideNotificationAction: () => void;
}

const NotificationActionContext = createContext<NotificationActionContextType | undefined>(undefined);

export const NotificationActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeNotification, setActiveNotification] = useState<NotificationActionData | null>(null);

    const showNotificationAction = (data: NotificationActionData) => {
        setActiveNotification(data);
    };

    const hideNotificationAction = () => {
        setActiveNotification(null);
    };

    return (
        <NotificationActionContext.Provider value={{ activeNotification, showNotificationAction, hideNotificationAction }}>
            {children}
        </NotificationActionContext.Provider>
    );
};

export const useNotificationAction = () => {
    const context = useContext(NotificationActionContext);
    if (!context) {
        throw new Error('useNotificationAction must be used within a NotificationActionProvider');
    }
    return context;
};
