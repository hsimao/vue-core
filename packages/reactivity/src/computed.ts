import { isFunction } from '@vue/shared'
import { ReactiveEffect, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl {
  public effect
  private dep = new Set()
  private _value
  private _dirty = true

  constructor(getter, public setter) {
    // 將用戶的 getter 放到 effect 中, 進行收集
    this.effect = new ReactiveEffect(getter, () => {
      // 依賴屬性變化, 會觸發此 scheduler 方法
      if (!this._dirty) {
        this._dirty = true
        triggerEffects(this.dep)
      }
    })
  }

  get value() {
    // 依賴收集, 將當下的 activeEffect 收集起來
    trackEffects(this.dep)

    // 值有變更才執行 effect
    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = getterOrOptions => {
  const onlyGetter = isFunction(getterOrOptions)

  let getter
  let setter

  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => console.warn('no set')
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
