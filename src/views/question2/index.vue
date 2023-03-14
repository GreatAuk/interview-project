<!--
 * @Author: xiaotao2018
 * @Date: 2023-03-14 14:04:33
 * @LastEditTime: 2023-03-14 16:16:54
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { queryOrder } from '@/api/order'

type OrderResult = '成功' | '失败' | '未知'

const apiResult = ref()
const orderResult = ref<OrderResult>()
const orderResult2 = ref('')

function promiseRetry(func: Function, maxTries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    function attempt() {
      console.log('promiseRetry', maxTries)
      func().then(resolve).catch((error:any) => {
        if (maxTries <= 1) {
          reject(error)
        } else {
          maxTries--
          setTimeout(attempt, delay)
        }
      })
    }
    attempt()
  })
}

const myFunct = function() {
  return new Promise((resolve, reject) => {
    queryOrder().then(res => {
      const { data } = res
      apiResult.value = data
      if (data.code === 1000) {
        // 订单成功
        resolve(data)
      } else if (data.code === -1000) {
        // 订单失败
        resolve(data)
      } else {
        // 未知状态，重新查询
        reject()
      }
    })

  })
}

onMounted(() => {
  myOnTry()
})

function myOnTry () {
  orderResult.value = ''
  promiseRetry(myFunct, 10, 3000).then((res) => {
    console.log('res', res)
    orderResult.value = res?.message
  }).catch((err) => {
    orderResult.value = '未知'
  })
}




</script>

<template>
  <h1>订单结果：{{ orderResult  || '-' }}<el-button type="primary" :loading="!orderResult" size="small" class="ml-5" @click="myOnTry">{{!orderResult?'请求中...':'再次请求'}}</el-button></h1>
  <h2>API 调用结果:</h2>
  <pre class="bg-[hsl(220_18%_10%)] rounded-2 p-4 text-#9cdcfe">{{ apiResult ? JSON.stringify(apiResult, null, 2) : '' }}</pre>
</template>