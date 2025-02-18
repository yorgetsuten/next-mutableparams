import type {
  ExtractKeys,
  SchemaValidator,
  ModifyParamsOptions,
  ParamsModificationData,
  UseMutableParamsOptions,
  Serializer,
  Deserializer
} from 'src/types'

import { type Dispatch, type SetStateAction, useCallback } from 'react'
import { getCurrentParams, getMergedOptions, stateFromEntries } from 'src/lib'
import { Target } from './Target'

export function useModifyParams<
  K extends ExtractKeys<T>,
  T extends SchemaValidator<T>
>(
  setState: Dispatch<SetStateAction<Partial<T>>>,
  serialize: Serializer<Required<T>>,
  deserialize: Deserializer<T>,
  hookOptions: UseMutableParamsOptions<T>
) {
  return useCallback(
    (
      { action, key, value }: ParamsModificationData<T, K>,
      modifyParamsOptions: ModifyParamsOptions = {}
    ) => {
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

      const handleSetAction = (key: K, value: T[K]) => {
        if (!serializeArrays && Array.isArray(value)) {
          current.delete(key)
          ;(value as (typeof value)[]).forEach((value) =>
            current.append(key, serialize(value))
          )
        } else {
          current.set(key, serialize(value))
        }
      }

      const handeDeleteAction = (key: K, value?: T[K]) => {
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
      setState,
      serialize,
      deserialize,
      hookOptions.replace,
      hookOptions.syncState,
      hookOptions.serializeArrays
    ]
  )
}
