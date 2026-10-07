import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ToastProvider } from './components/ui/Toast';
import { RootNavigator } from './navigation/RootNavigator';
import { BudgetProvider, useBudget } from './store/BudgetContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const AppContent = () => {
  const { isReady } = useBudget();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BudgetProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </BudgetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060b14',
  },
});
