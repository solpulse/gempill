import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationActionContextType {
    activeTimeGroup: string | null; // The scheduled time string (e.g. "08:00")
    showNotificationAction: (time: string) => void;
    hideNotificationAction: () => void;
}

const NotificationActionContext = createContext<NotificationActionContextType | undefined>(undefined);

export const NotificationActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTimeGroup, setActiveTimeGroup] = useState<string | null>(null);

    const showNotificationAction = (time: string) => {
        setActiveTimeGroup(time);
    };

    const hideNotificationAction = () => {
        setActiveTimeGroup(null);
    };

    return (
        <NotificationActionContext.Provider value={{ activeTimeGroup, showNotificationAction, hideNotificationAction }}>
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
