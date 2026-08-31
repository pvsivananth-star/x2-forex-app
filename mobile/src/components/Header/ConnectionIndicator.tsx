import React from 'react';
import {View} from 'react-native';
import {styles, dotStyle} from './ConnectionIndicator.styles';

export function ConnectionIndicator({online = true}: { online?: boolean }) {
    return <View accessible accessibilityRole="image" accessibilityLabel={online ? 'Live market connection' : 'Offline market connection'} style={dotStyle(online)}/>
}
