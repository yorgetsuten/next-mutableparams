import type {
  Serializer,
  ExtractKeys,
  SchemaValidator,
  UseMutableParamsOptions,
  Deserializer,
  OnTriggerListener
} from 'src/types'

import { Target } from './Target'
import { useModifyParams } from './useModifyParams'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { deserializer, serializer, stateFromEntries } from 'src/lib'

export function useModel<
  K extends ExtractKeys<T>,
  T extends SchemaValidator<T>
>(hookOptions: UseMutableParamsOptions<T>) {
  const readOnlyParams = useSearchParams()

  const [state, setState] = useState<Partial<T>>(
    stateFromEntries(readOnlyParams.entries(), deserializer)
  )

  const serialize: Serializer<T> = useMemo(
    () => hookOptions.serializer ?? serializer,
    [hookOptions.serializer]
  )

  const deserialize: Deserializer<T> = useMemo(
    () => hookOptions.deserializer ?? deserializer,
    [hookOptions.deserializer]
  )

  const modifyParams = useModifyParams<K, T>(
    setState,
    serialize,
    deserialize,
    hookOptions
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
    }
  }, [hookOptions.syncState])

  return { state, deserialize, modifyParams }
}
