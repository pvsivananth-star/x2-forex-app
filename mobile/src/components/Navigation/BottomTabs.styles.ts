import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 6,
        alignItems: 'center',
    },

    tab: {
        flex: 1,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    label: {
        fontSize: 18,
        lineHeight: 22,
        textAlign: 'center',
    },
});
