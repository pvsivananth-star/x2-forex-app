import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MarketRate } from '../../models/market';
import { RateInput } from './RateInput';
export function MarketRow({item,editable=false,active=false,onChange}:{item:MarketRate;editable?:boolean;active?:boolean;onChange?:(n:number)=>void}){return <View style={styles.row}><View style={styles.name}><Text style={styles.symbol}>{item.displaySymbol??item.symbol}</Text><Text style={styles.label}>{item.name}</Text></View>{editable?<RateInput value={item.value} active={active} onChange={onChange}/>:<Text>{item.value.toLocaleString(undefined,{maximumFractionDigits:6})}</Text>}</View>}
const styles=StyleSheet.create({row:{minHeight:50,paddingHorizontal:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},name:{flex:1},symbol:{fontWeight:'700'},label:{fontSize:12,opacity:.65}});
