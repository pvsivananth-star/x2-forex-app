import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },

    assetHeader: {
        flex: 2,
    },

    rateHeader: {
        flex: 1.5,
        fontSize: 10,
        fontWeight: '800',
    },

    changeHeader: {
        flex: 1,
        alignItems: 'flex-end',
    },

    headerText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 57,
        borderBottomWidth: 1,
    },

    asset: {
        flex: 2,
        justifyContent: 'center',
    },

    symbol: {
        fontSize: 14,
        fontWeight: '700',
    },

    name: {
        fontSize: 10,
        marginTop: 2,
    },

    rate: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    
    input: {
        minWidth: 105,
        height: 38,
        paddingHorizontal: 8,
        textAlign: 'right',
        borderWidth: 1,
        borderRadius: 6,
        fontSize: 14,
    },

    change: {
        flex: 1,
        alignItems: 'flex-end',
    },

    changeText: {
        fontSize: 12,
        fontWeight: '700',
    },
});