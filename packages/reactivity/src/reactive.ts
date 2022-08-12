import { isObject } from '@vue/shared'
import { mutableHandlers, REACTIVE_FLAGS } from './baseHandler'

const reactiveMap = new WeakMap()

// 同一個物件若進行多次代理, 也僅會返回同一個代理
export function reactive(target) {
  if (!isObject(target)) return

  // 已經是 proxy 直接返回
  if (target[REACTIVE_FLAGS.IS_REACTIVE]) return target

  // 相同 target, 直接返回緩存 proxy
  const exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) return exisitingProxy

  const proxy = new Proxy(target, mutableHandlers)

  // 緩存 proxy 避免重複代理, 導致性能浪費
  reactiveMap.set(target, proxy)
  return proxy
}
