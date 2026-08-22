import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
    isOffline: boolean;
    lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({ isOffline, lastUpdated }) => {
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.logoText}>X2</Text>
                <Text style={styles.subtitleText}>Forex & Spot</Text>
            </View>
            <View style={styles.statusRow}>
                <View style={[styles.dot, isOffline ? styles.dotOffline : styles.dotOnline]} />
                <Text style={styles.statusText}>
                    {isOffline ? 'OFFLINE (Cached)' : 'LIVE'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    titleRow: { flexDirection: 'row', alignItems: 'baseline' },
    logoText: { fontSize: 24, fontWeight: '800', color: '#38BDF8', marginRight: 6 },
    subtitleText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    dotOnline: { backgroundColor: '#22C55E' },
    dotOffline: { backgroundColor: '#EF4444' },
    statusText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
