export type IdFactory = (prefix: string) => string;

export function createIdFactory(seed = 0): IdFactory {
  let nextId = seed;

  return (prefix: string) => {
    nextId += 1;
    return `${prefix}-${nextId}`;
  };
}
