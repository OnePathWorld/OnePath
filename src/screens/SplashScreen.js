import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D7A9FF', // Match your splash.png background
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;