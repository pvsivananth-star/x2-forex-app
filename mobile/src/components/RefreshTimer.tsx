import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface RefreshTimerProps {
    countdown: number;
    totalSeconds: number;
    disabled?: boolean;
    color: string;
    backgroundColor: string;
    onPress: () => void;
}

const DOT_COUNT = 16;

export const RefreshTimer: React.FC<
    RefreshTimerProps
> = ({
         countdown,
         totalSeconds,
         disabled,
         color,
         backgroundColor,
         onPress,
     }) => {
    const progress =
        1 -
        countdown /
        Math.max(totalSeconds, 1);

    const filledCount = Math.round(
        progress * DOT_COUNT,
    );

    return (
        <TouchableOpacity
            accessibilityLabel="Refresh rates"
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPress}
            style={[
                styles.button,
                {
                    opacity: disabled ? 0.45 : 1,
                },
            ]}
        >
            <View
                style={[
                    styles.ring,
                    {
                        borderColor:
                        backgroundColor,
                    },
                ]}
            >
                {Array.from({
                    length: DOT_COUNT,
                }).map((_, index) => {
                    const angle =
                        (index / DOT_COUNT) *
                        360;

                    const active =
                        index < filledCount;

                    return (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        active
                                            ? color
                                            : backgroundColor,

                                    transform: [
                                        {
                                            rotate:
                                                `${angle}deg`,
                                        },
                                        {
                                            translateY:
                                                -11,
                                        },
                                    ],
                                },
                            ]}
                        />
                    );
                })}
            </View>
        </TouchableOpacity>
    );
};

const styles =
    StyleSheet.create({
        button: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
        },

        ring: {
            width: 27,
            height: 27,
            borderRadius: 14,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        dot: {
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: 2,
        },
    });