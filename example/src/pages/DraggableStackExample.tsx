import React, {useState, type FunctionComponent} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {
  DndProvider,
  type ObjectWithId,
  Draggable,
  DraggableStack,
  type DraggableStackProps,
} from '@mgcrea/react-native-dnd/src';

const items = ['🤓', '🤖🤖', '👻👻👻', '👾👾👾👾'];
const data = items.map((letter, index) => ({
  value: letter,
  id: `${index}-${letter}`,
})) satisfies ObjectWithId[];

export const DraggableStackExample: FunctionComponent = () => {
  const onStackOrderChange: DraggableStackProps['onOrderChange'] = value => {
    console.log('onStackOrderChange', value);
  };
  const onStackOrderUpdate: DraggableStackProps['onOrderUpdate'] = value => {
    console.log('onStackOrderUpdate', value);
  };

  const [items, setItems] = useState(data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DraggableStack Example</Text>
      <DndProvider>
        <DraggableStack
          direction="row"
          gap={10}
          style={styles.stack}
          onOrderChange={onStackOrderChange}
          onOrderUpdate={onStackOrderUpdate}>
          {items.map(letter => (
            <Draggable
              key={letter.id}
              id={letter.id}
              style={[styles.draggable]}>
              <Text style={styles.text}>{letter.value}</Text>
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
      <Button
        title="Add"
        onPress={() => {
          setItems(prevItems => {
            const randomIndex = 2; //Math.floor(Math.random() * prevItems.length);
            prevItems.splice(randomIndex, 0, {
              value: '🤪',
              id: `${prevItems.length}-🤪`,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    opacity: 0.5,
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
