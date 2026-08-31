import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    row: {
        minHeight: 48,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },

    assetColumn: {
        flex: 2,
        paddingRight: 6,
    },

    rateColumn: {
        flex: 1.55,
        alignItems: 'flex-end',
    },

    changeColumn: {
        flex: 0.95,
        alignItems: 'flex-end',
    },

    symbol: {
        fontSize: 13,
        fontWeight: '900',
    },

    name: {
        fontSize: 9,
        marginTop: 1,
    },

    input: {
        minWidth: 88,
        height: 34,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        textAlign: 'right',
        fontSize: 13,
        fontWeight: '800',
    },

    change: {
        fontSize: 11,
        fontWeight: '900',
    },
});