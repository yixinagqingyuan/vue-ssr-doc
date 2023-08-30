/** @format */

import { defineUserConfig, defaultTheme } from 'vuepress'
import { searchPlugin } from '@vuepress/plugin-search'
export default defineUserConfig({
  lang: 'zh-CN',
  title: 'vueSSR原理分析',
  description: 'vueSSR原理分析',
  theme: defaultTheme({
    navbar: [
      {
        text: '服务端渲染',
        link: '/',
      },
    ],
  }),
  plugins: [searchPlugin({})],
})
