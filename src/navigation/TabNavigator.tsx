import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CryptoScreen } from '../screens/CryptoScreen';
import { MetalsScreen } from '../screens/MetalsScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
                    tabBarActiveTintColor: '#38BDF8',
                    tabBarInactiveTintColor: '#64748B',
                }}
            >
                <Tab.Screen name="Forex" component={FavoritesScreen} />
                <Tab.Screen name="Crypto" component={CryptoScreen} />
                <Tab.Screen name="Metals" component={MetalsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};
