import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationActionContextType {
    activeTimeGroup: string | null; // The scheduled time string (e.g. "08:00")
    ignoredTimes: string[];
    showNotificationAction: (time: string) => void;
    hideNotificationAction: (timeToIgnore?: string) => void;
}

const NotificationActionContext = createContext<NotificationActionContextType | undefined>(undefined);

export const NotificationActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTimeGroup, setActiveTimeGroup] = useState<string | null>(null);
    const [ignoredTimes, setIgnoredTimes] = useState<string[]>([]);

    const showNotificationAction = (time: string) => {
        setActiveTimeGroup(time);
    };

    const hideNotificationAction = (timeToIgnore?: string) => {
        setActiveTimeGroup(null);
        if (timeToIgnore) {
            setIgnoredTimes(prev => [...prev, timeToIgnore]);
        }
    };

    return (
        <NotificationActionContext.Provider value={{ activeTimeGroup, ignoredTimes, showNotificationAction, hideNotificationAction }}>
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
