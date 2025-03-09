<template>
  <div class="chat-dialog">
    <SidebarMenu />
    
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-title">
          <span class="title-text">AI对话</span>
          <span class="session-name">{{ sessionTitle }}</span>
        </div>
        <div class="header-actions">
          <img src="../assets/images/首页/u57.png" alt="设置" class="action-icon">
          <button class="back-button" @click="goBack">返回首页</button>
        </div>
      </div>
      
      <div class="chat-content">
        <div class="messages-container" ref="messagesContainer">
          <div v-for="(message, index) in chatMessages" :key="index" 
               :class="['message-wrapper', message.sender === 'user' ? 'user-wrapper' : 'bot-wrapper']">
            <div class="avatar-container">
              <img :src="message.sender === 'user' ? userAvatar : botAvatar" class="avatar-img">
            </div>
            <div :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']">
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
          
          <div v-if="botTyping" class="message-wrapper bot-wrapper">
            <div class="avatar-container">
              <img :src="botAvatar" alt="AI头像" class="avatar-img">
            </div>
            <div class="message bot-message typing">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea 
              v-model="inputMessage" 
              class="message-input" 
              placeholder="请提问..."
              @keydown.enter.prevent="sendMessage"
            ></textarea>
            
            <div class="input-toolbar">
              <div class="toolbar-left">
                <div class="deep-thinking" title="深度思考">
                  <img src="../assets/images/首页/u166.png" alt="深度思考" class="icon-img">
                  <span>深度思考</span>
                </div>
                <div class="deep-thinking" title="联网搜索">
                  <img src="../assets/images/首页/u173.png" alt="联网搜索" class="icon-img">
                  <span>联网搜索</span>
                </div>
              </div>
              
              <div class="toolbar-right">
                <img src="../assets/images/首页/u209.png" alt="附件" class="icon-img" title="附件">
                <img src="../assets/images/首页/u207.png" alt="图片" class="icon-img" title="图片">
                <img src="../assets/images/首页/u203.png" alt="语音" class="icon-img" title="语音">
                <img src="../assets/images/首页/u205.png" alt="发送" class="icon-img" title="发送" @click="sendMessage" :class="{ 'disabled': !inputMessage.trim() }">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import SidebarMenu from '@/components/Sidebar.vue'

