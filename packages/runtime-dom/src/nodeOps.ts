export const nodeOps = {
  // 新增
  insert(child, parent, anchor = null) {
    // appendChild
    parent.insertBefore(child, anchor)
  },
  // 刪除
  remove(child) {
    const parentNode = child.parentNode
    if (parentNode) {
      parentNode.removeChild(child)
    }
  },
  // 修改
  setElementText(el, text) {
    el.textContent = text
  },
  // node => document.createTextNode()
  setText(node, text) {
    node.nodeValue = text
  },
  querySelector(selector) {
    return document.querySelector(selector)
  },
  // 取得父層 node
  parentNode(node) {
    return node.parentNode
  },
  // 取得兄弟層級 node
  nextSibling(node) {
    return node.nextSibling
  },
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createText(text) {
    return document.createTextNode(text)
  }
}
