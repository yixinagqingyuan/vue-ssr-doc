// 原子组件css 插件
import 'uno.css';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';

function renderPreloadLinks(modules, manifest) {
  let links = '';
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  } else {
    return '';
  }
}

function renderTeleports(teleports) {
  if (!teleports) return '';
  return Object.entries(teleports).reduce((all, [key, value]) => {
    if (key.startsWith('#el-popper-container-')) {
      return `${all}<div id="${key.slice(1)}">${value}</div>`;
    }
    return all;
  }, teleports.body || '');
}
// 初始化vue、render
export async function render(url, manifest) {
  // 拿到实例
  const { app, router, store } = createApp();
  try {
    // 路由跳转，在服务端渲染对应组件模板
    await router.push(url);
    // 确保初始化之后执行
    await router.isReady();
    const ctx = {};
    // 渲染模板
    const html = await renderToString(app, ctx);
    // 处理css模板等内容 内容
    const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
    const teleports = renderTeleports(ctx.teleports);
    //拿到全局数据
    const state = JSON.stringify(store.state.value);
    return [html, state, preloadLinks, teleports];
  } catch (error) {
    console.log(error);
  }
}
