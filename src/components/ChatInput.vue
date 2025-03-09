<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <textarea
        ref="messageInput"
        v-model="message"
        class="message-input"
        placeholder="请提问..."
        @keydown.enter.prevent="submitMessage"
      ></textarea>
      
      <div class="input-toolbar">
        <div class="toolbar-left">
          <div class="deep-thinking" title="深度思考">
            <img src="../assets/images/首页/u166.png" alt="深度思考" class="icon-img">
            <span>深度思考</span>
          </div>
          <div class="deep-thinking" title="深度思考">
            <img src="../assets/images/首页/u173.png" alt="深度思考" class="icon-img">
            <span>联网搜索</span>
          </div>
        </div>
        
        <div class="toolbar-right">
          <img src="../assets/images/首页/u209.png" alt="附件" class="icon-img" title="附件">
          <img src="../assets/images/首页/u207.png" alt="图片" class="icon-img" title="图片">
          <img src="../assets/images/首页/u203.png" alt="语音" class="icon-img" title="语音">
          <img src="../assets/images/首页/u205.png" alt="发送" class="icon-img" title="发送" @click="submitMessage">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  name: 'ChatInputBox',
  data() {
    return {
      message: ''
    }
  },
  methods: {
    ...mapMutations(['setCurrentMessage']),
    ...mapActions(['sendMessage']),
    
    submitMessage() {
      if (!this.message.trim()) return
      
      // 发送消息给父组件
      this.$emit('send', this.message.trim())
      
      // 清空输入框
      this.message = ''
      
      // 自动聚焦输入框
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.focus()
        }
      })
    }
  },
  mounted() {
    // 初始聚焦输入框
    if (this.$refs.messageInput) {
      this.$refs.messageInput.focus()
    }
  }
}
</script>

<style scoped lang="scss">
.chat-input-container {
  max-width: 800px;
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
  }
}
</style> 