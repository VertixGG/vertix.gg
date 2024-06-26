export type WithRequiredProp<Type, Key extends keyof Type> = Omit<Type, Key> &  Required<Pick<Type, Key>>;
