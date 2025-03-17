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
            <ChatMessage 
              :message="message" 
              :isInitiallyLiked="isMessageLiked(message.id)"
              :isLastMessage="index === chatMessages.length - 1 && message.sender === 'ai'"
              @like="handleLike"
            />
          </div>
          
          <!-- 只有在没有流式输出时才显示等待气泡 -->
          <div v-if="botTyping && !isStreaming" class="message-wrapper bot-wrapper">
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
          
          <!-- AI 错误提示 -->
          <div v-if="aiError" class="message-wrapper bot-wrapper">
            <div class="avatar-container">
              <img :src="botAvatar" alt="AI头像" class="avatar-img">
            </div>
            <div class="message bot-message error">
              <div class="error-message">
                <span class="error-icon">⚠️</span>
                <span>{{ aiError }}</span>
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
              :disabled="inputDisable"
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
                <img 
                  src="../assets/images/首页/u205.png" 
                  alt="发送" 
                  class="icon-img" 
                  title="发送" 
                  @click="sendMessage" 
                  :class="{ 'disabled': !inputMessage.trim() || inputDisable }"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import SidebarMenu from '@/components/Sidebar.vue'
import ChatMessage from '@/components/ChatMessage.vue'

export default {
  name: 'ChatDialog',
  components: {
    SidebarMenu,
    ChatMessage
  },
  data() {
    return {
      botTyping: false,
      inputMessage: '',
      inputDisable: false,
      userAvatar: require('@/assets/images/首页/u84.png'),
      botAvatar: require('@/assets/images/开启会话/u854.png')
    }
  },
  computed: {
    ...mapState(['user', 'chatHistory', 'initialMessage', 'currentTopic', 'chatSessions', 'likedMessages', 'isAILoading', 'aiError', 'streamingMessageId']),
    ...mapGetters(['currentSession']),
    
    sessionTitle() {
      return this.currentSession ? this.currentSession.title : 'AI对话'
    },
    
    chatMessages() {
      return this.currentSession ? this.currentSession.messages : []
    },
    
    // 判断是否有消息正在流式输出
    isStreaming() {
      return this.streamingMessageId !== null;
    }
  },
  methods: {
    ...mapActions(['sendMessage', 'createNewSession', 'likeMessage', 'loadLikedMessages']),
    ...mapMutations(['updateChatSession', 'updateSessionTitle']),
    
    sendMessage() {
      if (!this.inputMessage.trim() || this.inputDisable) return
      
      // 保存当前输入的消息
      const userMessage = this.inputMessage.trim()
      
      // 清空输入框
      this.inputMessage = ''
      
      // 禁用输入框，等待回复
      this.inputDisable = true
      
      // 检查当前会话是否是新创建的，且标题是"新对话"
      if (this.currentSession && this.currentSession.title === '新对话' && this.currentSession.messages.length === 1) {
        // 根据用户输入的第一条消息生成主题
        const generateTopicFromMessage = (message) => {
          // 如果消息太长，截取前20个字符
          if (message.length > 20) {
            return message.substring(0, 20) + '...';
          }
          return message;
        };
        
        // 更新会话标题
        const newTitle = generateTopicFromMessage(userMessage);
        this.$store.commit('updateSessionTitle', {
          sessionId: this.currentSession.id,
          title: newTitle
        });
      }
      
      // 调用 Vuex store 中的 sendMessage action
      this.$store.dispatch('sendMessage', userMessage)
        .finally(() => {
          // 无论成功或失败，都重新启用输入框
          this.inputDisable = false
          
          // 滚动到底部
          this.scrollToBottom()
        })
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
        
        // 不再自动发送消息，因为首页已经调用了 sendResponse
        // 只滚动到底部
        if (hasUserMessageOnly) {
          this.scrollToBottom();
        }
        
        return;
      }
      
      // 如果有初始消息，发送它
      if (this.initialMessage) {
        // 创建一个新会话
        this.createNewSession(this.currentTopic || '与AI助手的对话');
        
        // 发送初始消息
        this.$store.dispatch('sendMessage', this.initialMessage);
      } else if (this.currentTopic) {
        // 如果有当前主题但没有初始消息，创建一个新会话
        this.createNewSession(this.currentTopic);
        
        // 添加欢迎消息
        const welcomeMessage = `您好，${this.user.name}！我是您的${this.currentTopic}助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
        
        // 直接添加一条AI消息
        const aiMessage = {
          id: Date.now(),
          content: welcomeMessage,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        
        this.$store.commit('addChatMessage', aiMessage);
        
        // 更新会话
        if (this.currentSession) {
          this.$store.commit('updateChatSession', {
            sessionId: this.currentSession.id,
            messages: [...this.currentSession.messages, aiMessage]
          });
        }
        
        this.scrollToBottom();
      } else {
        // 如果没有当前会话，创建一个新会话
        this.createNewSession('与AI助手的对话');
        
        // 添加欢迎消息
        const welcomeMessage = `您好，${this.user.name}！我是您的AI助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
        
        // 直接添加一条AI消息
        const aiMessage = {
          id: Date.now(),
          content: welcomeMessage,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        
        this.$store.commit('addChatMessage', aiMessage);
        
        // 更新会话
        if (this.currentSession) {
          this.$store.commit('updateChatSession', {
            sessionId: this.currentSession.id,
            messages: [...this.currentSession.messages, aiMessage]
          });
        }
        
        this.scrollToBottom();
      }
    },
    
    handleLike({ messageId }) {
      this.likeMessage(messageId);
    },
    
    isMessageLiked(messageId) {
      return this.likedMessages.includes(messageId);
    }
  },
  mounted() {
    // 检查 URL 参数是否包含 new=true 或 session
    const isNewChat = this.$route.query.new === 'true';
    const sessionId = this.$route.query.session;
    
    if (sessionId) {
      // 如果指定了会话 ID，加载该会话
      const session = this.chatSessions.find(s => s.id === sessionId);
      if (session) {
        // 找到会话，不需要做任何操作，因为 currentSession getter 会自动获取最新的会话
        // 但我们需要确保这个会话是当前会话（最后一个会话）
        // 所以我们先移除它，然后重新添加
        const sessionIndex = this.chatSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
          const sessionToMove = { ...this.chatSessions[sessionIndex] };
          this.$store.commit('removeChatSession', sessionId);
          this.$store.commit('addChatSession', sessionToMove);
        }
      } else {
        // 没有找到会话，创建一个新会话
        this.createNewSession('与AI助手的对话');
      }
    } else if (isNewChat) {
      // 如果是新窗口打开的新对话，创建一个新会话
      // 添加欢迎消息
      const welcomeMessage = `您好，${this.user.name}！我是您的AI助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
      
      // 创建一个临时主题名称
      const tempTitle = '新对话';
      
      // 创建新会话
      this.createNewSession(tempTitle);
      
      // 直接添加一条AI消息
      const aiMessage = {
        id: Date.now(),
        content: welcomeMessage,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      this.$store.commit('addChatMessage', aiMessage);
      
      // 更新会话
      if (this.currentSession) {
        this.$store.commit('updateChatSession', {
          sessionId: this.currentSession.id,
          messages: [...this.currentSession.messages, aiMessage]
        });
      }
      
      this.scrollToBottom();
      
      // 设置焦点到输入框，提示用户输入问题
      this.$nextTick(() => {
        const textarea = document.querySelector('.message-input');
        if (textarea) {
          textarea.focus();
        }
      });
    } else {
      // 正常初始化聊天
      this.initChat();
    }
    
    this.scrollToBottom();
    
    // 监听 AI 回复完成事件
    window.EventBus.$on('ai-response-complete', () => {
      this.botTyping = false;
    });
    
    // 加载已点赞的消息
    this.loadLikedMessages();
    
    // 监听创建新聊天的事件
    window.EventBus.$on('create-new-chat', () => {
      // 添加欢迎消息
      const welcomeMessage = `您好，${this.user.name}！我是您的AI助手，可以回答您的问题、提供信息和帮助您完成各种任务。请问有什么可以帮您的？`;
      
      // 创建一个临时主题名称
      const tempTitle = '新对话';
      
      // 创建新会话
      this.createNewSession(tempTitle);
      
      // 直接添加一条AI消息
      const aiMessage = {
        id: Date.now(),
        content: welcomeMessage,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      this.$store.commit('addChatMessage', aiMessage);
      
      // 更新会话
      if (this.currentSession) {
        this.$store.commit('updateChatSession', {
          sessionId: this.currentSession.id,
          messages: [...this.currentSession.messages, aiMessage]
        });
      }
      
      this.scrollToBottom();
      
      // 设置焦点到输入框，提示用户输入问题
      this.$nextTick(() => {
        const textarea = document.querySelector('.message-input');
        if (textarea) {
          textarea.focus();
        }
      });
    });
  },
  beforeDestroy() {
    // 移除事件监听
    window.EventBus.$off('ai-response-complete');
    window.EventBus.$off('create-new-chat');
  },
  updated() {
    this.scrollToBottom()
  },
  watch: {
    // 监听 AI 加载状态变化
    isAILoading(newVal) {
      this.botTyping = newVal;
      this.inputDisable = newVal;
    }
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
  position: relative;
}

.bot-wrapper {
  justify-content: flex-start;
}

.user-wrapper {
  
  .chat-message-container {
    flex-direction: row-reverse;
  }
}

.avatar-container {
  width: 28px;
  height: 28px;
  margin: 0 8px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
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

.error-message {
  display: flex;
  align-items: center;
  color: #f56c6c;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 8px;
  margin-bottom: 10px;
  
  .error-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

.message-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.icon-img.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 