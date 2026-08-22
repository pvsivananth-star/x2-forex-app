import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width - 32;
const CHART_HEIGHT = 240;

interface DataPoint {
    price: number;
    volume: number;
}

// Generate realistic synthetic price & volume series with trend & noise
const generateMockData = (base: number, volatility: number, count = 220): DataPoint[] => {
    const points: DataPoint[] = [];
    let current = base;
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.49) * volatility;
        current = Math.max(current + change, base * 0.5);
        const volume = Math.floor(Math.random() * 5000) + 1000;
        points.push({ price: current, volume });
    }
    return points;
};

const PAIRS = [
    { label: 'EUR/USD', basePrice: 1.085, vol: 0.003 },
    { label: 'GBP/USD', basePrice: 1.265, vol: 0.004 },
    { label: 'USD/INR', basePrice: 83.45, vol: 0.25 },
    { label: 'BTC/USD', basePrice: 64500, vol: 800 },
    { label: 'XAU/USD', basePrice: 2380, vol: 15 },
];

export const ChartsScreen = () => {
    const { colors, precision } = useTheme();
    const [selectedPairIndex, setSelectedPairIndex] = useState(0);
    const [showVolume, setShowVolume] = useState(true);
    const [showDMA50, setShowDMA50] = useState(true);
    const [showDMA200, setShowDMA200] = useState(true);
    const [touchIndex, setTouchIndex] = useState<number | null>(null);

    const activePair = PAIRS[selectedPairIndex];

    // Raw price series
    const rawData = useMemo(() => {
        return generateMockData(activePair.basePrice, activePair.vol);
    }, [selectedPairIndex]);

    // Compute Simple Moving Averages (SMA / DMA)
    const calculateDMA = (data: DataPoint[], period: number) => {
        return data.map((_, idx) => {
            if (idx < period - 1) return null;
            const subset = data.slice(idx - period + 1, idx + 1);
            const sum = subset.reduce((acc, curr) => acc + curr.price, 0);
            return sum / period;
        });
    };

    const dma50 = useMemo(() => calculateDMA(rawData, 50), [rawData]);
    const dma200 = useMemo(() => calculateDMA(rawData, 200), [rawData]);

    // Min / Max calculations for SVG scaling
    const prices = rawData.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const maxVolume = Math.max(...rawData.map((d) => d.volume));

    const getX = (index: number) => (index / (rawData.length - 1)) * SCREEN_WIDTH;
    const getY = (val: number) =>
        CHART_HEIGHT - ((val - minPrice) / (maxPrice - minPrice)) * (CHART_HEIGHT - 30) - 15;

    // Build SVG Path strings
    const pricePath = rawData.reduce(
        (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`,
        ''
    );

    const buildDMAPath = (dmaValues: (number | null)[]) => {
        let path = '';
        let started = false;
        dmaValues.forEach((val, i) => {
            if (val !== null) {
                path += `${!started ? 'M' : 'L'} ${getX(i)} ${getY(val)} `;
                started = true;
            }
        });
        return path;
    };

    const dma50Path = useMemo(() => buildDMAPath(dma50), [dma50, minPrice, maxPrice]);
    const dma200Path = useMemo(() => buildDMAPath(dma200), [dma200, minPrice, maxPrice]);

    // Gesture handler for interactive crosshair
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: (evt) => {
                    const x = evt.nativeEvent.locationX;
                    const idx = Math.min(
                        Math.max(0, Math.round((x / SCREEN_WIDTH) * (rawData.length - 1))),
                        rawData.length - 1
                    );
                    setTouchIndex(idx);
                },
                onPanResponderMove: (evt) => {
                    const x = evt.nativeEvent.locationX;
                    const idx = Math.min(
                        Math.max(0, Math.round((x / SCREEN_WIDTH) * (rawData.length - 1))),
                        rawData.length - 1
                    );
                    setTouchIndex(idx);
                },
                onPanResponderRelease: () => setTouchIndex(null),
            }),
        [rawData.length]
    );

    const activePoint = touchIndex !== null ? rawData[touchIndex] : rawData[rawData.length - 1];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <Header isOffline={false} />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Pair Switcher Bar */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pairBar}>
                    {PAIRS.map((pair, idx) => (
                        <TouchableOpacity
                            key={pair.label}
                            style={[
                                styles.pairChip,
                                {
                                    backgroundColor: selectedPairIndex === idx ? colors.accent : colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                            onPress={() => {
                                setSelectedPairIndex(idx);
                                setTouchIndex(null);
                            }}
                        >
                            <Text
                                style={{
                                    color: selectedPairIndex === idx ? '#FFF' : colors.textPrimary,
                                    fontWeight: '700',
                                    fontSize: 12,
                                }}
                            >
                                {pair.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Live / Crosshair HUD Metrics */}
                <View style={[styles.hudCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.hudRow}>
                        <View>
                            <Text style={[styles.hudPairLabel, { color: colors.textMuted }]}>{activePair.label}</Text>
                            <Text style={[styles.hudPrice, { color: colors.accent }]}>
                                {activePoint.price.toFixed(precision)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.hudSub, { color: colors.textMuted }]}>
                                Vol: {activePoint.volume.toLocaleString()}
                            </Text>
                            {touchIndex !== null && (
                                <Text style={[styles.hudCrosshairNotice, { color: colors.green }]}>● Crosshair Active</Text>
                            )}
                        </View>
                    </View>

                    {/* Indicator Overlays Legend readout */}
                    <View style={styles.legendRow}>
                        {showDMA50 && (
                            <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '700' }}>
                                50 DMA: {dma50[touchIndex ?? rawData.length - 1]?.toFixed(precision) ?? 'N/A'}
                            </Text>
                        )}
                        {showDMA200 && (
                            <Text style={{ fontSize: 10, color: '#EC4899', fontWeight: '700' }}>
                                200 DMA: {dma200[touchIndex ?? rawData.length - 1]?.toFixed(precision) ?? 'N/A'}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Overlay Checkboxes */}
                <View style={styles.checkboxRow}>
                    <TouchableOpacity
                        style={[styles.checkBtn, { backgroundColor: colors.inputBg }]}
                        onPress={() => setShowVolume(!showVolume)}
                    >
                        <Text style={{ color: showVolume ? colors.accent : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                            {showVolume ? '☑' : '☐'} Volume
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkBtn, { backgroundColor: colors.inputBg }]}
                        onPress={() => setShowDMA50(!showDMA50)}
                    >
                        <Text style={{ color: showDMA50 ? '#F59E0B' : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                            {showDMA50 ? '☑' : '☐'} 50 DMA
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkBtn, { backgroundColor: colors.inputBg }]}
                        onPress={() => setShowDMA200(!showDMA200)}
                    >
                        <Text style={{ color: showDMA200 ? '#EC4899' : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                            {showDMA200 ? '☑' : '☐'} 200 DMA
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* SVG Chart Canvas */}
                <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} {...panResponder.panHandlers}>
                    <Svg width={SCREEN_WIDTH} height={CHART_HEIGHT}>
                        {/* Volume Histogram Bars */}
                        {showVolume &&
                            rawData.map((d, i) => {
                                const barHeight = (d.volume / maxVolume) * 50;
                                const isUp = i > 0 ? d.price >= rawData[i - 1].price : true;
                                return (
                                    <Rect
                                        key={i}
                                        x={getX(i) - 1}
                                        y={CHART_HEIGHT - barHeight}
                                        width={2}
                                        height={barHeight}
                                        fill={isUp ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}
                                    />
                                );
                            })}

                        {/* 200 DMA Line */}
                        {showDMA200 && dma200Path.length > 0 && (
                            <Path d={dma200Path} stroke="#EC4899" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
                        )}

                        {/* 50 DMA Line */}
                        {showDMA50 && dma50Path.length > 0 && (
                            <Path d={dma50Path} stroke="#F59E0B" strokeWidth="1.5" fill="none" />
                        )}

                        {/* Primary Price Path */}
                        <Path d={pricePath} stroke={colors.accent} strokeWidth="2" fill="none" />

                        {/* Interactive Crosshair & Cursor */}
                        {touchIndex !== null && (
                            <>
                                <Line
                                    x1={getX(touchIndex)}
                                    y1={0}
                                    x2={getX(touchIndex)}
                                    y2={CHART_HEIGHT}
                                    stroke={colors.textMuted}
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                                <Line
                                    x1={0}
                                    y1={getY(rawData[touchIndex].price)}
                                    x2={SCREEN_WIDTH}
                                    y2={getY(rawData[touchIndex].price)}
                                    stroke={colors.textMuted}
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                                <Circle
                                    cx={getX(touchIndex)}
                                    cy={getY(rawData[touchIndex].price)}
                                    r="5"
                                    fill={colors.accent}
                                    stroke="#FFF"
                                    strokeWidth="2"
                                />
                            </>
                        )}
                    </Svg>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 16 },
    pairBar: { flexDirection: 'row', marginBottom: 12 },
    pairChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
    hudCard: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
    hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hudPairLabel: { fontSize: 11, fontWeight: '700' },
    hudPrice: { fontSize: 24, fontWeight: '800' },
    hudSub: { fontSize: 11, fontWeight: '600' },
    hudCrosshairNotice: { fontSize: 10, fontWeight: '700', marginTop: 2 },
    legendRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    checkboxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    checkBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    chartContainer: { borderRadius: 12, borderWidth: 1, paddingVertical: 8, alignItems: 'center', overflow: 'hidden' },
});