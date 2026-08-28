import React from 'react';

import {TouchableOpacity, View,} from 'react-native';
import {styles} from './RefreshTimer.styles';

interface RefreshTimerProps {
    countdown: number;
    totalSeconds: number;
    disabled?: boolean;
    color: string;
    backgroundColor: string;
    onPress: () => void;
}

const SEGMENTS = 24;

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
        Math.max(
            0,
            Math.min(
                1,
                1 -
                countdown /
                Math.max(
                    totalSeconds,
                    1,
                ),
            ),
        );

    const filled =
        Math.round(
            progress *
            SEGMENTS,
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
                    opacity:
                        disabled
                            ? 0.45
                            : 1,
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
                    length: SEGMENTS,
                }).map(
                    (_, index) => {
                        const angle =
                            (index /
                                SEGMENTS) *
                            360;

                        const active =
                            index <
                            filled;

                        return (
                            <View
                                key={
                                    index
                                }
                                style={[
                                    styles.segment,
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
                                                    -10,
                                            },
                                        ],
                                    },
                                ]}
                            />
                        );
                    },
                )}

                <View
                    style={[
                        styles.inner,
                        {
                            backgroundColor:
                            backgroundColor,
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
};

// styles extracted
