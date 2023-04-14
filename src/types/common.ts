import type { MutableRefObject } from "react";

export type UniqueIdentifier = string | number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyData = Record<string, any>;
export type Data<T = AnyData> = T;
export type DataRef<T = AnyData> = MutableRefObject<Data<T>>;
