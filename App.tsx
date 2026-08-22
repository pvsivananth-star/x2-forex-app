import React from 'react';
import { StatusBar } from 'react-native';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

function App(): React.JSX.Element {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <FavoritesScreen />
        </>
    );
}

export default App;
