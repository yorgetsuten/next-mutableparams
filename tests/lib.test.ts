import {
  getCurrentParams,
  defaultSerializer,
  defaultDeserializer,
  stateFromEntries
} from 'src/lib'

import { describe, expect, test } from 'vitest'
import { flatSchema } from './schema'

test('getCurrentParams returns current URLSearchParams', () => {
  window.history.pushState({}, '', '/?a=1&b=2')
  
  expect(getCurrentParams()).toBeInstanceOf(URLSearchParams)
  expect(getCurrentParams().get('a')).toBe('1')
  expect(getCurrentParams().get('b')).toBe('2')
})

describe('default serializer and deserializer', () => {
  test.each(flatSchema)('serialize and deserialize %s', (_, value) => {
    const serialized = defaultSerializer(value)

    if (value && typeof value !== 'string')
      expect(serialized).not.toStrictEqual(value)
    expect(defaultDeserializer(serialized)).toStrictEqual(value)
  })
})

describe('objectFromSearchParamsEntries', () => {
  test.each(flatSchema)('from %s entrie', (key, value) => {
    const params = new URLSearchParams(`${key}=${defaultSerializer(value)}`)
    const object = stateFromEntries(
      params.entries(),
      defaultDeserializer
    )

    expect(object[key]).toStrictEqual(value)
  })
})
