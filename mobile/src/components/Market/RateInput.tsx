import React from 'react';
import { TextInput } from 'react-native';
export function RateInput({value,active,onChange}:{value:number;active?:boolean;onChange?:(value:number)=>void}){return <TextInput value={active?String(value):undefined} placeholder={String(value)} keyboardType="decimal-pad" onChangeText={v=>{const n=Number(v);if(Number.isFinite(n)&&n>0)onChange?.(n)}} style={{minWidth:84,textAlign:'right'}}/>}
