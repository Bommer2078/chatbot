<template>
  <div class="quick-actions">
    <div class="action-button" title="创建新对话" @click="createNewChat">
      <img src="../assets/images/首页/u221.png" alt="创建新对话">
    </div>
    <div class="action-button" title="历史会话" @click="viewHistory">
      <img src="../assets/images/首页/u216.png" alt="历史会话">
    </div>
    <div class="action-button" title="智能体广场" @click="goToAgents">
      <img src="../assets/images/首页/u226.png" alt="智能体广场">
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'QuickActions',
  methods: {
    ...mapMutations(['setCurrentTopic', 'setInitialMessage']),
    
    createNewChat() {
      // 创建新对话的功能
      if (this.$route.path === '/chat') {
        // 如果已经在聊天页面，在新窗口打开一个新的聊天
        const url = `${window.location.origin}/#/chat?new=true`;
        window.open(url, '_blank');
      } else {
        // 如果不在聊天页面，只设置参数并导航到聊天页面
        // 设置当前主题
        this.setCurrentTopic('与AI助手的对话');
        
        // 清空初始消息
        this.setInitialMessage('');
        
        // 跳转到聊天页面，添加 new=true 参数确保创建新对话
        this.$router.push('/chat?new=true');
      }
    },
    viewHistory() {
      // 导航到历史会话页面
      if (this.$route.path !== '/history') {
        this.$router.push('/history');
      }
    },
    goToAgents() {
      // 进入智能体广场的功能
      if (this.$route.path !== '/agents') {
        this.$router.push('/agents');
      }
    }
  }
}
</script>

<style scoped lang="scss">
.quick-actions {
  position: fixed;
  right: 15px;
  top: 30%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 25px;
  z-index: 100;
  background-color: #ffffff;
  padding: 18px 8px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  width: 46px;
}

.action-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto;
  
  &:hover {
    opacity: 1;
    padding: 3px;
    background-color: #eee;
    border-radius: 6px;
  }
  
  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}
</style> 