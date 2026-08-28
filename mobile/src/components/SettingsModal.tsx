import React from 'react';

import {
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {styles, themed} from './SettingsModal.styles';

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
    const s = themed(colors);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={s.backdrop}>
                <View style={s.modal}>
                    <View style={s.header}>
                        <Text style={s.title}>Settings</Text>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={s.close}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.section}>Appearance</Text>

                    <View style={s.options}>
                        {(
                            [
                                ['system', 'System'],
                                ['light', 'Light'],
                                ['dark', 'Dark'],
                            ] as const
                        ).map(([value, label]) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => onThemeChange(value)}
                                style={s.option(theme === value, colors)}
                            >
                                <Text style={s.optionText(theme === value, colors)}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.section}>Decimal Places</Text>

                    <View style={s.options}>
                        {([2, 3, 4] as const).map((value) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => onDecimalChange(value)}
                                style={s.option(decimalPlaces === value, colors)}
                            >
                                <Text style={s.optionText(decimalPlaces === value, colors)}>{value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.section}>Reset App Settings</Text>

                    <Text style={s.info(colors)}>
                        Caution: Application will reset to system defaults. Your local changes will be overriden.
                    </Text>

                    <TouchableOpacity onPress={onResetMarketDefaults} style={s.reset(colors)}>
                        <Text style={s.resetText(colors)}>Apply Default Settings</Text>
                    </TouchableOpacity>

                    <Text style={s.section}>Refresh</Text>

                    <Text style={s.info(colors)}>
                        Rates automatically refresh
                        every 3 minutes. Tap the
                        circular control in the header
                        to refresh immediately.
                    </Text>

                    <Text style={s.disclaimer(colors)}>
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

