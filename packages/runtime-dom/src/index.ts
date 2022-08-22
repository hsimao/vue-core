import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

// 瀏覽器的渲染 API domAPI
const renderOptions = Object.assign(nodeOps, { patchProp })

export function render(vnode, container) {
  // 創建渲染器, 傳入 renderOptions
  createRenderer(renderOptions).render(vnode, container)
}
