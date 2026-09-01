import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    button: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    ring: {
        width: 25,
        height: 25,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    segment: {
        position: 'absolute',
        width: 2.5,
        height: 6,
        borderRadius: 1.5,
    },

    inner: {
        width: 17,
        height: 17,
        borderRadius: 9,
    },
});

export const ringStyle = (backgroundColor: string) => ({
    ...styles.ring,
    borderColor: backgroundColor,
} as any);

export const segmentStyle = (active: boolean, color: string, backgroundColor: string, angle: number) => ({
    ...styles.segment,
    backgroundColor: active ? color : backgroundColor,
    transform: [
        {rotate: `${angle}deg`} as any,
        {translateY: -10} as any,
    ],
} as any);

export const innerStyle = (backgroundColor: string) => ({
    ...styles.inner,
    backgroundColor,
} as any);