import React from 'react';
import {Pressable, Text, View} from 'react-native';

export function SettingsScreen({onClose}: { onClose: () => void }) {
    return <View style={{flex: 1, padding: 20}}><Text
        style={{fontSize: 22, fontWeight: '800'}}>Settings</Text><Pressable onPress={onClose}
                                                                            style={{marginTop: 20}}><Text>Close</Text></Pressable></View>
}
