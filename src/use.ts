import type {
  Entrie,
  ForEachFn,
  ExtractKeys,
  SchemaValidator,
  ModifyParamsOptions,
  UseMutableParamsOptions,
  ParamsModificationOptions
} from './types'

import { getCurrentParams } from './lib'
import { useModel } from './model'
import { useMemo } from 'react'

function useMutableParams<T extends SchemaValidator<T>>(
  hookOptions: UseMutableParamsOptions<T> = {}
) {
  type Schema = Required<T>
  type Keys = ExtractKeys<Schema>

  const { state, deserialize, modifyParams } = useModel<Keys, T>(hookOptions)

  const mutableParams = useMemo(
    () => ({
      get<K extends Keys>(key: K): Schema[K] | null {
        const values = getCurrentParams().getAll(key)

        if (values.length === 0) {
          return null
        } else if (values.length === 1) {
          return deserialize<K>(values[0])
        } else {
          return values.map((value) => deserialize<K>(value)) as Schema[K]
        }
      },

      set<K extends Keys>(
        key: K,
        value: Schema[K],
        options?: ModifyParamsOptions
      ) {
        modifyParams({ action: 'set', key, value }, options)
      },

      delete<K extends Keys>(
        key: K,
        value?: Schema[K],
        options?: ParamsModificationOptions
      ) {
        modifyParams({ action: 'delete', key, value }, options)
      },

      *entries<K extends Keys>(): IterableIterator<Entrie<K, Schema>> {
        for (const [key, value] of getCurrentParams().entries()) {
          yield [key, deserialize(value)] as Entrie<K, Schema>
        }
      },

      *keys(): IterableIterator<Keys> {
        for (const key of getCurrentParams().keys()) {
          yield key as Keys
        }
      },

      *values(): IterableIterator<Schema[Keys]> {
        for (const value of getCurrentParams().values()) {
          yield deserialize(value)
        }
      },

      forEach<K extends Keys>(fn: ForEachFn<K, Schema>) {
        getCurrentParams().forEach((value, key) => {
          fn(...([deserialize(value), key] as Parameters<ForEachFn<K, Schema>>))
        })
      },

      size: getCurrentParams().size,

      sort() {
        window.history.replaceState(null, '', `?${getCurrentParams().sort()}`)
      },

      toString: () => getCurrentParams().toString(),

      has: (key: Keys) => getCurrentParams().has(key)
    }),
    [deserialize, modifyParams]
  )

  return { state, mutableParams }
}

export { useMutableParams }

export type {
  Serializer,
  Deserializer,
  SerializeSchema,
  UseMutableParamsOptions
} from './types'
