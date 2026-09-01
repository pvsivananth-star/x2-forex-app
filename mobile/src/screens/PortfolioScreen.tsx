import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {PortfolioCategory} from '../models';
import {AppColors} from '../theme';
import {styles} from './styles';

interface Props {
    colors: AppColors;
    activeCategory: PortfolioCategory;
}

const CATEGORY_TITLES: Record<PortfolioCategory, string> = {
    overview: 'All / Overview', bank: 'Bank', market: 'Market',
    fixedIncome: 'Fixed Income', land: 'Land', commodity: 'Commodity',
};

const CATEGORY_DESCRIPTIONS: Record<PortfolioCategory, string> = {
    overview: 'All portfolio assets', bank: 'Savings, PF, Lent Money', market: 'MF, EQ, ETF',
    fixedIncome: 'Bonds, FD', land: 'Physical Real Estate', commodity: 'Gold, Silver',
};

const PortfolioScreen: React.FC<Props> = ({colors, activeCategory}) => (
    <View style={styles.portfolioScreen}>
        <ScrollView style={styles.content} contentContainerStyle={styles.marketContent} showsVerticalScrollIndicator={true}>
            <View style={styles.portfolio}>
                <Text style={[styles.portfolioTitle, {color: colors.text}]}>
                    {CATEGORY_TITLES[activeCategory]}
                </Text>
                <Text style={[styles.portfolioText, {color: colors.muted}]}>
                    {CATEGORY_DESCRIPTIONS[activeCategory]}
                </Text>
            </View>
        </ScrollView>
    </View>
);

export default PortfolioScreen;
