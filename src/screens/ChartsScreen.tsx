import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Header } from '../components/Header';
import { fetchHistoricalData, ChartPoint } from '../api/chartApi';

const SCREEN_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 180;

export const ChartsScreen = () => {
    const [dataPoints, setDataPoints] = useState<ChartPoint[]>([]);

    useEffect(() => {
        fetchHistoricalData().then(setDataPoints);
    }, []);

    // Compute points safely without early returns breaking React hook lifecycle
    const hasData = dataPoints.length > 0;
    const rates = hasData ? dataPoints.map((d) => d.rate) : [1];
    const minRate = hasData ? Math.min(...rates) : 0;
    const maxRate = hasData ? Math.max(...rates) : 1;
    const range = maxRate - minRate || 1;

    const pointsString = hasData
        ? dataPoints
            .map((pt, i) => {
                const x = (i / (dataPoints.length - 1)) * SCREEN_WIDTH;
                const y = CHART_HEIGHT - ((pt.rate - minRate) / range) * (CHART_HEIGHT - 30) - 15;
                return `${x},${y}`;
            })
            .join(' ')
        : '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header isOffline={false} />
            <View style={styles.container}>
                <Text style={styles.heading}>USD / EUR (7-Day Trend)</Text>

                {!hasData ? (
                    <View style={styles.chartCard}>
                        <Text style={styles.loadingText}>Loading 7-Day Trend Chart...</Text>
                    </View>
                ) : (
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
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#020617' },
    container: { padding: 16, flex: 1 },
    heading: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
    loadingText: { color: '#94A3B8', marginVertical: 40, textAlign: 'center' },
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