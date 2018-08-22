/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
