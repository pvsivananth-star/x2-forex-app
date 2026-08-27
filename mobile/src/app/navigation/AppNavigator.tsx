import React from 'react';
import { View } from 'react-native';
import { useMobileStore } from '../../../state/marketStore';
import { BottomTabs } from './BottomTabs';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { ForexScreen } from '../../screens/ForexScreen';
import { CryptoScreen } from '../../screens/CryptoScreen';
import { MetalsScreen } from '../../screens/MetalsScreen';
import { EquityScreen } from '../../screens/EquityScreen';
import { PortfolioScreen } from '../../screens/PortfolioScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';

export function AppNavigator() {
  const tab = useMobileStore(s => s.activeTab);
  const [settings, setSettings] = React.useState(false);

  if (settings) {
    return <SettingsScreen onClose={() => setSettings(false)} />;
  }

  const screen = (() => {
    switch (tab) {
      case 'dashboard': return <DashboardScreen onOpenSettings={() => setSettings(true)} />;
      case 'crypto': return <CryptoScreen />;
      case 'metals': return <MetalsScreen />;
      case 'eq': return <EquityScreen />;
      case 'portfolio': return <PortfolioScreen />;
      case 'fx':
      default: return <ForexScreen />;
    }
  })();

  return <View style={{ flex: 1 }}>{screen}<BottomTabs /></View>;
}
