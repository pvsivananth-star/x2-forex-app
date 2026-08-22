import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';

export const PortfolioScreen = () => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header isOffline={false} />
            <View style={styles.container}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={styles.icon}>🚧</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Portfolio Tracker</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Under Construction — Custom asset allocation and holding calculations coming soon.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        maxWidth: 320,
    },
    icon: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});