import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 6,
        gap: 5,
    },

    tab: {
        minWidth: 42,
        height: 32,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
    },

    code: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.2,
    },
});
