import {
  DndProvider,
  Draggable,
  DraggableStack,
  type DraggableStackHandle,
  type UniqueIdentifier,
  type DraggableStackProps,
  type ObjectWithId,
} from '@mgcrea/react-native-dnd/src';
import React, {useCallback, useState, type FunctionComponent} from 'react';
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

  const onStackOrderChange: DraggableStackProps['onOrderChange'] = useCallback(
    (order: UniqueIdentifier[]) => {
      console.log('onStackOrderChange', order);
      setTimeout(() => {
        // setItems(items => order.map(id => items.find(item => item.id === id)!));
      }, 1000);
    },
    [],
  );
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
          {items.map(letter => (
            <Draggable
              key={letter.id}
              id={letter.id}
              style={[styles.draggable]}>
              <Text style={[styles.text, {fontSize}]}>{letter.value}</Text>
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
      <View style={{flexDirection: 'row'}}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // alignItems: 'stretch',
    // justifyContent: 'st',
    flexDirection: 'column',
  },
  view: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,0,255,0.1)',
    flexGrow: 1,
  },
  stack: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    // flexGrow: 1,
    padding: 32,
    borderRadius: 32,
  },
  title: {
    color: '#555',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  draggable: {
    backgroundColor: 'seagreen',
    height: 100,
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 32,
    padding: 16,
  },
});
