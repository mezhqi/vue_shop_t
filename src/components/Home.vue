<template>
  <div>
    <el-button @click="signOut">推出</el-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Home extends Vue {
  signOut() {
    window.sessionStorage.clear()
    this.$router.push('/login')
  }
}
</script>

<style lang="less" scoped>
</style>
