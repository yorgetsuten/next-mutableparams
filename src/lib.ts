import type {
  Serializer,
  Deserializer,
  SchemaValidator,
  ParamsProcessingOptions,
  ParamsModificationOptions
} from './types'

export const defaultSerializer: Serializer<any> = (value) => {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export const defaultDeserializer: Deserializer<any> = (value) => {
  if (value === 'undefined') return undefined

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function getCurrentParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  } else {
    return new URL(window.location.href).searchParams
  }
}

export function getMergedOptions({
  hookOptions,
  defaultOptions,
  modifyParamsOptions
}: {
  hookOptions: ParamsModificationOptions & ParamsProcessingOptions
  defaultOptions: ParamsModificationOptions & ParamsProcessingOptions
  modifyParamsOptions: ParamsModificationOptions & ParamsProcessingOptions
}) {
  let key: keyof (ParamsModificationOptions & ParamsProcessingOptions)
  const options: ParamsModificationOptions & ParamsProcessingOptions = {}

  for (key in defaultOptions) {
    options[key] =
      modifyParamsOptions[key] ?? hookOptions[key] ?? defaultOptions[key]
  }

  return options
}

export function stateFromEntries<T extends SchemaValidator<T>>(
  entries: IterableIterator<[string, string]>,
  deserializer: Deserializer<T>
) {
  const obj: any = {}

  for (const [key, value] of entries) {
    if (obj[key] === undefined) {
      obj[key] = value
    } else if (Array.isArray(obj[key])) {
      obj[key].push(value)
    } else {
      obj[key] = [obj[key], value]
    }
  }

  // deserialisation only happens now to handle multidimensional arrays
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((value: string) => deserializer(value))
    } else {
      obj[key] = deserializer(obj[key])
    }
  }

  return obj
}
