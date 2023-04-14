export type Point<T = number> = {
  x: T;
  y: T;
};

export type Offset = {
  x: number;
  y: number;
};

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * @summary Checks if a `Point` is included inside a `Rectangle`
 * @worklet
 */
export const includesPoint = (layout: Rectangle, { x, y }: Point, strict?: boolean) => {
  "worklet";
  if (strict) {
    return layout.x < x && x < layout.x + layout.width && layout.y < y && y < layout.y + layout.height;
  }
  return layout.x <= x && x <= layout.x + layout.width && layout.y <= y && y <= layout.y + layout.height;
};

/**
 * @summary Checks if a `Rectange` overlaps with another `Rectangle`
 * @worklet
 */
export const overlapsRectangle = (layout: Rectangle, other: Rectangle) => {
  "worklet";
  return (
    layout.x < other.x + other.width &&
    layout.x + layout.width > other.x &&
    layout.y < other.y + other.height &&
    layout.y + layout.width > other.y
  );
};

/**
 * @summary Apply an offset to a layout
 * @worklet
 */
export const applyOffset = (layout: Rectangle, { x, y }: Offset): Rectangle => {
  "worklet";
  return {
    width: layout.width,
    height: layout.height,
    x: layout.x + x,
    y: layout.y + y,
  };
};

/**
 * @summary Compute a center point
 * @worklet
 */
export const centerPoint = (layout: Rectangle): Point => {
  "worklet";
  return {
    x: layout.x + layout.width / 2,
    y: layout.y + layout.height / 2,
  };
};
