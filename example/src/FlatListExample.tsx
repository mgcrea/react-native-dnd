import {
  DndProvider,
  Draggable,
  DraggableFlatList,
  GridItem,
  useDraggableGrid,
  type DndProviderProps,
  type DraggableProps,
  type UseDraggableGridOptions,
  useDraggableStyle,
} from '@mgcrea/react-native-dnd/src';
import React, {type FunctionComponent} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {withSpring} from 'react-native-reanimated';

type ItemProps = {id: string; title: string};

// prettier-ignore
const EMOJIS = ["📱", "🚗", "🎈", "📚", "🖥️", "🎸", "🍎", "⌚", "🍕", "🎧", "🚀", "🏀"];
const DATA = Array.from({length: 12}, (_, index) => {
  const item: ItemProps = {
    id: `${index + 1}`,
    title: `${EMOJIS[index]} Item ${index + 1}`,
  };
  return item;
}) satisfies GridItem[];

const DraggableFlatListItem: FunctionComponent<ItemProps> = ({id, title}) => {
  const draggableStyle = useDraggableStyle(
    id,
    ({isActive, isActing, isDisabled}) => {
      'worklet';
      return {
        opacity: isActing ? 0.8 : 1,
        backgroundColor: isActive ? 'lightseagreen' : 'peachpuff',
        transform: [{scale: withSpring(isActive ? 1.05 : 1)}],
      };
    },
  );

  return (
    <Draggable id={id} activationDelay={300} activationTolerance={2}>
      <Animated.View style={[styles.item, draggableStyle]}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </Draggable>
  );
};

export const FlatListExample: FunctionComponent = () => {
  const onBegin: DndProviderProps['onBegin'] = () => {
    'worklet';
    console.log('onBegin');
  };

  const onFinalize: DndProviderProps['onFinalize'] = () => {
    'worklet';
    console.log('onFinalize');
  };

  const onOrderChange: UseDraggableGridOptions<ItemProps>['onOrderChange'] =
    nextOrder => {
      console.log({nextOrder});
    };

  const {props, draggablePlaceholderIndex} = useDraggableGrid(DATA, {
    gridWidth: 1,
    gridHeight: DATA.length,
    onOrderChange,
    onBegin,
    onFinalize,
  });

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <DndProvider {...props}>
          <DraggableFlatList
            data={DATA}
            renderItem={({item}) => <DraggableFlatListItem {...item} />}
            placeholderIndex={draggablePlaceholderIndex}
          />
        </DndProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: 'linen',
  },
  item: {
    backgroundColor: 'peachpuff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    color: 'darkslategray',
    fontSize: 24,
    fontWeight: '500',
  },
});
