import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingTop: 6,
        paddingBottom: 7,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },

    icon: {
        fontSize: 18,
        fontWeight: '800',
    },

    iconActive: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FF6B4A',
    },

    iconInactive: {
        fontSize: 18,
        fontWeight: '800',
        color: '#666',
    },
});