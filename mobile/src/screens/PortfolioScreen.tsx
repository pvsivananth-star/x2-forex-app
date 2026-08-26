import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface PortfolioScreenProps {
    colors: any;
}

export const PortfolioScreen: React.FC<
    PortfolioScreenProps
> = ({ colors }) => {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor:
                    colors.background,
                },
            ]}
        >
            <Text style={styles.icon}>
                🚧
            </Text>

            <Text
                style={[
                    styles.title,
                    { color: colors.text },
                ]}
            >
                Portfolio
            </Text>

            <Text
                style={[
                    styles.subtitle,
                    { color: colors.muted },
                ]}
            >
                Under Construction
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    icon: {
        fontSize: 42,
        marginBottom: 12,
    },

    title: {
        fontSize: 18,
        fontWeight: '900',
    },

    subtitle: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '700',
    },
});