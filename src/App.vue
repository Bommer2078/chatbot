<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}

#app {
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>
