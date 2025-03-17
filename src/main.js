import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/global.scss'

Vue.use(ElementUI)
Vue.config.productionTip = false

// 创建全局事件总线
window.EventBus = new Vue();

// 在应用启动时加载聊天会话
store.dispatch('loadChatSessions');
store.dispatch('loadLikedMessages');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
