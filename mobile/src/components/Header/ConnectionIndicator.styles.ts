import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});

export const dotStyle = (online: boolean) => ({
    ...styles.dot,
    backgroundColor: online ? '#2E9D57' : '#D32F2F',
});