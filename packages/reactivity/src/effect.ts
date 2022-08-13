export let activeEffect = null

class ReactiveEffect {
  // ts 透過 public 參數會自動掛在 this 內 this.active
  public active = true
  public deps = [] // effect 須記錄當前的依賴數據屬性
  public parent = null

  constructor(public fn) {}

  run() {
    // 若非激活狀態, 只需要執行函示, 不需進行依賴收集
    if (!this.active) return this.fn()

    try {
      // 依賴收集, 將當前的 effect 和稍後渲染的屬性關聯再一起
      activeEffect = this

      // 嵌套 effect 用
      this.parent = activeEffect

      return this.fn()
    } finally {
      activeEffect = null
    }
  }
}

export function effect(fn) {
  // fn 可以根據狀態變化, 重新執行
  // 支持嵌套 effect(() => effect())

  // 建立響應式 effect
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// 多對多：effect 跟響應數據是多對多的關聯, 一個 effect 對應多個屬性, 一個屬性對應多個 effect
// 使用 WeakMap 來儲存
// WeakMap => {物件: Map{ name: Set }} => {物件: {name: []}}
const targetMap = new WeakMap()
export function track(target, type, key) {
  // 不是透過 effect 方法內執行的響應數據, 不用追蹤
  if (!activeEffect) return

  // 若當要追蹤響應數據沒有在 targetMap
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 針對響應數據建立 Map 數據結構
    targetMap.set(target, (depsMap = new Map()))
  }

  // 判斷響應數據的某一屬性「key」 是否已經在 Map 內
  let dep = depsMap.get(key)
  if (!dep) {
    // 將屬性建立 Set 結構,
    depsMap.set(key, (dep = new Set()))
  }

  // 不重複儲存 effect, 避免相同 effect 內調用多次相同屬性, 導致重複執行問題
  const shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    // 數據屬性關聯 effect
    dep.add(activeEffect)

    // effect 關聯數據
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)

  if (!depsMap) return

  const effects = depsMap.get(key)

  effects &&
    effects.forEach(effect => {
      /*
      1.) effect 內直接修改屬性時, 觸發 set 導致無限循環
      2.) 同一個 effect, 依賴了多個響應屬性, 導致依賴多個相同 effect, 如下場景
        const user = reactive({ firstName: 'Mars', lastName: 'CHEN' })
        effect(() => {
          const fullname = user.firstName + ' ' + user.lastName
        })
      */
      if (effect === activeEffect) return
      effect.run()
    })
}
