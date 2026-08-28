import React from 'react';
import {View} from 'react-native';
import {AppHeader} from '../components/Header/AppHeader';
import {MarketList} from '../components/Market/MarketList';
import {useMobileStore} from '../state/marketStore';

export function MetalsScreen() {
    const rates = useMobileStore(s => s.visibleRates('metals'));
    return <View style={{flex: 1}}><AppHeader title="Metals"/><MarketList data={rates}/></View>;
}
