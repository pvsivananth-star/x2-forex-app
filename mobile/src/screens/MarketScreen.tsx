import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MarketAsset, TabCategory } from '../models';
import { TENOR_OPTIONS } from '../MobileService';
import { EditRow } from '../components/EditRow';
import { MarketRow } from '../components/MarketRow';
import { styles } from './styles';

interface Props {
  activeTab: TabCategory;
  isEditMode: boolean;
  visibleAssets: MarketAsset[];
  decimalPlaces: number;
  colors: any;
  draftRates: Record<string, string>;
  onDraftChange: (symbol: string, value: string) => void;
  onCommit: (symbol: string, value: string) => void;
  focusedSymbol: string | null;
  setFocusedSymbol: (s: string | null) => void;
  moveRow: (index: number, direction: -1 | 1) => void;
  removeAsset: (symbol: string) => void;
  openPicker: () => void;
  tenorOpen: boolean;
  setTenorOpen: (v: boolean) => void;
  activeTenor: typeof TENOR_OPTIONS[number];
  changeTenor: (v: typeof TENOR_OPTIONS[number]) => void;
  onCancel: () => void;
  onApply: () => void;
}

const MarketScreen: React.FC<Props> = ({
  activeTab,
  isEditMode,
  visibleAssets,
  decimalPlaces,
  colors,
  draftRates,
  onDraftChange,
  onCommit,
  focusedSymbol,
  setFocusedSymbol,
  moveRow,
  removeAsset,
  openPicker,
  tenorOpen,
  setTenorOpen,
  activeTenor,
  changeTenor,
}) => {
  return (
    <>
      {!isEditMode && (
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}> 
          <Text style={[styles.headerCell, styles.assetHeader, { color: colors.dim }]}>Asset</Text>

          <Text style={[styles.headerCell, styles.rateHeader, { color: colors.dim }]}>Rate</Text>

          <TouchableOpacity onPress={() => setTenorOpen((open) => !open)} style={[styles.tenorHeader]}>
            <Text style={[styles.headerCell, { color: colors.dim }]}>% {activeTenor} ▾</Text>
          </TouchableOpacity>
        </View>
      )}

      {tenorOpen && !isEditMode && (
        <View style={[styles.tenorMenu, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
          {TENOR_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => changeTenor(option)}
              style={[styles.tenorOption, option === activeTenor && { backgroundColor: colors.accentStrong }]}
            >
              <Text style={{ color: option === activeTenor ? '#FFFFFF' : colors.text, fontWeight: '800' }}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={isEditMode ? styles.editContent : styles.marketContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        {isEditMode && (
          <View style={[styles.editInfo, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}> 
            <Text style={[styles.editInfoText, { color: colors.muted }]}>Add, remove or move assets. Changes apply only to this market.</Text>
          </View>
        )}

        {visibleAssets.map((asset, index) =>
          isEditMode ? (
            <EditRow
              key={asset.symbol}
              asset={asset}
              index={index}
              count={visibleAssets.length}
              locked={(activeTab === 'fx' || activeTab === 'crypto' || activeTab === 'metals') && asset.symbol === 'USD'}
              colors={colors}
              onMove={moveRow}
              onRemove={removeAsset}
            />
          ) : (
            <MarketRow
              key={asset.symbol}
              asset={asset}
              decimalPlaces={decimalPlaces}
              colors={colors}
              draftValue={draftRates[asset.symbol]}
              onDraftChange={onDraftChange}
              onCommit={onCommit}
              active={asset.symbol === focusedSymbol}
              onActivate={() => setFocusedSymbol(asset.symbol)}
              onDeactivate={() => setFocusedSymbol(null)}
            />
          ),
        )}

        {isEditMode && (
          <TouchableOpacity onPress={openPicker} style={[styles.addButton, { borderColor: colors.accent, backgroundColor: colors.surfaceElevated }]}> 
            <Text style={[styles.addText, { color: colors.accent }]}>+ Add {activeTab === 'fx' ? 'Currency' : activeTab === 'crypto' ? 'Crypto' : 'Metal'}</Text>
          </TouchableOpacity>
        )}

        {!isEditMode && visibleAssets.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No assets selected</Text>
          </View>
        )}
      </ScrollView>

      {isEditMode && (
        <View style={[styles.editFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}> 
          <TouchableOpacity onPress={onCancel} style={[styles.footerButton, { borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontWeight: '900' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onApply()} style={[styles.footerButton, { backgroundColor: colors.accentStrong, borderColor: colors.accentStrong }]}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default MarketScreen;
