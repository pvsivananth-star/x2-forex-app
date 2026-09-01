import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface Props {
  colors: any;
}

const PortfolioScreen: React.FC<Props> = ({ colors }) => {
  return (
    <View style={styles.portfolio}>
      <Text style={styles.portfolioIcon}>▦</Text>

      <Text style={[styles.portfolioTitle, { color: colors.text }]}>Portfolio</Text>

      <Text style={[styles.portfolioText, { color: colors.muted }]}>Under Construction</Text>
    </View>
  );
};

export default PortfolioScreen;
