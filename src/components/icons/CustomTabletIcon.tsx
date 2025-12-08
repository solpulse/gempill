import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

interface CustomTabletIconProps {
    size?: number;
    color?: string;
    style?: any;
}

export const CustomTabletIcon: React.FC<CustomTabletIconProps> = ({
    size = 24,
    color = '#000',
    style
}) => {
    // Determine the viewbox size. We'll design on a 24x24 grid to match Material Design icons.
    const viewBoxSize = 24;

    // Circle parameters
    const cx = 12;
    const cy = 12;
    // Radius slightly smaller than 12 to account for stroke width if outline, or fill.
    // We want a filled icon style to match standard filled icons, or outline if that's the style.
    // User requested "round tablet" - typically solid color or thick outline.
    // Let's go with a thick outline style similar to MCI outline icons.
    const r = 10;
    const strokeWidth = 2;

    // Diagonal line
    // Angle: 45 degrees, passing through center.
    // Coordinate calculation:
    // x = cx + r * cos(theta)
    // y = cy + r * sin(theta)
    // 45 deg = PI/4
    // adjusted for padding inside circle
    const padding = 3;
    const x1 = 12 + (r - padding) * Math.cos(Math.PI / 4);
    const y1 = 12 - (r - padding) * Math.sin(Math.PI / 4); // y goes down, so minus for 'up' visual
    const x2 = 12 - (r - padding) * Math.cos(Math.PI / 4);
    const y2 = 12 + (r - padding) * Math.sin(Math.PI / 4);

    return (
        <Svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            style={style}
        >
            {/* Outline Circle */}
            <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
            />
            {/* Diagonal Line - visual "upper right" to "lower left" to look dynamic */}
            <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </Svg>
    );
};
