// style 需要比對差異
// { color: 'red' } => {color: 'green'}
// { color: 'red', fontSize: '12' } => {color: 'green'}
export function patchStyle(el, prevValue, nextValue) {
  // 遍歷 nextValue, 若原本就有的屬性, 直接覆蓋
  for (let key in nextValue) {
    el.style[key] = nextValue[key]
  }

  // 遍歷 prevValue, 若屬性不在新值內, 直接刪除
  if (prevValue) {
    for (let key in prevValue) {
      if (!nextValue[key]) el.style[key] = null
    }
  }
}
