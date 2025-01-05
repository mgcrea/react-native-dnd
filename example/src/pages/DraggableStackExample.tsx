import {
  DndProvider,
  Draggable,
  DraggableStack,
  type DraggableStackHandle,
  type UniqueIdentifier,
  type DraggableStackProps,
  type ObjectWithId,
} from '@mgcrea/react-native-dnd/src';
import React, {useState, type FunctionComponent} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {runOnUI} from 'react-native-reanimated';

const items = ['🤓', '🤖🤖', '👻👻👻', '👾👾👾👾'];
const data = items.map((letter, index) => ({
  value: letter,
  id: `${index}-${letter}`,
})) satisfies ObjectWithId[];
let id = items.length;

export const DraggableStackExample: FunctionComponent = () => {
  const [items, setItems] = useState(data);
  const [fontSize, setFontSize] = useState(32);
  const ref = React.useRef<DraggableStackHandle>(null);

  const onStackOrderChange: DraggableStackProps['onOrderChange'] = (
    order: UniqueIdentifier[],
  ) => {
    console.log('onStackOrderChange', order);
  };
  const onStackOrderUpdate: DraggableStackProps['onOrderUpdate'] = value => {
    console.log('onStackOrderUpdate', value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DraggableStack Example</Text>
      <DndProvider>
        <DraggableStack
          direction="row"
          gap={10}
          style={styles.stack}
          onOrderChange={onStackOrderChange}
          onOrderUpdate={onStackOrderUpdate}
          ref={ref}>
          {items.map((letter, index) => (
            <Draggable
              key={`${letter.id}-${index}`}
              id={letter.id}
              style={[styles.draggable]}>
              <Text style={[styles.text, {fontSize}]}>{letter.value}</Text>
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
      <View style={styles.actions}>
        <Button
          title="Add"
          onPress={() => {
            setItems(prevItems => {
              const randomIndex = 2; //Math.floor(Math.random() * prevItems.length);
              id++;
              prevItems.splice(randomIndex, 0, {
                value: '🤪',
                id: `${id}-🤪`,
              });
              return prevItems.slice();
            });
          }}
        />
        <Button
          title="Delete"
          onPress={() => {
            setItems(prevItems => {
              const randomIndex = Math.floor(Math.random() * prevItems.length);
              return prevItems.filter((_, index) => index !== randomIndex);
            });
          }}
        />

        <Button
          title="Increase size"
          onPress={() => {
            setFontSize(prevFontSize => prevFontSize + 1);
            if (ref.current) {
              const {refreshOffsets} = ref.current;
              runOnUI(refreshOffsets)();
            }
          }}
        />

        <Button
          title="Decrease size"
          onPress={() => {
            setFontSize(prevFontSize => prevFontSize - 1);
            if (ref.current) {
              const {refreshOffsets} = ref.current;
              runOnUI(refreshOffsets)();
            }
          }}
        />

        <Button
          title="Reorder"
          onPress={() => {
            setItems(items => {
              const nextItems = items.slice().reverse();
              console.log({nextItems});
              return nextItems;
            });
            // if (ref.current) {
            //   const {refreshOffsets} = ref.current;
            //   runOnUI(refreshOffsets)();
            // }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  stack: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    // flexGrow: 1,
    margin: 32,
    padding: 32,
    borderRadius: 32,
  },
  draggable: {
    backgroundColor: 'seagreen',
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    paddingVertical: 8,
  },
  title: {
    color: '#555',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  text: {
    fontSize: 32,
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
