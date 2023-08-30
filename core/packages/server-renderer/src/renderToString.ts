import {
  App,
  createApp,
  createVNode,
  ssrContextKey,
  ssrUtils,
  VNode
} from 'vue'
import { isPromise, isString } from '@vue/shared'
import { SSRContext, renderComponentVNode, SSRBuffer } from './render'

const { isVNode } = ssrUtils

async function unrollBuffer(buffer: SSRBuffer): Promise<string> {
  if (buffer.hasAsync) {
    let ret = ''
    for (let i = 0; i < buffer.length; i++) {
      let item = buffer[i]
      if (isPromise(item)) {
        item = await item
      }
      if (isString(item)) {
        ret += item
      } else {
        ret += await unrollBuffer(item)
      }
    }
    return ret
  } else {
    // sync buffer can be more efficiently unrolled without unnecessary await
    // ticks
    return unrollBufferSync(buffer)
  }
}

function unrollBufferSync(buffer: SSRBuffer): string {
  let ret = ''
  for (let i = 0; i < buffer.length; i++) {
    let item = buffer[i]
    if (isString(item)) {
      ret += item
    } else {
      // since this is a sync buffer, child buffers are never promises
      ret += unrollBufferSync(item as SSRBuffer)
    }
  }
  return ret
}
// 输出字符串方法
export async function renderToString(
  input: App | VNode,
  context: SSRContext = {}
): Promise<string> {
  // 判断是不是一个vnode如果是就在包一层，重新初始化一下
  if (isVNode(input)) {
    // raw vnode, wrap with app (for context)
    return renderToString(createApp({ render: () => input }), context)
  }

  // rendering an app
  // 生成vnode
  const vnode = createVNode(input._component, input._props)
  vnode.appContext = input._context
  // provide the ssr context to the tree
  input.provide(ssrContextKey, context)
  // 初始化组件生成字符串数组
  const buffer = await renderComponentVNode(vnode)
  // 字符串拼接为模板
  const result = await unrollBuffer(buffer as SSRBuffer)

  await resolveTeleports(context)

  if (context.__watcherHandles) {
    for (const unwatch of context.__watcherHandles) {
      unwatch()
    }
  }

  return result
}

export async function resolveTeleports(context: SSRContext) {
  if (context.__teleportBuffers) {
    context.teleports = context.teleports || {}
    for (const key in context.__teleportBuffers) {
      // note: it's OK to await sequentially here because the Promises were
      // created eagerly in parallel.
      context.teleports[key] = await unrollBuffer(
        await Promise.all([context.__teleportBuffers[key]])
      )
    }
  }
}
