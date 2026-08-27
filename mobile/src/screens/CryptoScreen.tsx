import React from 'react';
import { View } from 'react-native';
import { AppHeader } from '../components/Header/AppHeader';
import { MarketList } from '../components/Market/MarketList';
import { useMobileStore } from '../state/marketStore';

export function CryptoScreen() {
  const rates = useMobileStore(s => s.visibleRates('crypto'));
  return <View style={{flex:1}}><AppHeader title="Crypto"/><MarketList data={rates}/></View>;
}
