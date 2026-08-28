import React from 'react';
import {View} from 'react-native';

import {AppHeader} from '../components/Header/AppHeader';
import {MarketList} from '../components/Market/MarketList';
import {useMobileStore} from '../state/marketStore';

export function EquityScreen() {
    const rates = useMobileStore(
        s => s.visibleRates('equity'),
    );

    return (
        <View style={{flex: 1}}>
            <AppHeader title="EQ"/>
            <MarketList data={rates}/>
        </View>
    );
}