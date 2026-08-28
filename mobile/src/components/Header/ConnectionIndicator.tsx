import React from 'react';
import {View} from 'react-native';

export function ConnectionIndicator({online = true}: { online?: boolean }) {
    return <View accessible accessibilityRole="image"
                 accessibilityLabel={online ? 'Live market connection' : 'Offline market connection'}
                 style={{width: 12, height: 12, borderRadius: 6, backgroundColor: online ? '#2E9D57' : '#D32F2F'}}/>
}
