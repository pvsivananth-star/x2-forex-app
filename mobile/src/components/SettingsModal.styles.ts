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
    apply: {
        marginTop: 18,
        paddingVertical: 11,
        borderRadius: 9,
        alignItems: 'center',
    },
    applyText: {
        color: '#FFFFFF',
        fontWeight: '900',
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
});

export const themed = (colors: any) => ({
    backdrop: {...styles.backdrop, backgroundColor: colors.overlay},
    modal: {...styles.modal, backgroundColor: colors.surfaceElevated, borderColor: colors.border},
    header: styles.header,
    title: {...styles.title, color: colors.text},
    close: {...styles.close, color: colors.muted},
    section: {...styles.section, color: colors.muted},
    options: styles.options,
    option: (selected: boolean, colors: any) => ({
        ...styles.option,
        backgroundColor: selected ? colors.accentStrong : colors.surface,
        borderColor: selected ? colors.accent : colors.border,
    }),
    optionText: (selected: boolean, colors: any) => ({
        color: selected ? '#FFFFFF' : colors.muted,
        fontWeight: '800',
    }),
    info: (colors: any) => ({...styles.info, color: colors.muted}),
    apply: (colors: any) => ({...styles.apply, backgroundColor: colors.accent}),
    applyText: styles.applyText,
    reset: (colors: any) => ({...styles.reset, backgroundColor: colors.surface, borderColor: colors.warning}),
    resetText: (colors: any) => ({...styles.resetText, color: colors.warning}),
    disclaimer: (colors: any) => ({...styles.disclaimer, color: colors.warning, borderColor: colors.border, backgroundColor: colors.surface}),
});
