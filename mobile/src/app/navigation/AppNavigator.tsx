import React from 'react';
import { View } from 'react-native';
import { useSyncExternalStore } from 'react';
import { marketStore } from '../../state/marketStore';
import { BottomTabs } from './BottomTabs';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { ForexScreen } from '../../screens/ForexScreen';
import { CryptoScreen } from '../../screens/CryptoScreen';
import { MetalsScreen } from '../../screens/MetalsScreen';
import { EquityScreen } from '../../screens/EquityScreen';
import { PortfolioScreen } from '../../screens/PortfolioScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';

export function AppNavigator() {
  const tab = useSyncExternalStore(marketStore.subscribe, () => marketStore.get().activeTab, () => 'fx');
  const [settings, setSettings] = React.useState(false);

  if (settings) {
    return <SettingsScreen onClose={() => setSettings(false)} />;
  }

  let screen: React.ReactNode;
  switch (tab) {
    case 'dashboard':
      screen = <DashboardScreen onOpenSettings={() => setSettings(true)} />;
      break;
    case 'crypto':
      screen = <CryptoScreen />;
      break;
    case 'metals':
      screen = <MetalsScreen />;
      break;
    case 'equity':
      screen = <EquityScreen />;
      break;
    case 'portfolio':
      screen = <PortfolioScreen />;
      break;
    case 'fx':
    default:
      screen = <ForexScreen />;
  }

  return <View style={{ flex: 1 }}>{screen}<BottomTabs /></View>;
}
