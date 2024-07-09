export type SchemaValidator<T> = object & {
  [K in keyof T]: K extends string ? T[K] : never
}

export type ExtractKeys<T extends SchemaValidator<T>> = Extract<keyof T, string>

export type Serializer<T extends SchemaValidator<T>> = <
  K extends ExtractKeys<T>
>(
  value: T[K]
) => string

export type Deserializer<T extends SchemaValidator<T>> = <
  K extends ExtractKeys<T>
>(
  value: string
) => T[K]

export type OnTriggerListener = (newState: object) => void

export type TriggerEventDetail = { newState: object }

export type ParamsModificationOptions = Partial<{
  replace: boolean
  syncState: boolean
}>

export type ParamsProcessingOptions = Partial<{
  serializeArrays: boolean
}>

export type UseMutableParamsOptions<T extends SchemaValidator<T>> =
  ParamsModificationOptions &
    ParamsProcessingOptions &
    Partial<{
      serializer: Serializer<T>
      deserializer: Deserializer<T>
    }>

type ParamsModificationData<
  T extends SchemaValidator<T>,
  K extends ExtractKeys<T>
> =
  | {
      action: 'set'
      key: K
      value: T[K]
    }
  | {
      action: 'delete'
      key: K
      value?: T[K]
    }

export type ModifyParams<T extends SchemaValidator<T>> = <
  K extends ExtractKeys<T>
>(
  data: ParamsModificationData<T, K>,
  options?: ParamsModificationOptions & ParamsProcessingOptions
) => void

export type Entrie<
  T extends SchemaValidator<T>,
  K extends ExtractKeys<T>
> = T extends T ? [K, T[K]] : never

export type ForEachFn<
  T extends SchemaValidator<T>,
  K extends ExtractKeys<T>
> = (...[value, key]: T extends T ? [T[K], K] : never) => void

export type MutableParams<T extends SchemaValidator<T>> = {
  get<K extends ExtractKeys<Required<T>>>(key: K): Required<T>[K] | null

  set<K extends ExtractKeys<Required<T>>>(
    key: K,
    value: Required<T>[K],
    options?: ParamsModificationOptions & ParamsProcessingOptions
  ): void

  delete<K extends ExtractKeys<Required<T>>>(
    key: K,
    value?: Required<T>[K],
    options?: ParamsModificationOptions
  ): void

  entries<K extends ExtractKeys<Required<T>>>(): IterableIterator<
    Entrie<Required<T>, K>
  >

  keys(): IterableIterator<ExtractKeys<Required<T>>>

  values(): IterableIterator<Required<T>[ExtractKeys<Required<T>>]>

  forEach<K extends ExtractKeys<Required<T>>>(
    fn: ForEachFn<Required<T>, K>
  ): void

  size: number

  sort(): void

  toString: () => string

  has: (key: ExtractKeys<Required<T>>) => boolean
}
