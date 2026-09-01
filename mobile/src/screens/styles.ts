import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderBottomWidth: 1,
    },

    headerRow: {
        minHeight: 38,
        flexDirection: 'row',
        alignItems: 'center',
    },

    menuButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    menu: {
        fontSize: 21,
        fontWeight: '700',
    },

    logo: {
        fontSize: 21,
        fontWeight: '900',
        letterSpacing: 1,
        marginHorizontal: 8,
    },

    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        fontSize: 16,
        fontWeight: '900',
    },

    status: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },

    statusText: {
        fontSize: 9,
        fontWeight: '800',
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerButtonText: {
        fontSize: 20,
        fontWeight: '800',
    },

    editingLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginRight: 5,
    },

    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 34,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
    },

    headerCell: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },

    assetHeader: {
        flex: 2,
    },

    rateHeader: {
        flex: 1.55,
        textAlign: 'right',
    },

    tenorHeader: {
        flex: 0.95,
        alignItems: 'flex-end',
    },

    tenorMenu: {
        position: 'absolute',
        right: 10,
        top: 83,
        zIndex: 100,
        borderWidth: 1,
        borderRadius: 9,
        overflow: 'hidden',
        elevation: 8,
    },

    tenorOption: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

    content: {
        flex: 1,
        paddingHorizontal: 10,
    },

    marketContent: {
        paddingBottom: 10,
    },

    editContent: {
        paddingBottom: 15,
    },

    editInfo: {
        borderWidth: 1,
        borderRadius: 9,
        paddingHorizontal: 11,
        paddingVertical: 9,
        marginVertical: 8,
    },

    editInfoText: {
        fontSize: 11,
        lineHeight: 16,
    },

    addButton: {
        marginTop: 12,
        minHeight: 45,
        borderWidth: 1,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addText: {
        fontSize: 13,
        fontWeight: '900',
    },

    editFooter: {
        flexDirection: 'row',
        gap: 9,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
    },

    footerButton: {
        flex: 1,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
    },

    portfolio: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    portfolioIcon: {
        fontSize: 44,
        marginBottom: 10,
    },

    portfolioTitle: {
        fontSize: 20,
        fontWeight: '900',
    },

    portfolioText: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: '700',
    },

    empty: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    emptyText: {
        fontSize: 13,
        fontWeight: '700',
    },

    connectionIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 8,
    },
});
