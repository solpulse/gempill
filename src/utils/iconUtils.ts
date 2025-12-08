/**
 * Maps medication icon names to valid MaterialCommunityIcons names.
 * Handles legacy data (Ionicons names) and ensures strictly valid MCI names are used.
 */
export const getMedicationIcon = (icon: string | undefined | null): string => {
    if (!icon) return 'pill';

    switch (icon) {
        // Legacy Ionicons mappings
        case 'medkit':
            return 'medical-bag';
        case 'tablet-landscape':
            return 'pill';
        case 'flask':
            return 'flask'; // Exists in both but 'flask' is valid MCI
        case 'water':
            return 'water';

        default:
            return icon;
    }
};
