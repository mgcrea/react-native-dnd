import {
  DndProvider,
  DndProviderProps,
  doesOverlapHorizontally,
  Draggable,
  DraggableProps,
  Droppable,
  DroppableProps,
  useDraggableStyle,
  useDroppableStyle,
} from '@mgcrea/react-native-dnd/src';
import React, {useState, type FunctionComponent} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export const DraggableBasicExample: FunctionComponent = () => {
  const [count, setCount] = useState(0);
  const dynamicData = useSharedValue({count: 0});

  const onDragEnd = () => {
    setCount(count => count + 1);
  };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({
    active: _active,
    over,
  }) => {
    'worklet';
    if (over) {
      console.log(`Current count is ${count}`);
      runOnJS(onDragEnd)();
    }
  };

  const handleBegin: DndProviderProps['onBegin'] = () => {
    'worklet';
    console.log('onBegin');
  };

  const handleFinalize: DndProviderProps['onFinalize'] = () => {
    'worklet';
    console.log('onFinalize');
  };

  const shouldDropWorklet: DndProviderProps['shouldDropWorklet'] = (
    active,
    item,
  ) => {
    'worklet';
    return doesOverlapHorizontally(active, item);
  };

  return (
    <SafeAreaView style={styles.container}>
      <DndProvider
        onBegin={handleBegin}
        onFinalize={handleFinalize}
        onDragEnd={handleDragEnd}
        shouldDropWorklet={shouldDropWorklet}>
        <MyDroppable id="drop">
          <Text style={styles.text}>DROP</Text>
        </MyDroppable>
        <MyDraggable id="drag" data={dynamicData}>
          DRAG
        </MyDraggable>
        <Text testID="button">count is {count}</Text>
      </DndProvider>
    </SafeAreaView>
  );
};

const MyDraggable: FunctionComponent<DraggableProps> = ({
  id,
  ...otherProps
}) => {
  const animatedStyle = useDraggableStyle(id, ({isActive, isActing}) => {
    'worklet';
    return {
      opacity: isActing ? 0.5 : 1,
      backgroundColor: isActive ? 'lightseagreen' : 'seagreen',
      transform: [{scale: withSpring(isActive ? 1.1 : 1)}],
    };
  });

  return (
    <Draggable id={id} {...otherProps}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>DRAG</Text>
      </Animated.View>
    </Draggable>
  );
};

const MyDroppable: FunctionComponent<DroppableProps> = ({
  id,
  ...otherProps
}) => {
  const animatedStyle = useDroppableStyle(id, ({isActive}) => {
    'worklet';
    return {
      opacity: isActive ? 0.9 : 1,
      backgroundColor: isActive ? 'steelblue' : 'teal',
      transform: [{rotate: withSpring(isActive ? `-20deg` : `0deg`)}],
    };
  });

  return (
    <Droppable id={id} {...otherProps}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text style={styles.text}>DROP</Text>
      </Animated.View>
    </Droppable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 32,
    padding: 32,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  box: {
    margin: 24,
    padding: 12,
    height: 96,
    width: 96,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, .4)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 14,
    padding: 12,
  },
});
