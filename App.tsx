import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TabNavigator } from './src/navigation/TabNavigator';

const MainApp = () => {
    const { isDark } = useTheme();

    return (
        <>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <TabNavigator />
        </>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <NavigationContainer>
                    <MainApp />
                </NavigationContainer>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}