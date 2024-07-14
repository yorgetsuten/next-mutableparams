import { it, describe, expect, beforeEach, vi, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { type UseMutableParamsOptions, useMutableParams } from 'src'
import { type Schema, flatSchema, schema } from './schema'

const { result, rerender } = renderHook(
  (options?: UseMutableParamsOptions<Schema>) =>
    useMutableParams<Schema>(options)
)

const getMutableParams = () => result.current[1]
// const getMutableParamsState = () => result.current[0]

const { defaultSerializer, defaultDeserializer, ...lib } = await vi.hoisted(
  async () => {
    const lib = await vi.importActual<typeof import('src/lib')>('src/lib')

    return {
      ...lib,
      defaultSerializer: vi.fn().mockImplementation(lib.defaultSerializer),
      defaultDeserializer: vi.fn().mockImplementation(lib.defaultDeserializer)
    }
  }
)

vi.mock('src/lib', () => ({ ...lib, defaultSerializer, defaultDeserializer }))

beforeEach(() => {
  window.history.pushState(null, '', window.location.pathname)
  rerender({})
  vi.clearAllMocks()
})

describe('set', () => {
  describe('should set key to searchParams and serialize value', () => {
    test.each(flatSchema)('%s', (key, value) => {
      act(() => getMutableParams().set(key, value))

      const params = new URLSearchParams(window.location.search)

      expect(params.has(key)).toBe(true)
      expect(params.get(key)).toBeTruthy()
    })
  })

  it('should use provided serializer', () => {
    const serializer = vi.fn()

    rerender({ serializer })
    act(() => getMutableParams().set('string', schema.string))
    expect(serializer).toHaveBeenCalledTimes(1)
  })

  describe('should serialize arrays', () => {
    test('by default', () => {
      act(() => getMutableParams().set('array', schema.array))

      expect(
        new URLSearchParams(window.location.search).getAll('array').length
      ).toBe(1)
    })

    test('serializeArrays: true is provided as hook option', () => {
      rerender({ serializeArrays: true })
      act(() => getMutableParams().set('array', schema.array))

      expect(
        new URLSearchParams(window.location.search).getAll('array').length
      ).toBe(1)
    })

    test('serializeArrays: true as method option, serializeArrays: false as hook option', () => {
      rerender({ serializeArrays: false })
      act(() => {
        getMutableParams().set('array', schema.array, {
          serializeArrays: true
        })
      })

      expect(
        new URLSearchParams(window.location.search).getAll('array').length
      ).toBe(1)
    })
  })

  describe('should not serialize arrays', () => {
    test('serializeArrays: false is provided as hook option', () => {
      rerender({ serializeArrays: false })
      act(() => getMutableParams().set('array', schema.array))

      expect(
        new URLSearchParams(window.location.search).getAll('array').length
      ).not.toBe(1)
    })

    test('serializeArrays: false as method option, serializeArrays: true as hook option', () => {
      rerender({ serializeArrays: true })
      act(() => {
        getMutableParams().set('array', schema.array, {
          serializeArrays: false
        })
      })

      expect(
        new URLSearchParams(window.location.search).getAll('array').length
      ).not.toBe(1)
    })
  })

  const pushSpy = vi.spyOn(window.history, 'pushState')
  const replaceSpy = vi.spyOn(window.history, 'replaceState')

  describe('should use history.pushState', () => {
    test('by default', () => {
      act(() => getMutableParams().set('string', schema.string))

      expect(pushSpy).toHaveBeenCalledTimes(1)
      expect(replaceSpy).not.toHaveBeenCalled()
    })

    test('replace: false is provided as hook option', () => {
      rerender({ replace: false })
      act(() => getMutableParams().set('string', schema.string))

      expect(pushSpy).toHaveBeenCalledTimes(1)
      expect(replaceSpy).not.toHaveBeenCalled()
    })

    test('replace: false as method option, replace: true as hook option', () => {
      rerender({ replace: true })
      act(() =>
        getMutableParams().set('string', schema.string, { replace: false })
      )

      expect(pushSpy).toHaveBeenCalledTimes(1)
      expect(replaceSpy).not.toHaveBeenCalled()
    })
  })

  describe('should use history.replaceState', () => {
    test('replace: true is provided as hook option', () => {
      rerender({ replace: true })
      act(() => getMutableParams().set('string', schema.string))

      expect(replaceSpy).toHaveBeenCalledTimes(1)
      expect(pushSpy).not.toHaveBeenCalled()
    })

    test('replace: true as method option, replace: false as hook option', () => {
      rerender({ replace: false })
      act(() =>
        getMutableParams().set('string', schema.string, { replace: true })
      )

      expect(replaceSpy).toHaveBeenCalledTimes(1)
      expect(pushSpy).not.toHaveBeenCalled()
    })
  })
})

describe('get', () => {
  it('should return null if key is not in searchParams', () => {
    expect(getMutableParams().get('string')).toEqual(null)
  })

  describe('should get value from searchParams and deserialize it', () => {
    test.each(flatSchema)('%s', (key, value) => {
      act(() => getMutableParams().set(key, value))
      expect(getMutableParams().get(key)).toEqual(value)
    })
  })

  it('should use provided deserializer', () => {
    const deserializer = vi.fn()

    rerender({ deserializer })
    act(() => getMutableParams().set('string', schema.string))
    getMutableParams().get('string')
    expect(deserializer).toHaveBeenCalled()
  })
})

// describe('delete', () => {})

describe('options', () => {
  describe('methods should use provided serializer and deserializer', ()=> {
    const serializer = vi.fn()
    const deserializer = vi.fn()

    test('set', () => {
      rerender({ serializer })
      getMutableParams().set('string', schema.string)
      expect(serializer).toHaveBeenCalled()
      expect(defaultSerializer).not.toHaveBeenCalled()
    })

    test('get', () => {
      rerender({ deserializer })
      getMutableParams().set('string', schema.string)
      getMutableParams().get('string')
      expect(deserializer).toHaveBeenCalled()
      expect(defaultDeserializer).not.toHaveBeenCalled()
    })

    test('delete', () => {
      rerender({ serializer })
      getMutableParams().set('string', schema.string)
      getMutableParams().delete('string', schema.string)
      expect(serializer).toHaveBeenCalled()
      expect(defaultSerializer).not.toHaveBeenCalled()
    })

    test('entries', () => {
      rerender({ deserializer })
      getMutableParams().set('string', schema.string)
      getMutableParams().entries()
      expect(deserializer).toHaveBeenCalledTimes(1)
      expect(defaultDeserializer).not.toHaveBeenCalled()
    })

    test('values', () => {

    })

    test('forEach', () => {

    })
  })
})
