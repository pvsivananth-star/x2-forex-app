import React from 'react';

import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    DecimalPlaces,
    ThemePreference,
} from '../types';

import {
    AppColors,
} from '../theme';

interface SettingsModalProps {
    visible: boolean;

    colors: AppColors;

    theme: ThemePreference;

    decimalPlaces: DecimalPlaces;

    onThemeChange: (
        theme: ThemePreference,
    ) => void;

    onDecimalChange: (
        value: DecimalPlaces,
    ) => void;

    onClose: () => void;

    onResetMarketDefaults: () => void;
}

export const SettingsModal: React.FC<
    SettingsModalProps
> = ({
         visible,
         colors,
         theme,
         decimalPlaces,
         onThemeChange,
         onDecimalChange,
         onClose,
         onResetMarketDefaults,
     }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={[
                    styles.backdrop,
                    {
                        backgroundColor:
                        colors.overlay,
                    },
                ]}
            >
                <View
                    style={[
                        styles.modal,
                        {
                            backgroundColor:
                            colors.surfaceElevated,
                            borderColor:
                            colors.border,
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color:
                                    colors.text,
                                },
                            ]}
                        >
                            Settings
                        </Text>

                        <TouchableOpacity
                            onPress={onClose}
                        >
                            <Text
                                style={[
                                    styles.close,
                                    {
                                        color:
                                        colors.muted,
                                    },
                                ]}
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text
                        style={[
                            styles.section,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Appearance
                    </Text>

                    <View style={styles.options}>
                        {(
                            [
                                ['system', 'System'],
                                ['light', 'Light'],
                                ['dark', 'Dark'],
                            ] as const
                        ).map(
                            ([value, label]) => (
                                <TouchableOpacity
                                    key={value}
                                    onPress={() =>
                                        onThemeChange(
                                            value,
                                        )
                                    }
                                    style={[
                                        styles.option,
                                        {
                                            backgroundColor:
                                                theme ===
                                                value
                                                    ? colors.accentStrong
                                                    : colors.surface,

                                            borderColor:
                                                theme ===
                                                value
                                                    ? colors.accent
                                                    : colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color:
                                                theme ===
                                                value
                                                    ? '#FFFFFF'
                                                    : colors.muted,

                                            fontWeight:
                                                '800',
                                        }}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ),
                        )}
                    </View>

                    <Text
                        style={[
                            styles.section,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Decimal Places
                    </Text>

                    <View style={styles.options}>
                        {([2, 3, 4] as const).map(
                            (value) => (
                                <TouchableOpacity
                                    key={value}
                                    onPress={() =>
                                        onDecimalChange(
                                            value,
                                        )
                                    }
                                    style={[
                                        styles.option,
                                        {
                                            backgroundColor:
                                                decimalPlaces ===
                                                value
                                                    ? colors.accentStrong
                                                    : colors.surface,

                                            borderColor:
                                                decimalPlaces ===
                                                value
                                                    ? colors.accent
                                                    : colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color:
                                                decimalPlaces ===
                                                value
                                                    ? '#FFFFFF'
                                                    : colors.muted,

                                            fontWeight:
                                                '800',
                                        }}
                                    >
                                        {value}
                                    </Text>
                                </TouchableOpacity>
                            ),
                        )}
                    </View>

                    <Text
                        style={[
                            styles.section,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Reset App Settings
                    </Text>

                    <Text
                        style={[
                            styles.info,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Caution: Application will reset to system defaults. Your local changes will be overriden.
                    </Text>

                    <TouchableOpacity
                        onPress={onResetMarketDefaults}
                        style={[
                            styles.reset,
                            {
                                backgroundColor:
                                colors.surface,
                                borderColor:
                                colors.warning,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.resetText,
                                {
                                    color:
                                    colors.warning,
                                },
                            ]}
                        >
                            Apply Default Settings
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={[
                            styles.section,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Refresh
                    </Text>

                    <Text
                        style={[
                            styles.info,
                            {
                                color:
                                colors.muted,
                            },
                        ]}
                    >
                        Rates automatically refresh
                        every 3 minutes. Tap the
                        circular control in the header
                        to refresh immediately.
                    </Text>

                    <Text
                        style={[
                            styles.disclaimer,
                            {
                                color:
                                colors.warning,
                                borderColor:
                                colors.border,
                                backgroundColor:
                                colors.surface,
                            },
                        ]}
                    >
                        Disclaimer: Exchange rates
                        provided in this app are for
                        informational and indicative
                        purposes only and do not
                        constitute real-time quotes for
                        trading or financial transactions.
                        The developer assumes no legal
                        liability or responsibility for
                        any financial losses, damages, or
                        decisions made based on the data
                        provided herein.
                    </Text>

                </View>
            </View>
        </Modal>
    );
};

const styles =
    StyleSheet.create({
        backdrop: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 18,
        },

        modal: {
            width: '100%',
            borderRadius: 16,
            borderWidth: 1,
            padding: 18,
        },

        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        title: {
            fontSize: 19,
            fontWeight: '900',
        },

        close: {
            fontSize: 28,
        },

        section: {
            marginTop: 18,
            marginBottom: 8,
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
        },

        options: {
            flexDirection: 'row',
            gap: 7,
        },

        option: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            borderWidth: 1,
            borderRadius: 8,
        },

        info: {
            fontSize: 12,
            lineHeight: 18,
        },

        reset: {
            marginTop: 10,
            paddingVertical: 10,
            borderRadius: 9,
            borderWidth: 1,
            alignItems: 'center',
        },

        resetText: {
            fontWeight: '900',
        },

        disclaimer: {
            marginTop: 10,
            padding: 11,
            borderWidth: 1,
            borderRadius: 9,
            fontSize: 11,
            lineHeight: 17,
            fontWeight: '700',
        },

        done: {
            marginTop: 20,
            paddingVertical: 11,
            borderRadius: 9,
            alignItems: 'center',
        },

        doneText: {
            color: '#FFFFFF',
            fontWeight: '900',
        },
    });