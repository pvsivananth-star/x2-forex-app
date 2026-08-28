import React from 'react';
import {View} from 'react-native';
import {styles} from './ConnectionIndicator.styles';

export function ConnectionIndicator({online = true}: { online?: boolean }) {
    return <View accessible accessibilityRole="image"
                 accessibilityLabel={online ? 'Live market connection' : 'Offline market connection'}
                 style={[styles.dot, {backgroundColor: online ? '#2E9D57' : '#D32F2F'}]}/>
}
