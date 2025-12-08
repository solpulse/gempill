import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomTabletIcon } from './icons/CustomTabletIcon';
import { getMedicationIcon } from '../utils/iconUtils';

interface MedicationIconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

export const MedicationIcon: React.FC<MedicationIconProps> = ({
    name,
    size = 24,
    color = '#000',
    style
}) => {
    // First, map any legacy name to our current valid names
    const resolvedName = getMedicationIcon(name);

    if (resolvedName === 'custom-tablet') {
        return <CustomTabletIcon size={size} color={color} style={style} />;
    }

    // Default to MaterialCommunityIcons for everything else
    // Cast to any because TS might complain about dynamic string names
    return (
        <MaterialCommunityIcons
            name={resolvedName as any}
            size={size}
            color={color}
            style={style}
        />
    );
};
