<!-- @format -->

# SSR

## 什么是 ssr

`SSR` 的全称是 `Server Side Rendering`，对应的中文名称是:服务端渲染，也就是将页面的 html 生成工作放在服务端进行。

所谓的 ssr 听起来很唬人，其实，他只是我们在现在的单页面应用时代下发明的`时髦的词`, 他还有个通俗的名字叫做-`套模板`,因为在前端`旧石器时代`,所有的网页都是服务端渲染(套模板)。

区别在于在之前用的是 java、php、jsp、asp、.net 等服务端语言，而现在我们用的是 `js` 语言。

之前是前端只是切图，后端套模板，而现在 套模板这个操作无聊且简单的操作，前端用一套更先进的技术来实现，这就是 `ssr`。

而在浏览器得到完整的结构后就可直接进行 DOM 的解析、构建、加载资源及后续的渲染。

## SSR 优缺点

### 优点

服务器端渲染的优势就是容易 SEO，首屏加载快，因为客户端接收到的是完整的 HTML 页面

### 缺点

渲染过程在后端完成，那么肯定会耗费后端资源，所以，基于 node 的服务端渲染，难得不是渲染而是高可用的 node 服务才是麻烦的地方

## SSR 与 CSR 的区别

与 SSR 对应的就是 CSR，全称是 Client Side Rendering，也就是客户端渲染。也就是我们现在的`单页面应用（spa项目）`

它是目前 Web 应用中主流的渲染模式，一般由 Server 端返回初始 HTML 内容，然后再由 JS 去异步加载数据，再完成页面的渲染。

这种模式下服务端只会返回一个页面的框架和 js 脚本资源，而不会返回具体的数据。如图：

![Alt text](/image.png)

## CSR（SPA） 优缺点

### 优点

页面之间的跳转不会刷新整个页面，而是局部刷新，体验上有了很大的提升。同时极大的减轻服务器压力

### 缺点

SPA 这种客户端渲染的方式在整体体验上有了很大的提升，但是它仍然有缺陷 - 对 SEO 不友好，页面首次加载可能有较长的白屏时间。

## SSR VS CSR(SPA)

一图胜千言

![Alt text](/csr-ssr.png)

在之前的内容中，我们毫不费力的分析了关于`SSR` 以及`CSR` 的区别以及优缺点，然后，接踵而至的问题就来了，有没有一个完美的方案来兼顾两者的优点呢？摒弃两者的缺点呢？

答案很简单，那就是合体，做个缝合怪

### SSR + SPA 完美的结合

只实现 SSR 没什么意义，技术上没有任何改进，否则 SPA 技术就不会出现。

但是单纯的 SPA 又不够完美，所以最好的方案就是这两种技术和体验的结合。

第一次打开页面是服务端渲染，基于第一次访问，用户的后续交互是 SPA 的效果和体验，于此同时还能解决 SEO 问题，这就有点完美了。

于是 vue + node SRR 就出现了,

## 常规 SSR

在开始之前，我们先来看看一个常规的 SSR 是怎么实现的，简单的模拟一下史前时代的套模板操作，回顾一下一个前端切图仔的工作流程
::: tip
问题：怎样实现一个基于 node 的 基础 ssr
:::

- 创建一个 node 服务
- 模拟数据请求方法 fetchData
- 将 fetchData 结果转换为 html 字符串
- 输出完整的 html 内容

代码如下:

```js
/** @format */

const http = require('http')

//模拟数据的获取
const fetchData = function () {
  return {
    list: [
      {
        name: '包子',
        num: 100,
      },
      {
        name: '饺子',
        num: 2000,
      },
      {
        name: '馒头',
        num: 10,
      },
    ],
  }
}

//数据转换为 html 内容
const dataToHtml = (data) => {
  var html = ''
  data.list.forEach((item) => {
    html += `<div>${item.name}有${item.num}个</div>`
  })

  return html
}

//服务
http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    })

    const html = dataToHtml(fetchData())

    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>传统 ssr</title>
</head>
<body>
    <div id="root">
       ${html}
    </div>
</body>
</html>
</body>
`)
  })
  .listen(9001)

