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

import {
  getCurrentParams,
  getMergedOptions,
  defaultSerializer,
  defaultDeserializer,
  stateFromEntries
} from './lib'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Target } from './Target'

export function useMutableParams<T extends SchemaValidator<T>>(
  useMutableParamsOptions?: UseMutableParamsOptions<Required<T>>
): [Partial<T>, MutableParams<T>] {
  type Schema = Required<T>
  type Keys = ExtractKeys<Schema>

  const serializer: Serializer<Schema> = useMemo(
    () => useMutableParamsOptions?.serializer ?? defaultSerializer,
    [useMutableParamsOptions?.serializer]
  )

  const deserializer: Deserializer<Schema> = useMemo(
    () => useMutableParamsOptions?.deserializer ?? defaultDeserializer,
    [useMutableParamsOptions?.deserializer]
  )

  const [state, setState] = useState<Partial<T>>({})

  useEffect(() => {
    setState(stateFromEntries(getCurrentParams().entries(), deserializer))
  }, [deserializer])

  useEffect(() => {
    const listener: OnTriggerListener = (newState) => {
      setState(newState)
    }

    if (useMutableParamsOptions?.syncState === true) {
      Target.instance.addTriggerListener(listener)

      return () => {
        Target.instance.removeTriggerListener(listener)
      }
    } else {
      // in case syncState changed
      Target.instance.removeTriggerListener(listener)
    }
  }, [useMutableParamsOptions?.syncState])

  const modifyParams: ModifyParams<Schema> = useCallback(
    ({ action, key, value }, modifyParamsOptions) => {
      const current = getCurrentParams()

      const { serializeArrays, syncState, replace } = getMergedOptions({
        useMutableParamsOptions,
        modifyParamsOptions,
        defaultOptions: {
          serializeArrays: true,
          syncState: false,
          replace: false
        }
      })

      const handleSetAction = <K extends Keys>(key: K, value: Schema[K]) => {
        if (!serializeArrays && Array.isArray(value)) {
          current.delete(key)
          ;(value as (typeof value)[]).forEach((value) =>
            current.append(key, serializer(value))
          )
        } else {
          current.set(key, serializer(value))
        }
      }

      const handeDeleteAction = <K extends Keys>(key: K, value?: Schema[K]) => {
        if (current.getAll(key).length > 1 && Array.isArray(value)) {
          ;(value as (typeof value)[]).forEach((value) =>
            current.delete(key, serializer(value))
          )
        } else {
          current.delete(key, value && serializer(value))
        }
      }

      if (action === 'set') {
        handleSetAction(key, value)
      } else {
        handeDeleteAction(key, value)
      }

      const params = current.toString()
      const newUrl = `${window.location.pathname}${params ? `?${params}` : ''}`
      const newState = stateFromEntries(current.entries(), deserializer)

      if (replace) {
        window.history.replaceState(null, '', newUrl)
      } else {
        window.history.pushState(null, '', newUrl)
      }

      if (syncState) {
        Target.instance.trigger({ newState })
      } else {
        setState(newState)
      }
    },

    [deserializer, serializer, useMutableParamsOptions]
  )

  const mutableParams: MutableParams<Schema> = useMemo(
    () => ({
      get<K extends Keys>(key: K): Schema[K] | null {
        const values = getCurrentParams().getAll(key)

        if (values.length === 0) {
          return null
        } else if (values.length === 1) {
          return deserializer<K>(values[0])
        } else {
          return values.map((value) => deserializer<K>(value)) as Schema[K]
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
          yield [key, deserializer(value)] as Entrie<Schema, K>
        }
      },

      *keys() {
        for (const key of getCurrentParams().keys()) {
          yield key as Keys
        }
      },

      *values() {
        for (const value of getCurrentParams().values()) {
          yield deserializer(value)
        }
      },

      forEach<K extends Keys>(fn: ForEachFn<Schema, K>) {
        getCurrentParams().forEach((value, key) => {
          fn(
            ...([deserializer(value), key] as Parameters<ForEachFn<Schema, K>>)
          )
        })
      },

      size: getCurrentParams().size,

      sort() {
        window.history.replaceState(null, '', `?${getCurrentParams().sort()}`)
      },

      toString: () => getCurrentParams().toString(),

      has: (key) => getCurrentParams().has(key)
    }),
    [deserializer, modifyParams]
  )

  return [state, mutableParams]
}
