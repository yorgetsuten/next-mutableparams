import type { OnTriggerListener, TriggerEventDetail } from 'src/types'

export class Target extends EventTarget {
  private static Instance?: Target

  static get instance() {
    return this.Instance ?? (this.Instance = new Target())
  }

  private onTriggerListeners: OnTriggerListener[]

  private constructor() {
    super()

    this.onTriggerListeners = []

    this.addEventListener('trigger', ((e: CustomEvent<TriggerEventDetail>) => {
      this.onTriggerListeners.forEach((fn) => {
        fn(e.detail.newState)
      })
    }) as EventListener)
  }

  trigger(detail: TriggerEventDetail) {
    this.dispatchEvent(new CustomEvent('trigger', { detail }))
  }

  addTriggerListener(fn: OnTriggerListener) {
    if (!this.onTriggerListeners.includes(fn))
      this.onTriggerListeners = [...this.onTriggerListeners, fn]
  }

  removeTriggerListener(fn: OnTriggerListener) {
    const index = this.onTriggerListeners.indexOf(fn)

    if (index !== -1)
      this.onTriggerListeners = this.onTriggerListeners.toSpliced(index, 1)

    if (this.onTriggerListeners.length === 0) delete Target.Instance
  }
}
