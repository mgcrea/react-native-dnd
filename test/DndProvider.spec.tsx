import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { GestureHandlerRootView, PanGesture, State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import { DndProvider, Draggable, Droppable } from "../src";

describe("<DndProvider />", () => {
  test("basic example", async () => {
    const view = render(
      <GestureHandlerRootView>
        <DndProvider>
          <Droppable id="drop">
            <Text>DROP</Text>
          </Droppable>
          <Draggable id="drag">
            <Text>DRAG</Text>
          </Draggable>
        </DndProvider>
      </GestureHandlerRootView>,
    );

    fireGestureHandler<PanGesture>(getByGestureTestId("DndProvider.pan"), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: 10 },
      { translationX: 20 },
      { translationX: 20 },
      { state: State.END, translationX: 30 },
    ]);

    expect(view).toMatchInlineSnapshot(`
      <View>
        <View
          collapsable={false}
          testID="view"
        >
          <View
            onLayout={[Function]}
            style={
              [
                undefined,
                {
                  "opacity": 1,
                },
              ]
            }
          >
            <Text>
              DROP
            </Text>
          </View>
          <View
            onLayout={[Function]}
            style={
              [
                undefined,
                {
                  "opacity": 1,
                  "transform": [
                    {
                      "translateX": 0,
                    },
                    {
                      "translateY": 0,
                    },
                  ],
                  "zIndex": 1,
                },
              ]
            }
          >
            <Text>
              DRAG
            </Text>
          </View>
        </View>
      </View>
    `);
    // await fireEvent.press(screen.getByTestId("button"));
    // await fireEvent.press(screen.getByTestId("button"));

    // expect(screen.getByTestId("button")).toHaveTextContent("count is 2");
  });
});
