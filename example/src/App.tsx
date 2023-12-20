import React, {type FunctionComponent} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DraggableGridExample} from './pages/DraggableGridExample';
import {DraggableStackExample} from './pages/DraggableStackExample';
import {DraggableBasicExample} from './pages/DraggableBasicExample';
import {SafeAreaView, StyleSheet} from 'react-native';

export const App: FunctionComponent = () => {
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <DraggableBasicExample />
        {/* <DraggableGridExample /> */}
        {/* <DraggableStackExample /> */}
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
