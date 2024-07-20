import type {
  Entrie,
  ForEachFn,
  Serializer,
  ExtractKeys,
  ModifyParams,
  Deserializer,
  MutableParams,
  SchemaValidator,
  OnTriggerListener,
  UseMutableParamsOptions
} from './types'

import { getCurrentParams, getMergedOptions, stateFromEntries } from './lib'
import { useSearchParams as useReadOnlyParams } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { serializer, deserializer } from './index'
import { Target } from './Target'

export type { UseMutableParamsOptions }

export function useMutableParams<T extends SchemaValidator<T>>(
  hookOptions: UseMutableParamsOptions<T> = {}
): [Partial<T>, MutableParams<T>] {
  type Schema = Required<T>
  type Keys = ExtractKeys<Schema>

  const serialize: Serializer<Schema> = useMemo(
    () => hookOptions.serializer ?? serializer,
    [hookOptions.serializer]
  )

  const deserialize: Deserializer<Schema> = useMemo(
    () => hookOptions.deserializer ?? deserializer,
    [hookOptions.deserializer]
  )

  const readOnlyParams = useReadOnlyParams()

  const [state, setState] = useState<Partial<T>>(
    stateFromEntries(readOnlyParams.entries(), deserializer)
  )

  useEffect(() => {
    const listener: OnTriggerListener = (newState) => {
      setState(newState)
    }

    if (hookOptions.syncState === true) {
      Target.instance.addTriggerListener(listener)

      return () => {
        Target.instance.removeTriggerListener(listener)
      }
    } else {
      // in case syncState changed
      Target.instance.removeTriggerListener(listener)
    }
  }, [hookOptions.syncState])

  const modifyParams: ModifyParams<Schema> = useCallback(
    ({ action, key, value }, modifyParamsOptions = {}) => {
      const current = getCurrentParams()

      const { serializeArrays, syncState, replace } = getMergedOptions({
        hookOptions: {
          replace: hookOptions.replace,
          syncState: hookOptions.syncState,
          serializeArrays: hookOptions.serializeArrays
        },
        defaultOptions: {
          serializeArrays: true,
          syncState: false,
          replace: false
        },
        modifyParamsOptions
      })

      const handleSetAction = <K extends Keys>(key: K, value: Schema[K]) => {
        if (!serializeArrays && Array.isArray(value)) {
          current.delete(key)
          ;(value as (typeof value)[]).forEach((value) =>
            current.append(key, serialize(value))
          )
        } else {
          current.set(key, serialize(value))
        }
      }

      const handeDeleteAction = <K extends Keys>(key: K, value?: Schema[K]) => {
        if (current.getAll(key).length > 1 && Array.isArray(value)) {
          ;(value as (typeof value)[]).forEach((value) =>
            current.delete(key, serialize(value))
          )
        } else {
          current.delete(key, value && serialize(value))
        }
      }

      if (action === 'set') {
        handleSetAction(key, value)
      } else {
        handeDeleteAction(key, value)
      }

      const params = current.toString()
      const newUrl = `${window.location.pathname}${params ? `?${params}` : ''}`
      const newState = stateFromEntries(current.entries(), deserialize)

      if (replace) {
        window.history.replaceState(null, '', newUrl)
      } else {
        window.history.pushState(null, '', newUrl)
      }

      if (syncState) Target.instance.trigger({ newState })

      setState(newState)
    },

    [
      serialize,
      deserialize,
      hookOptions.replace,
      hookOptions.syncState,
      hookOptions.serializeArrays
    ]
  )

  const mutableParams: MutableParams<Schema> = useMemo(
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

      set(key, value, options) {
        modifyParams({ action: 'set', key, value }, options)
      },

      delete(key, value, options) {
        modifyParams({ action: 'delete', key, value }, options)
      },

      *entries<K extends Keys>(): IterableIterator<Entrie<Schema, K>> {
        for (const [key, value] of getCurrentParams().entries()) {
          yield [key, deserialize(value)] as Entrie<Schema, K>
        }
      },

      *keys() {
        for (const key of getCurrentParams().keys()) {
          yield key as Keys
        }
      },

      *values() {
        for (const value of getCurrentParams().values()) {
          yield deserialize(value)
        }
      },

      forEach<K extends Keys>(fn: ForEachFn<Schema, K>) {
        getCurrentParams().forEach((value, key) => {
          fn(...([deserialize(value), key] as Parameters<ForEachFn<Schema, K>>))
        })
      },

      size: getCurrentParams().size,

      sort() {
        window.history.replaceState(null, '', `?${getCurrentParams().sort()}`)
      },

      toString: () => getCurrentParams().toString(),

      has: (key) => getCurrentParams().has(key)
    }),
    [deserialize, modifyParams]
  )

  return [state, mutableParams]
}
