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
      console.log(html)
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
