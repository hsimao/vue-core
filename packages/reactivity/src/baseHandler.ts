export const enum REACTIVE_FLAGS {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, receiver) {
    // 讓下次用 REACTIVE_FLAGS.IS_REACTIVE 檢查時返回 true
    if (key === REACTIVE_FLAGS.IS_REACTIVE) return true

    // 透過 Reflect 將 this 指向 proxy, 後續建立類似 computed 的 get, 方法內依賴的值若更新了才會進到 get
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
}
