/*
 * @Author: xiaotao2018
 * @Date: 2023-03-14 14:04:33
 * @LastEditTime: 2023-03-14 15:18:48
 */
import { createApp } from 'vue'
import App from '@/App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import 'uno.css'

import './style.css'

import { router } from '@/router'

if (import.meta.env.DEV) {
  const { worker } = await import('@/mocks/browser')
  worker.start()
}

const app = createApp(App)
app.use(ElementPlus, {locale: zhCn})
app.use(router)

app.mount('#app')
