import React from 'react';

import {StyleSheet, Text, TouchableOpacity, View,} from 'react-native';

import {TabCategory,} from '../types';

import {AppColors,} from '../theme';

interface BottomTabsProps {
    activeTab: TabCategory;
    colors: AppColors;
    onChange: (
        tab: TabCategory,
    ) => void;
}

const TABS: {
    key: TabCategory;
    label: string;
    icon: string;
}[] = [
    {
        key: 'fx',
        label: 'Forex',
        icon: 'FX',
    },
    {
        key: 'eq',
        label: 'EQ',
        icon: 'EQ',
    },
    {
        key: 'crypto',
        label: 'Crypto',
        icon: '₿',
    },
    {
        key: 'metals',
        label: 'Metals',
        icon: 'Ag',
    },
    {
        key: 'portfolio',
        label: 'Portfolio',
        icon: '▦',
    },
];

export const BottomTabs: React.FC<
    BottomTabsProps
> = ({
         activeTab,
         colors,
         onChange,
     }) => (
    <View
        style={[
            styles.container,
            {
                backgroundColor:
                colors.surface,

                borderTopColor:
                colors.border,
            },
        ]}
    >
        {TABS.map(
            (tab) => {
                const active =
                    activeTab ===
                    tab.key;

                return (
                    <TouchableOpacity
                        key={
                            tab.key
                        }
                        accessibilityRole="tab"
                        accessibilityState={{
                            selected:
                            active,
                        }}
                        onPress={() =>
                            onChange(
                                tab.key,
                            )
                        }
                        style={
                            styles.tab
                        }
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor:
                                        active
                                            ? colors.accentStrong
                                            : 'transparent',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.icon,
                                    {
                                        color:
                                            active
                                                ? '#FFFFFF'
                                                : colors.muted,
                                    },
                                ]}
                            >
                                {
                                    tab.icon
                                }
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.label,
                                {
                                    color:
                                        active
                                            ? colors.accent
                                            : colors.muted,
                                },
                            ]}
                        >
                            {
                                tab.label
                            }
                        </Text>
                    </TouchableOpacity>
                );
            },
        )}
    </View>
);

const styles =
    StyleSheet.create({
        container: {
            flexDirection:
                'row',
            borderTopWidth: 1,
            paddingHorizontal: 8,
            paddingTop: 6,
            paddingBottom: 7,
        },

        tab: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        iconContainer: {
            width: 32,
            height: 26,
            borderRadius: 8,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        icon: {
            fontSize: 14,
            fontWeight: '900',
        },

        label: {
            fontSize: 10,
            fontWeight: '800',
            marginTop: 2,
        },
    });