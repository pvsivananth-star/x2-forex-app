import React from 'react';
import { BottomTabs as Tabs } from '../../components/Navigation/BottomTabs';
import { useMobileStore } from '../../../state/marketStore';

export function BottomTabs() {
  const activeTab = useMobileStore(s => s.activeTab);
  const setActiveTab = useMobileStore(s => s.setActiveTab);
  return <Tabs activeTab={activeTab} onChange={setActiveTab} />;
}
