import React from 'react';
import { StatusBar } from 'react-native';
import { TabNavigator } from './src/navigation/TabNavigator';

function App(): React.JSX.Element {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <TabNavigator />
        </>
    );
}

export default App;
