import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Header } from '../components/Header';
import { fetchHistoricalData, ChartPoint } from '../api/chartApi';

const SCREEN_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 180;

export const ChartsScreen = () => {
    const [dataPoints, setDataPoints] = useState<ChartPoint[]>([]);

    useEffect(() => {
        fetchHistoricalData().then(setDataPoints);
    }, []);

    if (dataPoints.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Header isOffline={false} />
                <View style={styles.container}>
                    <Text style={styles.loadingText}>Loading 7-Day Trend Chart...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const rates = dataPoints.map((d) => d.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate || 1;

    const pointsString = dataPoints
        .map((pt, i) => {
            const x = (i / (dataPoints.length - 1)) * SCREEN_WIDTH;
            const y = CHART_HEIGHT - ((pt.rate - minRate) / range) * (CHART_HEIGHT - 30) - 15;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header isOffline={false} />
            <View style={styles.container}>
                <Text style={styles.heading}>USD / EUR (7-Day Trend)</Text>

                <View style={styles.chartCard}>
                    <Svg height={CHART_HEIGHT} width={SCREEN_WIDTH}>
                        <Polyline
                            points={pointsString}
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="3"
                        />
                    </Svg>
                    <View style={styles.statsRow}>
                        <Text style={styles.statLabel}>Low: {minRate.toFixed(4)}</Text>
                        <Text style={styles.statLabel}>High: {maxRate.toFixed(4)}</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#020617' },
    container: { padding: 16, flex: 1 },
    heading: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
    loadingText: { color: '#94A3B8', marginTop: 30, textAlign: 'center' },
    chartCard: {
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingTop: 8,
    },
    statLabel: { fontSize: 12, color: '#A855F7', fontWeight: '600' },
});
