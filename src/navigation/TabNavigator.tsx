import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CryptoScreen } from '../screens/CryptoScreen';
import { MetalsScreen } from '../screens/MetalsScreen';
import { ChartsScreen } from '../screens/ChartsScreen';
import { useTheme } from '../context/ThemeContext';


const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    const { colors } = useTheme();
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopColor: colors.cardBorder,
                    },
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.textMuted,
                }}
            >
                <Tab.Screen name="Forex" component={FavoritesScreen} />
                <Tab.Screen name="Crypto" component={CryptoScreen} />
                <Tab.Screen name="Metals" component={MetalsScreen} />
                <Tab.Screen name="Charts" component={ChartsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};
