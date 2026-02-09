import { SvgProps } from 'react-native-svg';

declare module 'lucide-react-native' {
    export interface LucideProps extends SvgProps {
        size?: string | number;
        absoluteStrokeWidth?: boolean;
        'data-testid'?: string;
        // Add missing props that are supported by react-native-svg
        color?: string;
        stroke?: string;
        strokeWidth?: string | number;
        fill?: string;
        opacity?: number;
    }
}
