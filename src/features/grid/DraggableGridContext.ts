import { createContext, useContext } from "react";

export type DraggableGridContextValue = {
  gridMode: number;
  gridWidth: number;
  gridHeight: number;
};

export const DraggableGridContext = createContext<DraggableGridContextValue>(null!);

export const useDraggableGridContext = () => {
  return useContext(DraggableGridContext);
};
