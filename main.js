// import App from './App'

// // #ifndef VUE3
// import Vue from 'vue'
// import './uni.promisify.adaptor'
// Vue.config.productionTip = false
// App.mpType = 'app'
// const app = new Vue({
//   ...App
// })
// app.$mount()
// // #endif

// // #ifdef VUE3
// import { createSSRApp } from 'vue'
// export function createApp() {
//   const app = createSSRApp(App)
//   return {
//     app
//   }
// }
// // #endif

import App from './App'
// #ifndef VUE3
 
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif
 
// #ifdef VUE3
import { createSSRApp } from 'vue'
// 引入主Store
import pinia from "./stores/index.js"
export function createApp() {
  const app = createSSRApp(App)
  // 挂载到实例
  app.use(pinia)
  return {
    app
  }
}
// #endif