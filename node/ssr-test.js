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
