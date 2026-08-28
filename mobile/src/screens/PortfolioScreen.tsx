import React from 'react';
import {Text, View} from 'react-native';
import {AppHeader} from '../components/Header/AppHeader';

export function PortfolioScreen() {
    return <View style={{flex: 1}}><AppHeader title="Portfolio"/><View
        style={{padding: 16}}><Text>Portfolio</Text></View></View>
}
