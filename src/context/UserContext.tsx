import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
    name: string;
    age: string;
    weight: string;
}

interface UserContextType {
    userProfile: UserProfile;
    hasCompletedOnboarding: boolean;
    isLoading: boolean;
    updateUserProfile: (profile: Partial<UserProfile>) => void;
    completeOnboarding: () => Promise<void>;
    resetOnboarding: () => Promise<void>; // For debug/testing
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: '',
        age: '',
        weight: ''
    });
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const STORAGE_KEY_PROFILE = '@user_profile';
    const STORAGE_KEY_ONBOARDING = '@onboarding_complete';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileJson, onboardingStatus] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_PROFILE),
                AsyncStorage.getItem(STORAGE_KEY_ONBOARDING)
            ]);

            let profile: UserProfile | null = null;
            if (profileJson) {
                profile = JSON.parse(profileJson);
                setUserProfile(profile!);
            }

            // Only consider onboarding complete if we have a name
            if (onboardingStatus === 'true' && profile && profile.name) {
                setHasCompletedOnboarding(true);
            } else {
                // If inconsistent state (flag true but no profile), reset flag
                if (onboardingStatus === 'true') {
                    await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'false');
                }
                setHasCompletedOnboarding(false);
            }
        } catch (e) {
            console.error('Failed to load user data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (profile: Partial<UserProfile>) => {
        const newProfile = { ...userProfile, ...profile };
        setUserProfile(newProfile);
        try {
            await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
        } catch (e) {
            console.error('Failed to save user profile', e);
        }
    };

    const completeOnboarding = async () => {
        setHasCompletedOnboarding(true);
        try {
            await AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
        } catch (e) {
            console.error('Failed to save onboarding status', e);
        }
    };

    const resetOnboarding = async () => {
        setHasCompletedOnboarding(false);
        setUserProfile({ name: '', age: '', weight: '' });
        try {
            await AsyncStorage.multiRemove([STORAGE_KEY_PROFILE, STORAGE_KEY_ONBOARDING]);
        } catch (e) {
            console.error('Failed to reset onboarding', e);
        }
    };

    return (
        <UserContext.Provider value={{
            userProfile,
            hasCompletedOnboarding,
            isLoading,
            updateUserProfile,
            completeOnboarding,
            resetOnboarding
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
