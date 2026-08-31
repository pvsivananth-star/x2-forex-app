import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        height: 52,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E2E2'
    },
    menu: {fontSize: 22},
    title: {fontSize: 18, fontWeight: '800', flex: 1},
    actions: {flexDirection: 'row', alignItems: 'center', gap: 12}
});