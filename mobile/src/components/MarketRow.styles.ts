import {StyleSheet} from 'react-native';
import {getChangeColor} from './styles/sharedStyles';

export const styles = StyleSheet.create({
    row: {minHeight: 48, height: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1},
    assetColumn: {flex: 2, paddingRight: 6},
    rateColumn: {flex: 1.55, alignItems: 'flex-end'},
    changeColumn: {flex: 0.95, alignItems: 'flex-end'},
    symbol: {fontSize: 13, fontWeight: '900'},
    name: {fontSize: 9, marginTop: 1},
    input: {minWidth: 88, height: 34, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, textAlign: 'right', fontSize: 13, fontWeight: '800'},
    change: {fontSize: 11, fontWeight: '900'},
});

export const makeRowStyles = (colors: any, active: boolean, isEquity: boolean, positive: boolean) => ({
    row: {...styles.row, borderBottomColor: colors.border},
    assetColumn: styles.assetColumn,
    rateColumn: styles.rateColumn,
    changeColumn: styles.changeColumn,
    symbol: {...styles.symbol, color: colors.text},
    name: {...styles.name, color: colors.dim},
    input: {
        ...styles.input,
        color: colors.text,
        backgroundColor: 'transparent',
        borderColor: colors.border,
        borderWidth: 1,
        textAlign: 'right' as any,
    },
    change: styles.change,
    changeText: {...styles.change, color: getChangeColor(colors, positive)},
});
