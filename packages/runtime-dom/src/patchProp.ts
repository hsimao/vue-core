import { patchClass } from './modules/class'
import { patchStyle } from './modules/style'
import { patchAttr } from './modules/attrs'
import { patchEvent } from './modules/events'
// dom 屬性操作 api
// null, 有值
// 有值, 有值
// 有值, null
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
    // 匹配 on 開頭, 且後面接續不包含小寫的 a-z 字母才吻合 => onClick or onScroll
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}