console.log('server start...9001')
```

## vue-SSR 原理

温习了史前时代的套模板操作之后，我们就该揭秘现在的 SSR 原理。

之前我们说过，现在的 SSR 套路是`SSR + SPA 完美的结合`，所以他一定需要具备三个特点：

- 1、必须是同构应用--其实就是前后端一套代码，更容易维护，逻辑也统一
- 2、首屏需要具备服务端渲染能力，剩余内容需要走 `spa` --为了更完美的体验
- 2、必须结合最新技术栈特性比如虚拟 dom --为了更好复用，以及实现同构

在开始之前，我们先得解释一些基础概念

### 同构应用

::: tip
所谓同构，就是指前后端公用一套代码，也就是我们一个组件在能在前端使用，也能在后端使用
:::

而正是由于 js 语言的特殊性-既能搞前端也能搞后端，所以现代的`ssr`模式才能被广泛的使用

其实实现同构应用，从本质上来说，就是在服务端生成字符串，在客户端实现 `dom`，至于用什么`技术栈`实现并没有限制，我可以用原生 js， 也可以用`react`，而之所以我选用`vue`技术栈是因为他具备几个特点：

- 1、通过`虚拟dom`这个介质能够更简单的实现同构，渲染组件
- 2、我熟悉`vue`技术栈
- 3、`vue`官方提供了`vue-server-renderer`这个库，能够更简单的实现`ssr`
- 4、`vue`来实现可以更高效，写更少的代码,来达到目的

实现更高效的同构应用，我们必须要了解一下`虚拟dom`

### 虚拟 dom

::: tip
所谓虚拟 dom，就是一个 js 对象用来描述 dom 元素
:::

比如：

```html
<ul id="list">
  <li class="item">1</li>
  <li class="item">2</li>
  <li class="item">3</li>
