<template>
  <div 
    class="chat-message-container" 
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div 
      class="chat-message" 
      :class="{ 'user-message': isUser, 'ai-message': !isUser, 'streaming': isStreaming }"
    >
      <div class="message-content" :class="{ 'user-content': isUser }">
        <!-- 当消息内容为空且正在流式输出时，显示等待气泡 -->
        <div v-if="isStreaming && !message.content" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <!-- 否则显示消息内容 -->
        <div v-else class="message-text">
          {{ message.content }}<span v-if="isStreaming && message.content" class="cursor"></span>
        </div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>
    
    <!-- 操作按钮容器 -->
    <div v-if="!isUser && (showButtons || isLiked || isLastMessage)" class="action-buttons-container">
      <!-- 复制按钮 -->
      <div class="action-button copy-button" @click.stop="copyText" :class="{ 'copied': isCopied }">
        <span class="action-icon">
          {{ isCopied ? '✓' : '📋' }}
        </span>
      </div>
      
      <!-- 点赞按钮 -->
      <div class="action-button like-button" @click.stop="toggleLike">
        <span :class="['action-icon', { 'liked': isLiked }]">
          {{ isLiked ? '❤️' : '🤍' }}
        </span>
      </div>
    </div>
    
    <!-- 用于复制的隐藏文本区域 -->
    <textarea
      ref="copyTextarea"
      :value="message.content"
      class="hidden-textarea"
      aria-hidden="true"
    ></textarea>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    },
    isInitiallyLiked: {
      type: Boolean,
      default: false
    },
    isLastMessage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showButtons: false,
      isLiked: this.isInitiallyLiked,
      isCopied: false
    }
  },
  computed: {
    ...mapState(['streamingMessageId']),
    
    isUser() {
      return this.message.sender === 'user'
    },
    
    // 判断当前消息是否正在流式输出
    isStreaming() {
      return !this.isUser && this.streamingMessageId === this.message.id;
    }
  },
  watch: {
    // 监听 isLastMessage 属性的变化
    isLastMessage(newVal, oldVal) {
      // 如果不再是最后一条消息，且未被点赞，则隐藏按钮
      if (!newVal && oldVal && !this.isLiked && !this.isUser) {
        this.showButtons = false;
      }
      // 如果变成了最后一条消息，且是AI消息，则显示按钮
      if (newVal && !oldVal && !this.isUser) {
        this.showButtons = true;
      }
    }
  },
  mounted() {
    // 检查 localStorage 中是否有该消息的点赞记录
    const savedLikedMessages = localStorage.getItem('likedMessages');
    if (savedLikedMessages) {
      try {
        const likedMessages = JSON.parse(savedLikedMessages);
        if (likedMessages.includes(this.message.id)) {
          this.isLiked = true;
          this.showButtons = true; // 如果已点赞，默认显示按钮
        }
      } catch (e) {
        console.error('Error parsing liked messages:', e);
      }
    }
    
    // 如果是最后一条消息，默认显示按钮
    if (this.isLastMessage && !this.isUser) {
      this.showButtons = true;
    } else if (!this.isLiked && !this.isUser) {
      // 确保非最后一条且未点赞的消息不显示按钮
      this.showButtons = false;
    }
  },
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    toggleLike() {
      this.isLiked = !this.isLiked;
      this.$emit('like', {
        messageId: this.message.id,
        liked: this.isLiked
      });
    },
    copyText() {
      try {
        // 获取隐藏的文本区域
        const textarea = this.$refs.copyTextarea;
        
        // 选中文本
        textarea.focus();
        textarea.select();
        
        // 尝试使用 document.execCommand 复制
        const successful = document.execCommand('copy');
        
        if (successful) {
          // 复制成功
          this.isCopied = true;
          
          // 2秒后恢复原状态
          setTimeout(() => {
            this.isCopied = false;
          }, 2000);
        } else {
          console.error('复制失败');
        }
      } catch (err) {
        console.error('复制出错:', err);
        
        // 如果上面的方法失败，尝试使用 Clipboard API
        if (navigator.clipboard) {
          navigator.clipboard.writeText(this.message.content)
            .then(() => {
              this.isCopied = true;
              setTimeout(() => {
                this.isCopied = false;
              }, 2000);
            })
            .catch(err => {
              console.error('Clipboard API 复制失败:', err);
            });
        }
      } finally {
        // 移除焦点，避免影响用户体验
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    },
    handleMouseEnter() {
      if (!this.isUser) {
        this.showButtons = true;
      }
    },
    handleMouseLeave() {
      if (!this.isUser && !this.isLiked && !this.isLastMessage) {
        this.showButtons = false;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.chat-message-container {
  position: relative;
  max-width: 80%;
  margin-bottom: $spacing-base;
  padding-bottom: 25px; /* 为按钮预留空间 */
}

.chat-message {
  position: relative;
  
  &.streaming {
    .message-text {
      .cursor {
        display: inline-block;
        width: 2px;
        height: 16px;
        background-color: $primary-color;
        margin-left: 2px;
        vertical-align: middle;
        animation: blink 0.8s infinite;
      }
    }
  }
}

/* 等待气泡样式 */
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  
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

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.user-message {
  margin-right: auto; /* 改为右边距自动，让用户消息也靠左 */
  
  .message-content {
    background-color: $ai-message-bg; /* 使用与AI消息相同的背景色 */
    color: $text-primary;
  }
}

.ai-message {
  margin-right: auto;
  
  .message-content {
    background-color: $ai-message-bg;
    color: $text-primary;
    box-shadow: $box-shadow-light;
  }
}

.message-content {
  padding: $spacing-small $spacing-base;
  border-radius: $border-radius-large;
  position: relative;
  display: inline-block;
  box-shadow: $box-shadow-light; /* 为所有消息添加阴影 */
 
  
  .message-text {
    word-break: break-word;
    line-height: 1.5;
  }
  
  .message-time {
    font-size: $font-size-extra-small;
    color: $text-secondary;
    margin-top: $spacing-extra-small;
    text-align: right;
  }
}

.action-buttons-container {
  position: absolute;
  right: 10px;
  bottom: 0;
  display: flex;
  align-items: center;
}

.action-button {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  margin-left: 8px;
  
  &:hover {
    opacity: 1;
  }
  
  &.copied {
    color: #4CAF50;
  }
}

.action-icon {
  font-size: 16px;
  
  &.liked {
    color: #ff4757;
  }
}

.hidden-textarea {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}
</style> 