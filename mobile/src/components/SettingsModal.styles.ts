import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
    },

    modal: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        padding: 18,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 19,
        fontWeight: '900',
    },

    close: {
        fontSize: 28,
    },

    section: {
        marginTop: 18,
        marginBottom: 8,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },

    options: {
        flexDirection: 'row',
        gap: 7,
    },

    option: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
    },

    info: {
        fontSize: 12,
        lineHeight: 18,
    },

    reset: {
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 9,
        borderWidth: 1,
        alignItems: 'center',
    },

    resetText: {
        fontWeight: '900',
    },

    disclaimer: {
        marginTop: 10,
        padding: 11,
        borderWidth: 1,
        borderRadius: 9,
        fontSize: 11,
        lineHeight: 17,
        fontWeight: '700',
    },

    done: {
        marginTop: 20,
        paddingVertical: 11,
        borderRadius: 9,
        alignItems: 'center',
    },

    doneText: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
});