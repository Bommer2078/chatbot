<template>
  <div class="chat-home">
    <SidebarMenu />
    
    <div class="chat-container">
      <div class="chat-header">
        <div class="user-greeting">
          首页
        </div>
        <img src="../assets/images/首页/u57.png" alt="企业logo">
      </div>
      
      <div class="center-content">
        <div class="greeting-header">
          <h1 class="greeting">晚上好，张义民</h1>
          <p class="greeting-description">我是你的AI私人助理，能看新闻、读政策、查数据、做分析和推理等，快来试试吧！</p>
        </div>
        
        <div class="chat-content">
          <ChatInputBox @send="startChat" />
          
          <div class="function-buttons">
            <div class="function-button" @click="startChat('AI校闻速递')">
              <img src="../assets/images/首页/u180.png" alt="写作" class="function-icon">
              <span>AI校闻速递</span>
            </div>
            <div class="function-button" @click="startChat('AI待办精灵')">
              <img src="../assets/images/首页/u194.png" alt="图像生成" class="function-icon">
              <span>AI待办精灵</span>
            </div>
            <div class="function-button" @click="startChat('AI课表助手')">
              <img src="../assets/images/首页/u187.png" alt="AI搜索" class="function-icon">
              <span>AI课表助手</span>
            </div>
            <div class="function-button" @click="startChat('AI成绩大师')">
              <img src="../assets/images/首页/u201.png" alt="AI阅读" class="function-icon">
              <span>AI成绩大师</span>
            </div>
            <div class="function-button" @click="startChat('更多功能')">
              <img src="../assets/images/首页/u233.png" alt="更多" class="function-icon">
              <span>更多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import SidebarMenu from '@/components/Sidebar.vue'
import ChatInputBox from '@/components/ChatInput.vue'

export default {
  name: 'ChatHomePage',
  components: {
    SidebarMenu,
    ChatInputBox
  },
  computed: {
    ...mapState(['user', 'chatHistory'])
  },
  methods: {
    ...mapMutations(['setCurrentTopic', 'setInitialMessage']),
    
    scrollToBottom() {
      // 在 ChatHome 中不需要滚动，因为没有消息容器
      // 移除对不存在的 messagesContainer 的引用
    },
    
    startChat(topic) {
      // 设置当前主题和初始消息
      if (typeof topic === 'string' && topic.length > 0) {
        // 如果是从输入框发送的消息，直接添加到聊天历史
        if (topic !== 'AI校闻速递' && topic !== 'AI待办精灵' && topic !== 'AI课表助手' && 
            topic !== 'AI成绩大师' && topic !== '更多功能') {
          
          // 确保聊天会话已加载
          this.$store.dispatch('loadChatSessions');
          
          // 创建一个新会话
          const sessionId = Date.now().toString()
          this.$store.commit('addChatSession', {
            id: sessionId,
            title: '新对话',
            messages: [{
              id: Date.now(),
              content: topic,
              sender: 'user',
              timestamp: new Date().toISOString()
            }],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          })
          
          // 清空初始消息，避免在对话页面重复显示
          this.setInitialMessage('')
          
          // 设置当前主题
          this.setCurrentTopic('新对话')
          
          // 跳转到聊天页面
          this.$router.push('/chat')
          
          // 在跳转后，使用 Vuex action 发送消息以触发回复
          setTimeout(() => {
            this.$store.dispatch('sendResponse', topic)
          }, 100)
        } else {
          // 如果是点击功能按钮，设置主题
          this.setCurrentTopic(topic)
          // 清空初始消息
          this.setInitialMessage('')
          
          // 跳转到聊天页面
          this.$router.push('/chat')
        }
      }
    },
    
    usePrompt(prompt) {
      // 将提示填入输入框
      this.$store.commit('setCurrentMessage', prompt)
    }
  },
  watch: {
    chatHistory() {
      // 在 ChatHome 中不需要滚动
    }
  }
}
</script>

<style scoped lang="scss">
.chat-home {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 20px;
  position: relative;
}

.chat-header {
  padding: $spacing-base $spacing-large;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  
  img {
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
  
  .user-greeting {
    font-size: 22px;
    font-weight: 700;
  }
  .greeting-description {
  font-size: 13px;
  color: #363636;
  }
}

.center-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;/* 为顶部header留出空间 */
}

.greeting-header {
  text-align: center;
  margin-bottom: 20px;
}

.greeting {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.chat-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.function-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.function-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  .function-icon {
    width: 18px;
    height: 18px;
    margin-right: 6px;
  }
  
  span {
    font-size: 14px;
    color: #333;
  }
}
</style> 