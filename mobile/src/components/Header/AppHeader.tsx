import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConnectionIndicator } from './ConnectionIndicator';
import { RefreshButton } from './RefreshButton';
import { useMobileStore } from '../../state/marketStore';

export function AppHeader({title,onMenuPress}:{title:string;onMenuPress?:()=>void}){
 const online=useMobileStore(s=>s.isOnline); const refresh=useMobileStore(s=>s.forceRefresh);
 return <View style={styles.root}><Pressable onPress={onMenuPress} accessibilityRole="button" accessibilityLabel="Open menu"><Text style={styles.menu}>☰</Text></Pressable><Text style={styles.title}>{title}</Text><View style={styles.actions}><ConnectionIndicator online={online}/><RefreshButton onPress={()=>void refresh()}/></View></View>;
}
const styles=StyleSheet.create({root:{height:52,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:14,borderBottomWidth:1,borderBottomColor:'#E2E2E2'},menu:{fontSize:22},title:{fontSize:18,fontWeight:'800',flex:1},actions:{flexDirection:'row',alignItems:'center',gap:12}});
