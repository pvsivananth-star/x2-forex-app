import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext.tsx';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CryptoScreen } from '../screens/CryptoScreen';
import { MetalsScreen } from '../screens/MetalsScreen';
import { ChartsScreen } from '../screens/ChartsScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false, // Hides text below icons
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.cardBorder,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarIcon: ({ focused }) => {
                    const iconColor = focused ? colors.accent : '#94A3B8'; // Active vs Greyed out

                    if (route.name === 'Forex') {
                        return (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                                <Path d="M7 10h14l-4-4M17 14H3l4 4" />
                            </Svg>
                        );
                    } else if (route.name === 'Crypto') {
                        return (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                                <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </Svg>
                        );
                    } else if (route.name === 'Metals') {
                        return (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                                <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                            </Svg>
                        );
                    } else if (route.name === 'Charts') {
                        return (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                                <Path d="M3 3v18h18M18 9l-5 5-4-4-3 3" />
                            </Svg>
                        );
                    } else if (route.name === 'Portfolio') {
                        if (focused) {
                            // Colorful Pie Chart Icon on selection
                            return (
                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                    <Path d="M12 2v10h10A10 10 0 0 0 12 2z" fill="#2563EB" />
                                    <Path d="M10 12V2a10 10 0 1 0 10 10H10z" fill="#F59E0B" />
                                    <Path d="M12 12l7 7A10 10 0 0 0 12 12z" fill="#16A34A" />
                                </Svg>
                            );
                        }
                        // Greyed out pie chart when non-selected
                        return (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                                <Path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                <Path d="M22 12A10 10 0 0 0 12 2v10z" />
                            </Svg>
                        );
                    }
                },
            })}
        >
            <Tab.Screen name="Forex" component={FavoritesScreen} />
            <Tab.Screen name="Crypto" component={CryptoScreen} />
            <Tab.Screen name="Metals" component={MetalsScreen} />
            <Tab.Screen name="Charts" component={ChartsScreen} />
            <Tab.Screen name="Portfolio" component={PortfolioScreen} />
        </Tab.Navigator>
    );
};