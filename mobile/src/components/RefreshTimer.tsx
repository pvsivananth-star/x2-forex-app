import React from 'react';

import {StyleSheet, TouchableOpacity, View,} from 'react-native';

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

const styles =
    StyleSheet.create({
        button: {
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        ring: {
            width: 25,
            height: 25,
            borderRadius: 13,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        segment: {
            position: 'absolute',
            width: 2.5,
            height: 6,
            borderRadius: 1.5,
        },

        inner: {
            width: 17,
            height: 17,
            borderRadius: 9,
        },
    });