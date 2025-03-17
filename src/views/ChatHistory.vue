<template>
  <div class="chat-history">
    <SidebarMenu />
    
    <div class="history-container">
      <div class="history-header">
        <div class="header-title">
          <span class="title-text">历史会话</span>
        </div>
        <div class="header-actions">
          <button class="back-button" @click="goBack">返回首页</button>
        </div>
      </div>
      
      <div class="history-content">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <img src="../assets/images/首页/u308.png" alt="搜索" class="search-icon">
            <input type="text" placeholder="请输入消息标题" v-model="searchQuery" class="search-input">
          </div>
        </div>
        
        <div class="time-section">
          <div class="time-title">近 7 天</div>
          <div class="chat-list">
            <div 
              v-for="session in recentSessions" 
              :key="session.id" 
              class="chat-item"
              @click="openChat(session.id)"
            >
              <div class="chat-title">{{ session.title }}</div>
              <div class="chat-meta" @click.stop>
                <span class="chat-time">{{ formatDate(session.lastUpdated) }}</span>
                <div class="chat-actions" @click.stop="toggleDeleteButton(session.id)">
                    <img src="../assets/images/首页/u419.png" class="more-btn">
                    <div v-if="showDeleteId === session.id" class="delete-button" @click.stop="deleteSession(session.id)">
                      删除
                    </div>
                </div>
              </div>
            </div>
            <div v-if="recentSessions.length === 0" class="no-data">
              近 7 天内没有聊天记录
            </div>
          </div>
        </div>
        
        <div class="time-section">
          <div class="time-title">近 30 天</div>
          <div class="chat-list">
            <div 
              v-for="session in olderSessions" 
              :key="session.id" 
              class="chat-item"
              @click="openChat(session.id)"
            >
              <div class="chat-title">{{ session.title }}</div>
              <div class="chat-meta" @click.stop>
                <span class="chat-time">{{ formatDate(session.lastUpdated) }}</span>
                <div class="chat-actions" @click.stop="toggleDeleteButton(session.id)">
                    <img src="../assets/images/首页/u419.png" class="more-btn">
                    <div v-if="showDeleteId === session.id" class="delete-button" @click.stop="deleteSession(session.id)">
                      删除
                    </div>
                </div>
              </div>
            </div>
            <div v-if="olderSessions.length === 0" class="no-data">
              近 30 天内没有更多聊天记录
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

export default {
  name: 'ChatHistory',
  components: {
    SidebarMenu
  },
  data() {
    return {
      searchQuery: '',
      showDeleteId: null // 用于跟踪当前显示删除按钮的会话ID
    }
  },
  computed: {
    ...mapState(['chatSessions']),
    
    filteredSessions() {
      if (!this.searchQuery) {
        return this.chatSessions;
      }
      
      return this.chatSessions.filter(session => 
        session.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    
    recentSessions() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return this.filteredSessions.filter(session => {
        const sessionDate = new Date(session.lastUpdated);
        return sessionDate >= sevenDaysAgo;
      }).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    },
    
    olderSessions() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return this.filteredSessions.filter(session => {
        const sessionDate = new Date(session.lastUpdated);
        return sessionDate < sevenDaysAgo && sessionDate >= thirtyDaysAgo;
      }).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }
  },
  methods: {
    ...mapMutations(['removeChatSession']),
    
    goBack() {
      this.$router.push('/');
    },
    
    openChat(sessionId) {
      // 导航到聊天页面并加载指定的会话
      this.$router.push(`/chat?session=${sessionId}`);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    toggleDeleteButton(sessionId) {
      // 如果点击的是当前显示删除按钮的会话，则隐藏删除按钮
      if (this.showDeleteId === sessionId) {
        this.showDeleteId = null;
      } else {
        // 否则显示该会话的删除按钮
        this.showDeleteId = sessionId;
      }
    },
    
    deleteSession(sessionId) {
      // 删除会话
      this.removeChatSession(sessionId);
      // 隐藏删除按钮
      this.showDeleteId = null;
    },
    
    handleDocumentClick(e) {
      // 如果点击的不是更多按钮或删除按钮，则隐藏删除按钮
      if (!e.target.classList.contains('chat-actions') && 
          !e.target.classList.contains('more-btn') && 
          !e.target.classList.contains('delete-button')) {
        this.showDeleteId = null;
      }
    }
  },
  // 点击页面其他地方时隐藏删除按钮
  mounted() {
    document.addEventListener('click', this.handleDocumentClick);
  },
  beforeDestroy() {
    // 移除事件监听器
    document.removeEventListener('click', this.handleDocumentClick);
  }
}
</script>

<style scoped lang="scss">
.chat-history {
  font-family: Inter,-apple-system,BlinkMacSystemFont,Segoe UI,SF Pro SC,SF Pro Display,SF Pro Icons,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif!important;
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
}

.history-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.history-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #eaeaea;
}

.header-title {
  display: flex;
  flex-direction: column;
  
  .title-text {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  
  .back-button {
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

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 80px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.search-bar {
  padding: 20px 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px 16px;
  background-color: #ffffff;
  
  .search-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    opacity: 0.5;
  }
  
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #333;
    
    &::placeholder {
      color: #999;
    }
  }
}

.time-section {
  margin: 20px 0;
}

.time-title {
  font-size: 14px;
  font-weight: 700;
  color: #666;
  margin-bottom: 12px;
  padding-left: 5px;
}

.chat-item {
  padding: 16px 20px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;   
  align-items: center;
  margin-bottom: 10px;
  
  &:hover {
    background-color: #f9f9f9;
  }
}

.chat-title {
font-weight: 700;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-time {
  font-size: 12px;
  color: #999;
}

.chat-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    position: relative;
    width: 20px;
    height: 20px;
    
  .more-btn {
    font-size: 16px;
    color: #999;
    cursor: pointer;
    
    &:hover {
      color: #333;
    }
  }
  
  .delete-button {
    position: absolute;
    right: 0;
    top: 25px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    color: #ff4d4f;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    
    &:hover {
      background-color: #fff1f0;
    }
  }
}

.no-data {
  padding: 20px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style> 