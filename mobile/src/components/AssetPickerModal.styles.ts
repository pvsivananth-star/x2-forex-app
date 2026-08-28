import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
    },

    modal: {
        width: '100%',
        height: '88%',
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 18,
        fontWeight: '900',
    },

    count: {
        fontSize: 10,
        marginTop: 3,
        fontWeight: '700',
    },

    close: {
        fontSize: 28,
        lineHeight: 28,
    },

    search: {
        borderWidth: 1,
        borderRadius: 9,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 8,
    },

    results: {
        flex: 1,
    },

    result: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },

    resultText: {
        flex: 1,
        paddingRight: 10,
    },

    symbol: {
        fontSize: 14,
        fontWeight: '900',
    },

    name: {
        fontSize: 11,
        marginTop: 3,
    },

    added: {
        fontSize: 11,
        fontWeight: '900',
    },

    empty: {
        textAlign: 'center',
        paddingVertical: 30,
        fontSize: 13,
    },

    cancel: {
        alignSelf: 'flex-end',
        marginTop: 10,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderWidth: 1,
        borderRadius: 8,
    },
});