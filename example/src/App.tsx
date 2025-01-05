import React, {type FunctionComponent} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DraggableStackExample} from './pages/DraggableStackExample';
import {SafeAreaView, StyleSheet} from 'react-native';
import {configureReanimatedLogger} from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  // level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

export const App: FunctionComponent = () => {
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <DraggableStackExample />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
