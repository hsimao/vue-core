// 將事件方法儲存到 methods 內的 value 內
function createInvoker(callback) {
  const invoker = () => invoker.value
  invoker.value = callback
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  // 先移除掉事件, 再重新綁定事件
  // remove -> add 改成 add + 自定義事件(替換調用綁定的方法)

  // onClick => click
  const event = eventName.slice(2).toLowerCase()

  // 緩存事件
  const invokers = el.vei || (el.vei = {})

  // 是否已經綁定過
  const exits = invokers[eventName]

  // 1.) 事件已綁定, 有方法, 替換方法
  if (exits && nextValue) return (exits.value = nextValue)

  // 2.) 事件已綁定, 但沒有方法, 移除事件、invokers 緩存
  if (exits && !nextValue) {
    el.removeEventListener(event, exits)
    invokers[eventName] = undefined
    return
  }

  // 3.) 事件未綁定, 有方法, 創建 invoker, 建立綁定
  if (!exits && nextValue) {
    const invoker = createInvoker(nextValue)
    invokers[eventName] = invoker
    el.addEventListener(event, invoker)
    return
  }
}
