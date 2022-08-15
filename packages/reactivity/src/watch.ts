import { isObject, isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

// 遞歸, set 來防止循環引用
function traversal(value, set = new Set()) {
  if (!isObject(value)) return

  if (set.has(value)) return

  set.add(value)

  for (let key in value) {
    traversal(value[key], set)
  }
}

export function watch(source, cb) {
  let getter

  if (isReactive(source)) {
    // 針對用戶傳遞的 source 進行遞歸循環, 只要訪問到屬性, 就會收集到 effect 內
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }

  // 保存用戶第一次傳的方法, 在下一次調用
  let cleanup
  const onCleanup = fn => (cleanup = fn)

  let oldValue
  const job = () => {
    // 下一次 watch 觸發上一次的 cleanup 方法
    if (cleanup) cleanup()

    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }

  // 監控自己的構造函數, 變化後重新執行 job
  const effect = new ReactiveEffect(getter, job)

  oldValue = effect.run()
}
