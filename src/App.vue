<template>
  <div id="app">
    <router-view/>
    <QuickActions />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import QuickActions from '@/components/QuickActions.vue'

export default {
  name: 'App',
  components: {
    QuickActions
  },
  methods: {
    ...mapActions(['loadLikedMessages', 'loadChatSessions'])
  },
  created() {
    // 在应用启动时加载点赞状态和聊天会话
    this.loadLikedMessages();
    this.loadChatSessions();
  }
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
