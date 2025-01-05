import React, {type FunctionComponent} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
// import {DraggableGridExample as DraggableExample} from './pages/DraggableGridExample';
import {DraggableStackExample as DraggableExample} from './pages/DraggableStackExample';
import {DraggableBasicExample} from './pages/DraggableBasicExample';
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
        {/* <DraggableBasicExample /> */}
        {/* <DraggableGridExample /> */}
        <DraggableExample />
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
