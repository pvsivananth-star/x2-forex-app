import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingTop: 6,
        paddingBottom: 7,
        gap: 0,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },

    code: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});
