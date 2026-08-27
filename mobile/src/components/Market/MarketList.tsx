import React from 'react';
import { FlatList } from 'react-native';
import { MarketRate } from '../../models/market';
import { MarketRow } from './MarketRow';
export function MarketList({data,editable=false,onRateChange,activeSymbol}:{data:MarketRate[];editable?:boolean;onRateChange?:(symbol:string,value:number)=>void;activeSymbol?:string|null}){return <FlatList data={data} keyExtractor={x=>x.symbol} renderItem={({item})=><MarketRow item={item} editable={editable&&item.symbol!=='USD'} active={item.symbol===activeSymbol} onChange={v=>onRateChange?.(item.symbol,v)}/>}/>}
