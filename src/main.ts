import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// axios
import axios from 'axios'
// elementUI
import './plugins/element.js'
// 全局样式
import './assets/css/global.css'
// 字体图标
import './assets/font/iconfont.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
