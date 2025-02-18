export type SchemaValidator<T> = object & {
  [K in keyof T]: K extends string ? T[K] : never
}

export type SerializeSchema<T extends SchemaValidator<T>> = {
  [P in keyof T]: string
}

export type ExtractKeys<T extends SchemaValidator<T>> = Extract<keyof T, string>

export type Serializer<T extends SchemaValidator<T>> = <K extends keyof T>(
  value: T[K]
) => SerializeSchema<T>[K]

export type Deserializer<T extends SchemaValidator<T>> = <
  K extends keyof SerializeSchema<T>
>(
  value: SerializeSchema<T>[K]
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

export type ModifyParamsOptions = ParamsModificationOptions &
  ParamsProcessingOptions

export type UseMutableParamsOptions<T extends SchemaValidator<T>> =
  ParamsModificationOptions &
    ParamsProcessingOptions &
    Partial<{
      serializer: Serializer<T>
      deserializer: Deserializer<T>
    }>

export type ParamsModificationData<
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

export type Entrie<
  K extends ExtractKeys<T>,
  T extends SchemaValidator<T>
> = K extends K ? [K, T[K]] : never

export type ForEachFn<
  K extends ExtractKeys<T>,
  T extends SchemaValidator<T>
> = (...[value, key]: K extends K ? [T[K], K] : never) => void
