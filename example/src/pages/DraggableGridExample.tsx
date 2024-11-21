import {
  DndProvider,
  type ObjectWithId,
  Draggable,
  DraggableGrid,
  DraggableGridProps,
} from '@mgcrea/react-native-dnd';
import {type FunctionComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const GRID_SIZE = 3;
const items: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const data = items.map((letter, index) => ({
  id: `${index}-${letter}`,
  value: letter,
})) satisfies ObjectWithId[];

export const DraggableGridExample: FunctionComponent = () => {
  const onGridOrderChange: DraggableGridProps['onOrderChange'] = value => {
    console.log('onGridOrderChange', value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DraggableGrid{'\n'}Example</Text>
      <DndProvider>
        <DraggableGrid
          direction="row"
          size={GRID_SIZE}
          style={styles.grid}
          onOrderChange={onGridOrderChange}>
          {data.map(item => (
            <Draggable key={item.id} id={item.id} style={styles.draggable}>
              <Text style={styles.text}>{item.value}</Text>
            </Draggable>
          ))}
        </DraggableGrid>
      </DndProvider>
    </View>
  );
};

const LETTER_WIDTH = 100;
const LETTER_HEIGHT = 100;
const LETTER_GAP = 10;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: LETTER_WIDTH * GRID_SIZE + LETTER_GAP * (GRID_SIZE - 1),
    gap: LETTER_GAP,
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
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
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
  },
});
