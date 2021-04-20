export type WithoutId<T> = Omit<T, 'id'>;

export type Modify<T, R> = Omit<T, keyof R> & R;