export default {
  name: 'ChatDialog',
  components: {
    SidebarMenu
  },
  data() {
    return {
      botTyping: false,
      inputMessage: '',
      inputDisable: false,
      botAvatar: require('@/assets/images/开启会话/u844.png'), // 使用已知存在的图片
      userAvatar: require('@/assets/images/开启会话/u846.png') // 使用已知存在的图片作为用户头像
    }
  },
  computed: {
    ...mapState(['user', 'chatHistory', 'initialMessage', 'currentTopic']),
    ...mapGetters(['currentSession']),
    
    sessionTitle() {
      return this.currentSession ? this.currentSession.title : 'AI对话'
    },
    
    chatMessages() {
      return this.currentSession ? this.currentSession.messages : []
    }
  },
  methods: {
    ...mapActions(['sendMessage', 'createNewSession']),
    
    sendMessage() {
      if (!this.inputMessage.trim() || this.inputDisable) return
      
      // 保存当前输入的消息
      const userMessage = this.inputMessage.trim()
      
      // 清空输入框
      this.inputMessage = ''
      
      // 添加用户消息到会话
      const userMessageObj = {
        id: Date.now(),
        content: userMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      }
      
      // 直接添加到聊天历史
      this.$store.commit('addChatMessage', userMessageObj)
      
      // 如果没有当前会话，创建一个新会话
      if (!this.currentSession) {
        this.createNewSession('AI对话')
      }
      
      // 更新会话
      if (this.currentSession) {
        this.$store.commit('updateChatSession', {
          sessionId: this.currentSession.id,
          messages: [...this.currentSession.messages, userMessageObj]
        })
      }
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 显示机器人正在输入
      this.botTyping = true
      this.inputDisable = true
      
      // 模拟API调用延迟
      setTimeout(() => {
        // 生成机器人回复
        const botResponse = this.generateResponse(userMessage)
        
        // 隐藏输入指示器
        this.botTyping = false
        this.inputDisable = false
        
        // 添加机器人回复到聊天历史
        const botMessageObj = {
          id: Date.now() + 1,
          content: botResponse,
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        this.$store.commit('addChatMessage', botMessageObj)
        
        // 更新会话
        if (this.currentSession) {
          this.$store.commit('updateChatSession', {
            sessionId: this.currentSession.id,
            messages: [...this.currentSession.messages, botMessageObj]
          })
        }
        
        // 滚动到底部
        this.scrollToBottom()
      }, 1500)
    },
    
    // 生成回复的辅助函数
    generateResponse(message) {
      const responses = [
        `您好，我是您的AI助手。您询问的"${message}"问题，我可以这样回答：`,
        `关于"${message}"，我有以下见解：`,
        `您提到的"${message}"是一个很好的问题。根据我的理解：`,
        `感谢您的提问"${message}"。以下是我的回答：`
      ]
      
      const details = [
        "AI技术正在快速发展，大语言模型如GPT系列已经能够理解和生成人类语言，辅助完成各种任务。",
        "教育领域的AI应用正在改变传统教学方式，个性化学习、智能评估和自适应课程是主要发展方向。",
        "云尚教育致力于将AI技术与教育深度融合，为师生提供更智能、更高效的教育解决方案。",
        "数据显示，采用AI辅助教学的学校，学生的学习效率提升了约30%，教师的工作负担减轻了约25%。"
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const randomDetail = details[Math.floor(Math.random() * details.length)]
      
      return `${randomResponse}\n\n${randomDetail}\n\n您还有其他问题吗？我很乐意继续为您解答。`
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
        }
      })
    },
    
    goBack() {
      this.$router.push('/')
    },
    
    initChat() {
      // 如果有当前会话，直接使用
      if (this.currentSession) {
        // 检查会话中是否只有用户消息，没有机器人回复
        const hasUserMessageOnly = this.currentSession.messages.length === 1 && 
                                  this.currentSession.messages[0].sender === 'user';
        
        if (hasUserMessageOnly) {
          // 显示机器人正在输入
          this.botTyping = true;
          
          // 滚动到底部
          this.scrollToBottom();
        }
        
        return;
      }
      
      // 如果有初始消息，发送它
      if (this.initialMessage) {
        // 不要再次设置输入框的值，直接使用初始消息
        const initialMsg = this.initialMessage;
        
        // 创建一个新会话
        this.createNewSession(this.currentTopic || 'AI对话');
        
        // 添加用户消息到会话
        const userMessageObj = {
          id: Date.now(),
          content: initialMsg,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        // 直接添加到聊天历史
        this.$store.commit('addChatMessage', userMessageObj);
        
        // 更新会话
        if (this.currentSession) {
          this.$store.commit('updateChatSession', {
            sessionId: this.currentSession.id,
            messages: [...this.currentSession.messages, userMessageObj]
          });
        }
        
        // 显示机器人正在输入
        this.botTyping = true;
        this.inputDisable = true;
        
        // 模拟API调用延迟
        setTimeout(() => {
          // 生成机器人回复
          const botResponse = this.generateResponse(initialMsg);
          
          // 隐藏输入指示器
          this.botTyping = false;
          this.inputDisable = false;
          
          // 添加机器人回复到聊天历史
          const botMessageObj = {
            id: Date.now() + 1,
            content: botResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
          };
          
          this.$store.commit('addChatMessage', botMessageObj);
          
          // 更新会话
          if (this.currentSession) {
            this.$store.commit('updateChatSession', {
              sessionId: this.currentSession.id,
              messages: [...this.currentSession.messages, botMessageObj]
            });
          }
          
          // 滚动到底部
          this.scrollToBottom();
        }, 1500);
      } else if (this.currentTopic) {
        // 如果有当前主题但没有初始消息，创建一个新会话
        this.createNewSession(this.currentTopic);
        
        // 添加欢迎消息
        setTimeout(() => {
          const welcomeMessage = `您好，${this.user.name}！我是您的${this.currentTopic}助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
          
          // 模拟机器人发送欢迎消息
          this.botTyping = true;
          setTimeout(() => {
            this.botTyping = false;
            // 直接添加一条AI消息
            this.$store.commit('addChatMessage', {
              id: Date.now(),
              content: welcomeMessage,
              sender: 'ai',
              timestamp: new Date().toISOString()
            });
            
            // 更新会话
            if (this.currentSession) {
              this.$store.commit('updateChatSession', {
                sessionId: this.currentSession.id,
                messages: [...this.currentSession.messages, {
                  id: Date.now(),
                  content: welcomeMessage,
                  sender: 'ai',
                  timestamp: new Date().toISOString()
                }]
              });
            }
            
            this.scrollToBottom();
          }, 1000);
        }, 500);
      } else {
        // 如果没有当前会话，创建一个新会话
        this.createNewSession('AI对话');
        
        // 添加欢迎消息
        setTimeout(() => {
          const welcomeMessage = `您好，${this.user.name}！我是您的AI助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
          
          // 模拟机器人发送欢迎消息
          this.botTyping = true;
          setTimeout(() => {
            this.botTyping = false;
            // 直接添加一条AI消息
            this.$store.commit('addChatMessage', {
              id: Date.now(),
              content: welcomeMessage,
              sender: 'ai',
              timestamp: new Date().toISOString()
            });
            
            // 更新会话
            if (this.currentSession) {
              this.$store.commit('updateChatSession', {
                sessionId: this.currentSession.id,
                messages: [...this.currentSession.messages, {
                  id: Date.now(),
                  content: welcomeMessage,
                  sender: 'ai',
                  timestamp: new Date().toISOString()
                }]
              });
            }
            
            this.scrollToBottom();
          }, 1000);
        }, 500);
      }
    }
  },
  mounted() {
    this.initChat()
    this.scrollToBottom()
    
    // 监听 AI 回复完成事件
    window.EventBus.$on('ai-response-complete', () => {
      this.botTyping = false;
    });
  },
  beforeDestroy() {
    // 移除事件监听
    window.EventBus.$off('ai-response-complete');
  },
  updated() {
    this.scrollToBottom()
  }
}
</script>

