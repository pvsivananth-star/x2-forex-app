import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    TabCategory,
} from '../MobileService';

interface BottomTabsProps {
    activeTab: TabCategory;
    colors: any;
    onChange: (tab: TabCategory) => void;
}

const TABS: {
    key: TabCategory;
    label: string;
    icon: string;
}[] = [
    {
        key: 'fx',
        label: 'Forex',
        icon: '💱',
    },
    {
        key: 'crypto',
        label: 'Crypto',
        icon: '₿',
    },
    {
        key: 'metals',
        label: 'Metals',
        icon: '🪙',
    },
    {
        key: 'portfolio',
        label: 'Portfolio',
        icon: '📊',
    },
];

export const BottomTabs: React.FC<
    BottomTabsProps
> = ({
         activeTab,
         colors,
         onChange,
     }) => {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            ]}
        >
            {TABS.map((tab) => {
                const active =
                    activeTab === tab.key;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        accessibilityRole="tab"
                        accessibilityState={{
                            selected: active,
                        }}
                        onPress={() =>
                            onChange(tab.key)
                        }
                        style={[
                            styles.tab,
                            active && {
                                backgroundColor:
                                colors.accentStrong,
                            },
                        ]}
                    >
                        <Text style={styles.icon}>
                            {tab.icon}
                        </Text>

                        <Text
                            style={[
                                styles.label,
                                {
                                    color: active
                                        ? '#ffffff'
                                        : colors.muted,
                                },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: 6,
        paddingTop: 5,
        paddingBottom: 5,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        paddingVertical: 5,
        marginHorizontal: 2,
    },

    icon: {
        fontSize: 16,
        marginBottom: 2,
    },

    label: {
        fontSize: 10,
        fontWeight: '800',
    },
});