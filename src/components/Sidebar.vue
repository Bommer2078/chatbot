<template>
  <div class="sidebar">
    <div class="company-info">
      <div class="logo">
        <img src="../assets/images/首页/u100.png" alt="企业logo">
      </div>
      <div class="company-name" style="color: #293B83; font-size: 18px;">综合服务平台</div>
      <div class="side-toggle-btn">
        <img src="../assets/images/首页/u116.png">
      </div>
    </div>
    
    <div class="menu-list">
      <div class="menu-item" :class="{ active: isActive('/') }" @click="navigateTo('/')">
        <img src="../assets/images/首页/u82.png" alt="首页图标" class="menu-icon">
        <span>首页</span>
      </div>
      
      <div class="menu-item" :class="{ active: isActive('/agents') }" @click="navigateTo('/agents')">
        <img src="../assets/images/首页/u120.png" alt="智能体图标" class="menu-icon">
        <span>智能体</span>
      </div>
      
      <div class="menu-item">
        <img src="../assets/images/首页/u108.png" alt="工作台图标" class="menu-icon">
        <span>工作台</span>
      </div>
      
      <div class="menu-item">
        <img src="../assets/images/首页/u106.png" alt="办事指南图标" class="menu-icon">
        <span>办事指南</span>
      </div>
      
      <div class="menu-item">
        <img src="../assets/images/首页/u110.png" alt="通讯录图标" class="menu-icon">
        <span>通讯录</span>
      </div>
      
      <div class="menu-item">
        <img src="../assets/images/首页/u104.png" alt="课程表图标" class="menu-icon">
        <span>课程表</span>
      </div>
      
      <div class="menu-item add-more">
        <img src="../assets/images/首页/u114.png" alt="添加图标" class="menu-icon">
        <span>添加到左侧栏...</span>
      </div>
    </div>
    
    <div class="recent-chats">
      <div class="menu-item with-arrow">
        <img src="../assets/images/首页/u96.png" alt="最近访问图标" class="menu-icon">
        <span>最近访问</span>
        <span class="arrow">></span>
      </div>
      
      <div class="menu-item">
        <img src="../assets/images/首页/u98.png" alt="收藏夹图标" class="menu-icon">
        <span>收藏夹</span>
      </div>
    </div>
    
    <div class="footer">
      <div class="tech-support">云尚教育提供技术支持</div>
      <div class="user-info">
        <img src="../assets/images/首页/u84.png" alt="用户头像" class="user-avatar">
        <span class="username">张义民</span>
        <span class="more-options">...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SidebarMenu',
  computed: {
    ...mapState(['user']),
    userInitial() {
      return this.user.name ? this.user.name.charAt(0) : '用'
    }
  },
  methods: {
    newChat() {
      this.$emit('new-chat')
    },
    navigateTo(path) {
      // 避免重复导航到当前路径
      console.log(this.$route.path,path)  
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    isActive(path) {
      return this.$route.path === path
    }
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  width: 230px;
  height: 100vh;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  padding: 15px 0;
  .company-info {
    display: flex;
    align-items: center;
    padding: 0 15px;
    margin-bottom: 20px;
    font-weight: 700;
    color: #293B83;
    .company-name {
      margin-left: 10px;
    }
    .logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #6e6e6e;
      color: white;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .side-toggle-btn {
    margin-left: auto;
    cursor: pointer;
    width: 20px;
    height: 20px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}

.menu-list {
  padding: 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  position: relative;
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
  margin: 0 8px 6px 8px;
  width: calc(100% - 16px);
  box-sizing: border-box;
  border-radius: 8px;
}

.menu-item:hover:not(.active) {
  background-color: #f0f0f0;

}

.menu-item.active {
  background-color: #EBEDF8;

  font-weight: 700;
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.menu-item span {
  flex: 1;
}

.menu-item .arrow {
  flex: 0;
  color: #999;
  font-size: 12px;
}

.add-more {
  color: #666;
  font-size: 13px;
}

.recent-chats {
  margin-top: 10px;
}

.with-arrow {
  display: flex;
  justify-content: space-between;
}

.footer {
  padding: 15px;
  border-top: 1px solid #eaeaea;
}

.tech-support {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  flex: 1;
  font-size: 14px;
}

.more-options {
  color: #999;
  cursor: pointer;
}
</style> 