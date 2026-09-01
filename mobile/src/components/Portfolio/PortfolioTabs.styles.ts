import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },

    tab: {
        flex: 1,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    code: {
        fontSize: 15,
        lineHeight: 19,
        textAlign: 'center',
        fontWeight: '800',
    },
});
