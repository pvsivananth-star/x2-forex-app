import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingTop: 6,
        paddingBottom: 7,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconContainer: {
        width: 32,
        height: 26,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        fontSize: 14,
        fontWeight: '900',
    },

    label: {
        fontSize: 10,
        fontWeight: '800',
        marginTop: 2,
    },
});