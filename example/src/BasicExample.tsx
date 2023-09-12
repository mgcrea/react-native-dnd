import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableProps,
  Droppable,
  DroppableProps,
  useDraggableStyle,
  useDroppableStyle,
} from '@mgcrea/react-native-dnd/src';
import React, {useState, type FunctionComponent} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export const BasicExample: FunctionComponent = () => {
  const [count, setCount] = useState(0);
  const dynamicData = useSharedValue({count: 0});

  const onDragEnd = () => {
    setCount(count => count + 1);
  };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({active, over}) => {
    'worklet';
    if (over) {
      const {count} = dynamicData.value;
      console.log(`Current count is ${count}`);
      Object.assign(dynamicData.value, {count});
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

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <DndProvider
          onBegin={handleBegin}
          onFinalize={handleFinalize}
          onDragEnd={handleDragEnd}>
          <View style={styles.view}>
            <MyDroppable id="drop">
              <Text style={styles.text}>DROP</Text>
            </MyDroppable>
            <MyDraggable id="drag" data={dynamicData}>
              <Text style={styles.text}>DRAG</Text>
            </MyDraggable>
            <Text testID="button">count is {count}</Text>
          </View>
        </DndProvider>
      </GestureHandlerRootView>
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
      opacity: isActing ? 0.95 : 1,
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
    backgroundColor: 'linen',
    flex: 1,
  },
  view: {
    alignItems: 'center',
    marginTop: -128,
    borderColor: 'black',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 32,
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
