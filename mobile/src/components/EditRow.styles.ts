import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    row: {
        minHeight: 40,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderRadius: 6,
        marginBottom: 1,
    },

    arrows: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowButton: {
        width: 28,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrow: {
        fontSize: 14,
        fontWeight: '900',
    },

    asset: {
        flex: 1,
        paddingHorizontal: 6,
    },

    symbol: {
        fontSize: 13,
        fontWeight: '900',
    },

    name: {
        fontSize: 9,
        marginTop: 1,
    },

    remove: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    removeText: {
        fontSize: 22,
        fontWeight: '400',
    },
});

export const rowContainer = (colors: any) => ({
    ...styles.row,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
});

export const arrowColor = (enabled: boolean, colors: any) => ({
    ...styles.arrow,
    color: enabled ? colors.text : colors.border,
});

export const removeButton = (locked: boolean) => ({
    ...styles.remove,
    opacity: locked ? 0.25 : 1,
});

export const removeText = (colors: any) => ({
    ...styles.removeText,
    color: colors.negative,
});