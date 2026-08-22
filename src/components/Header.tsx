import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BurgerMenu } from './BurgerMenu';

interface HeaderProps {
    isOffline: boolean;
    onRefresh?: () => void;
    onNavigate?: (screen: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ isOffline, onRefresh, onNavigate }) => {
    const { colors } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <BurgerMenu
                visible={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={(screen) => onNavigate && onNavigate(screen)}
            />

            <View style={styles.topRow}>
                <View style={styles.leftGroup}>
                    <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.burgerBtn}>
                        <Text style={[styles.burgerIcon, { color: colors.textPrimary }]}>☰</Text>
                    </TouchableOpacity>
                    <View style={styles.titleRow}>
                        <Text style={[styles.logoText, { color: colors.accent }]}>X2</Text>
                        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>Forex & Spot</Text>
                    </View>
                </View>

                <View style={styles.rightRow}>
                    <View style={styles.statusRow}>
                        <View style={[styles.dot, { backgroundColor: isOffline ? colors.red : colors.green }]} />
                        <Text style={[styles.statusText, { color: colors.textMuted }]}>
                            {isOffline ? 'OFFLINE' : 'LIVE'}
                        </Text>
                    </View>
                    {onRefresh && (
                        <TouchableOpacity
                            style={[styles.refreshBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                            onPress={onRefresh}
                        >
                            <Text style={[styles.refreshText, { color: colors.textPrimary }]}>↻</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    burgerBtn: { paddingRight: 4 },
    burgerIcon: { fontSize: 20, fontWeight: '700' },
    titleRow: { flexDirection: 'row', alignItems: 'baseline' },
    logoText: { fontSize: 22, fontWeight: '800', marginRight: 6 },
    subtitleText: { fontSize: 12, fontWeight: '500' },
    rightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 5 },
    statusText: { fontSize: 10, fontWeight: '700' },
    refreshBtn: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    refreshText: { fontSize: 14, fontWeight: '700' },
});