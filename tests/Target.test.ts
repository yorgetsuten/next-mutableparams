import { describe, expect, it, test, vi } from 'vitest'
import { Target } from 'src/Target'

it('should be singleton', () => {
  expect(Target.instance).toBeInstanceOf(Target)
  expect(Target.instance).toBe(Target.instance)
})

describe('listeners', () => {
  const listener1 = vi.fn()
  const listener2 = vi.fn()
  const newState = {}

  test('both listeners should be called', () => {
    Target.instance.addTriggerListener(listener1)
    Target.instance.addTriggerListener(listener2)
    Target.instance.trigger({ newState })

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(newState)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(newState)
  })

  test('only one listener should be called if other is removed', () => {
    vi.clearAllMocks()
    Target.instance.removeTriggerListener(listener1)
    Target.instance.trigger({ newState })

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(newState)
  })

  test('instance should be deleted if both listeners are removed', () => {
    Target.instance.removeTriggerListener(listener2)
    // @ts-expect-error Accesing private property
    expect(Target.Instance).toBeUndefined()
  })
})
