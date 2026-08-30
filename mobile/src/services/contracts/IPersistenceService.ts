export interface IPersistenceService<TState = unknown> {
  load(): Promise<TState | null>;
  save(state: TState): Promise<void>;
  clear(): Promise<void>;
}
