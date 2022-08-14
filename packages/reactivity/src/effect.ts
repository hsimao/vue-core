export let activeEffect = null

// 解除 effect, 重新依賴收集
function cleanupEffect(effect) {
  const { deps } = effect
  // 這邊不能直接設置為空陣列 deps = [], 因為 Set 內的 effect 跟屬性有雙向引用關聯在
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  // ts 透過 public 參數會自動掛在 this 內 this.active
  public active = true
  public deps = [] // effect 須記錄當前的依賴數據屬性
  public parent = null

  constructor(public fn, public scheduler) {}

  run() {
    // 若非激活狀態, 只需要執行函示, 不需進行依賴收集
    if (!this.active) return this.fn()

    try {
      // 依賴收集, 將當前的 effect 和稍後渲染的屬性關聯再一起
      activeEffect = this

      // 嵌套 effect 用
      this.parent = activeEffect

      // 在執行前需要先將之前依賴的 effect 清空, activeEffect.deps = [(Set), (Set)]
      cleanupEffect(this)

      return this.fn()
    } finally {
      activeEffect = null
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn 可以根據狀態變化, 重新執行
  // 支持嵌套 effect(() => effect())

  // 建立響應式 effect
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()

  // 將 run 方法返回, _effect 儲存到 runner 方法內, 提供後續手動調用, 用法如下
  /*
    const runner = effect(() => {...})
    runner.stop() 停止 effect
    runner() 執行 effect
  */
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
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

  trackEffects(dep)
}

export function trackEffects(dep) {
  if (!activeEffect) return

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

  let effects = depsMap.get(key)
  if (!effects) return

  // 執行 effect
  triggerEffects(effects)
}

export function triggerEffects(effects) {
  // 執行之前, 先複製一份來執行, 不要關聯引用
  effects = new Set(effects)
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

    // 自訂義的 scheduler fallback
    if (effect.scheduler) return effect.scheduler()

    effect.run()
  })
}
