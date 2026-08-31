import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {AppHeader} from '../components/Header/AppHeader';

export function DashboardScreen({onOpenSettings}: { onOpenSettings?: () => void }) {
    return <View style={styles.root}>
        <AppHeader title="Dashboard" onMenuPress={onOpenSettings}/>
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Markets</Text>
            <Text style={styles.subtitle}>Your market overview</Text>
            <View style={styles.card}><Text>Forex</Text></View>
            <View style={styles.card}><Text>Crypto</Text></View>
            <View style={styles.card}><Text>Metals</Text></View>
            <View style={styles.card}><Text>Equity</Text></View>
        </ScrollView>
    </View>;
}

const styles = StyleSheet.create({
    root: {flex: 1},
    content: {padding: 16, gap: 12},
    title: {fontSize: 22, fontWeight: '800'},
    subtitle: {opacity: .65},
    card: {padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E2E2'}
});
