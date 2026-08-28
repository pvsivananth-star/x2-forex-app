import React from 'react';
import { BottomTabs as Tabs } from '../../components/Navigation/BottomTabs';
import { marketStore, useStoreSnapshot } from '../../state/marketStore';

export function BottomTabs() {
  const { activeTab } = useStoreSnapshot();
  return (
    <Tabs
      activeTab={activeTab}
      onChange={marketStore.setActiveTab}
    />
  );
}
