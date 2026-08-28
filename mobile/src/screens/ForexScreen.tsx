import React from 'react';
import {View} from 'react-native';
import {AppHeader} from '../components/Header/AppHeader';
import {MarketList} from '../components/Market/MarketList';
import {useMobileStore} from '../state/marketStore';

export function ForexScreen() {
    const rates = useMobileStore(s => s.visibleRates('fx'));
    const edit = useMobileStore(s => s.setEditedRate);
    const active = useMobileStore(s => s.editedSymbol);
    return <View style={{flex: 1}}><AppHeader title="Forex"/><MarketList data={rates} editable onRateChange={edit}
                                                                         activeSymbol={active}/></View>;
}