<style scoped lang="scss">
.chat-dialog {
  font-family: Inter,-apple-system,BlinkMacSystemFont,Segoe UI,SF Pro SC,SF Pro Display,SF Pro Icons,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif!important;
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
}

.chat-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
}

.chat-title {
  display: flex;
  flex-direction: column;
  
  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .session-name {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  
  .action-icon {
    width: 16px;
    height: 16px;
    margin-left: 15px;
    cursor: pointer;
  }
  
  .back-button {
    margin-left: 15px;
    padding: 6px 12px;
    background-color: #f5f5f5;
    border: none;
    border-radius: 4px;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  width: 100%;
}

.bot-wrapper {
  justify-content: flex-start;
}

.user-wrapper {
  flex-direction: row-reverse;
}

.avatar-container {
  width: 28px;
  height: 28px;
  margin: 0 8px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
}

.message {
  max-width: 90%;
  display: flex;
  flex-direction: column;
  
  .message-content {
    font-size: 13px;
    padding: 12px 16px;
    border-radius: 18px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.user-message {
  .message-content {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-top-right-radius: 4px;
  }
}

.bot-message {
  .message-content {
    color: #434343;
  }
}

.typing {
  .typing-indicator {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-radius: 18px;
    border-top-left-radius: 4px;
    
    span {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin: 0 2px;
      background-color: #999;
      border-radius: 50%;
      animation: typing 1.4s infinite both;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.chat-input-container {
  max-width: 92%;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.input-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.message-input {
  width: 100%;
  min-height: 90px;
  padding: 15px;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #ffffff;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.deep-thinking {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  width: 78px;
  height: 23px;
  font-size: 12px;
  color: #949494;
  border-radius: 10px;
  background-color: #F5F5F5;
  padding-left: 5px;
  margin-right: 10px;
  
  .icon-img {
    width: 12px;
    height: 12px;
    margin-right: 5px;
  }
  
  .beta {
    font-size: 11px;
    color: #999;
    margin-left: 5px;
  }
  
  &:hover {
    color: #333;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  
  .icon-img {
    width: 20px;
    height: 20px;
    margin-left: 15px;
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
    
    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

// 移除旧的输入框样式
.input-container {
  display: none;
}
</style> 