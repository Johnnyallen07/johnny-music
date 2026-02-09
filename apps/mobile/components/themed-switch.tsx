import React from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ThemedSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export function ThemedSwitch({ value, onValueChange }: ThemedSwitchProps) {
    const { isDark } = useTheme();
    const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: value ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [value]);

    const handlePress = () => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onValueChange(!value);
    };

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 34],
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#d1d5db', '#3b82f6'],
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.track,
                    {
                        backgroundColor,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    track: {
        width: 60,
        height: 32,
        borderRadius: 16,
        padding: 2,
        justifyContent: 'center',
    },
    thumb: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
