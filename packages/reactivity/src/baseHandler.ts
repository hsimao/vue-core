import { isObject } from '@vue/shared'
import { reactive } from './reactive'
import { track, trigger } from './effect'

export const enum REACTIVE_FLAGS {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, receiver) {
    // 讓下次用 REACTIVE_FLAGS.IS_REACTIVE 檢查時返回 true
    if (key === REACTIVE_FLAGS.IS_REACTIVE) return true

    // 收集 effect 依賴
    track(target, 'get', key)

    // 透過 Reflect 將 this 指向 proxy, 後續建立類似 computed 的 get, 方法內依賴的值若更新了才會進到 get
    const res = Reflect.get(target, key, receiver)

    // 嵌套響應, 只有在取值時才進行代理, 性能較好 (Vue2 則是一開始就遞歸代理, 性能較差)
    if (isObject(res)) return reactive(res)

    return res
  },
  set(target, key, value, receiver) {
    // 若當前修改的值, 不存在原本依賴時當的響應數據, 直接返回
    let oldValue = target[key]
    if (!oldValue) return false

    // 若修改的值與原先相同, 則不需觸發 effect
    if (oldValue !== value) {
      // trigger 前要先修改值
      Reflect.set(target, key, value, receiver)

      trigger(target, 'set', key, value, oldValue)
    }

    return Reflect.set(target, key, value, receiver)
  }
}
