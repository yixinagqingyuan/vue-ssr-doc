import { createApp } from './main';
import 'uno.css';
import '@/assets/css/index.css';
import 'element-plus/theme-chalk/base.css';
const { app, router, store } = createApp();
// 同步state 的值
if (window.__INITIAL_STATE__) {
  store.state.value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__));
}

router.isReady().then(() => {
  app.mount('#app');
});
