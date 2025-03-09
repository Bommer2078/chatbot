<template>
  <div class="chat-message" :class="{ 'user-message': isUser, 'ai-message': !isUser }">
    <div class="message-content">
      <div class="message-text">{{ message.content }}</div>
      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    isUser() {
      return this.message.sender === 'user'
    }
  },
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
  }
}
</script>

<style scoped lang="scss">
.chat-message {
  display: flex;
  margin-bottom: $spacing-base;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
  justify-content: flex-end;
  
  .message-content {
    background-color: $user-message-bg;
    color: $text-primary;
  }
}

.ai-message {
  margin-right: auto;
  justify-content: flex-start;
  
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
</style> 