</ul>
```

用虚拟 dom 描述

```js
const tree = {
  tag: 'ul', // 节点标签名
  props: {
    // DOM的属性，用一个对象存储键值对
    id: 'list',
  },
  children: [
    // 该节点的子节点
    { tag: 'li', props: { class: 'item' }, children: ['1'] },
    { tag: 'li', props: { class: 'item' }, children: ['2'] },
    { tag: 'li', props: { class: 'item' }, children: ['3'] },
  ],
}
```

我们发现虚拟 DOM 除了在渲染时用于提高渲染性能，以最小的代价来更新视图的作用外，其实他还有另一个作用就是为组件的跨平台渲染提供可能。

于是我们就能通跨平台的特性，来更容易的实现同构应用

而我们想到的东西，vue 作者早就想到了，所以他直接在 vue 中内置了，跨平台渲染的能力，也就是`vue-server-renderer`这个库

### vue-server-renderer

`vue-server-renderer` 说白了就是将 vue 组件变为字符串，并且通过模板引擎将数据注入到字符串中，最后返回一个完整的 html 页面

```js
/** @format */
const http = require('http')
// 此文件运行在 Node.js 服务器上
const { createSSRApp } = require('vue')
// Vue 的服务端渲染 API 位于 `vue/server-renderer` 路径下
const { renderToString } = require('vue/server-renderer')
const app = createSSRApp({
  data: () => ({ count: 1 }),
  template: `<button @click="count++">{{ count }}</button>`,
})
http
  .createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    })
    renderToString(app).then((html) => {
      res.end(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>基于vue的ssr</title>
      </head>
      <body>
          <div id="root">
             ${html}
          </div>
      </body>
      </html>
      </body>
      `)
    })
  })
  .listen(9000)
```

输出字符串如图：
![Alt text](/ssr1.png)

而他的原理其实就是利用`vue`中组件初始化之后生成的`虚拟dom`转换为字符串，我们简单来看下源码

之前我们说过了`renderToString` 最后的目标就是生成字符串，于是他就可以简单的分为那么几步

- 1、生成组件`vnode`（createVNode）
- 2、初始化以及执行 render 主流程`renderComponentVNode`
- 3、创建组件实例`createComponentInstance`
- 4、初始化组件执行`steup`(setupComponent)
- 5、渲染组件子树 `renderComponentSubTree`
- 6、执行组件`render`函数(ssrRender)
- 7、获取字符串数组（getBuffer）
- 8、字符串数组拼接为模板`unrollBuffer`

到这很多人就有一个疑问，为啥 ssrRender 函数到底是什么结构，他是怎么能得到 buffer 数组的,我们可以看下编译后的代码

![Alt text](/temp.png)

上图我们可以看出通过 push 函数，最终将模板编译后的`render` 函数执行，推入 buffer 数组中，进而拼接成模板字符串

### 与浏览器渲染区别

![Alt text](/vue.png)

上图中我们可以清楚的看出来客户端主要是调用`patch` 函数来执行挂载个更新，而在服务端用的是`push`函数

## ssr 项目搭建

完成了一些概念讲解之后，我们就可以该是着手搭建 ssr 项目了，它至少需要包含两个基本能力

- 1、 实现同构引用
- 2、具有友好的开发体验

## 实现同构应用

在之前的内容中，我们已讲了什么叫同构应用——也就是一套代码能跑两个端，于是我们就需要迫切的解决两个问题
1、 怎样保证全局状态和路由数据在两端同步
2、 怎样在客户端将页面激活能实现交互

### 保证全局状态和路由数据在两端同步

我们现在讲第一点，怎样保证全局状态的同步，本质上其实很简单，就是我们在服务端初始化之后，拿到全局状态数据，直接塞到客户端即可

代码如下：

```js
//在服务端
// 在模板中，加入__INITIAL_STATE__ 全局变量
window.__INITIAL_STATE__ = '<pinia-store>'
// 同步state 的值
const state = JSON.stringify(store.state.value)
const html = template.replace(`'<pinia-store>'`, state)
// 在客户端中取出值，直接塞到全局变量中去

if (window.__INITIAL_STATE__) {
  store.state.value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__))
}
```

而路由的同步，就需要麻烦一点了，因为理论情况下，当我们请求页面的时候，大家都知道，有前端路由也有后端路由

而我们在初始化的过程中，前端路由是不生效的，因为我们需要页面在后端直出，于是我们就需要，在后端获取路由

根据当前的 path 来查找具体的路由，然后根据路由得到具体的组件，然后将组件直出。

代码如下：

```js
// 创建服务匹配所有路由，来拦截初始化所有的路由情况
app.use('*', async (req, res) => {
  // 拿到当前路由路径
  const url = req.originalUrl
  const app = createSSRApp(App)
  // 初始化router
  const router = createRouter()
  app.use(router)
  // 路由跳转，在服务端渲染对应组件模板
  await router.push(url)
  // 确保初始化之后执行
  await router.isReady()
  // 渲染模板
  const html = await renderToString(app, ctx)
})
```

### 客户端将页面激活能实现交互

在客户端之所以能实现交互，原理很简单，我们在服务端跑的代码在客户端跑一遍就行了，只是将 dom 挂载这一块不执行即可

原理很简单，但是实现起来却有点麻烦，

首先，我们需要将打包的代码通过模板在客户端运行

然后，为了性能优化，我们只需要拿到当前路由的打包代码以及主流程代码

接着，在打包工具（webpack/vite）的加持下我们只需要更改模板即可

这样一来就能保持客户端和服务端渲染的代码以及路由代码一致

例子：

比如 访问`http://localhost/user` 链接，他的路由对应的代码应该是

```js
   {
        path: '/user',
        name: 'user',
        component: () => import('@/views/user.vue')
  },
```

打包后会生成 `ssr-manifest` 文件，其中包含所有文件打包后的对应的产物

如图：

![Alt text](/manifest.png)

然后再 `serve端` 初始化中将匹配到的文件塞入模板中

如图：

![Alt text](/html.png)

如此一来，就是一个完整的还未激活的`ssr流程`了

而之所以需要`ssr-manifest` 来进行匹配，就是为了保持两端一致，当已经激活后，路由懒加载的内容，不会被在初始化的时候加载出来，从而在保证性能的同时，有兼顾体验

### 客户端激活

客户端激活我们之前也说过，其实就是给服务端的代码在跑一遍

代码如下：

```js
// 初始化vue实例
const app = createSSRApp(App)
// 初始化pinia
const store = createPinia()
// 初始化router
const router = createRouter()
app.use(store).use(router)

// 同步state 的值
if (window.__INITIAL_STATE__) {
  store.state.value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__))
}
// router初始化完成 挂载
router.isReady().then(() => {
  app.mount('#app')
})
```

以上代码中，我们需要注意的是，初始化`vue` 实例需要`createSSRApp` 函数，而不是`createApp` 原因很简单，我已经有`dom`了，不需要在生成了,只需要根据在已有 dom 上绑定事件即可

我们来简单看一下执行流程

- 1、 初始化 vue 实例`createSSRApp`,确定渲染函数`hydrate`
- 2、 mount 函数执行挂载进而执行`hydrate`函数开启激活流程
- 3、 初始化组件`mountComponent`
- 4、 初始化`setup`(setupComponent)
- 5、 建立模板的响应式关系`setupRenderEffect`
- 6、 执行当前模板编译后的`render函数`激活页面`hydrateSubTree`
- 7、 启动类似`patch函数`开启事件绑定等流程`hydrateNode`
- 8、 `hydrateNode` 函数递归，直到所有节点绑定完成页面激活成功

## nuxt ssr
