<!--
 * @Author: xiaotao2018
 * @Date: 2023-03-14 14:04:33
 * @LastEditTime: 2023-03-14 15:51:56
-->
<script setup lang="ts">
</script>

<template>
  <div class="p-6">
    <ul class="leading-8">
      <li class="list-none">
        <router-link to="/question1">
          <el-link :underline="false" type="primary">Question1</el-link>
        </router-link>
      </li>
      <li class="list-none">
        <router-link to="/question2">
          <el-link :underline="false" type="primary">Question2</el-link>
        </router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>
