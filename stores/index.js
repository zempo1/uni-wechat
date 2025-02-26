// 引入pinia
import { createPinia } from "pinia"
 
// 引入pinia持久化插件
import persist from "pinia-plugin-persistedstate"
 
// 实例化pinia
const pinia = createPinia()
 
// 使用persist插件
pinia.use(persist)
 
// 导出pinia引入main.js使用
export default pinia;
 
// 导出所有子模块中的数据
export * from "./modules"