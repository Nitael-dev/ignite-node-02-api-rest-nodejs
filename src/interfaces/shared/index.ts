export type DynamicObject<T> = T extends [any, ...any]
  ? {
      [K in keyof T]?: T[K]
    }
  : unknown
