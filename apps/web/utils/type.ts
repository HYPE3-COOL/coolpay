export type B2S<T> = {
  [K in keyof T]: T[K] extends bigint ? string : T[K] extends object ? B2S<T[K]> : T[K];
};
