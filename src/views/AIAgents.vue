<template>
  <div class="ai-agents">
    <SidebarMenu />
    
    <div class="agents-container">
      <div class="content-wrapper">
        <div class="agents-header">
          <div class="header-title">
            {{ activeCategory }}
          </div>
          <img src="../assets/images/首页/u57.png" alt="企业logo">
        </div>
        
        <div class="agents-content">
          <div class="category-section">
            <div class="category-tabs">
              <div 
                v-for="category in categories" 
                :key="category"
                :class="['tab-button', { active: activeCategory === category }]" 
                @click="setActiveCategory(category)"
              >
                {{ category }}
              </div>
            </div>
            
            <template v-if="activeCategory === '全部'">
              <div v-for="(agents, category) in groupedAgents" :key="category">
                <div class="category-title">{{ category }}</div>
                
                <div class="agents-grid">
                  <div 
                    v-for="agent in agents" 
                    :key="agent.name"
                    class="agent-card" 
                    @click="startAgent(agent.name)"
                  >
                    <div class="agent-left">
                      <div class="agent-icon">
                        <img :src="agent.icon" :alt="agent.name">
                      </div>
                    </div>
                    <div class="agent-right">
                      <div class="agent-name">{{ agent.name }}</div>
                      <div class="agent-desc">{{ agent.description }}</div>
                      <div class="agent-tag">智能体 & {{ agent.category }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="category-title">{{ activeCategory }}</div>
              
              <div class="agents-grid">
                <div 
                  v-for="agent in filteredAgents" 
                  :key="agent.name"
                  class="agent-card" 
                  @click="startAgent(agent.name)"
                >
                  <div class="agent-left">
                    <div class="agent-icon">
                      <img :src="agent.icon" :alt="agent.name">
                    </div>
                  </div>
                  <div class="agent-right">
                    <div class="agent-name">{{ agent.name }}</div>
                    <div class="agent-desc">{{ agent.description }}</div>
                    <div class="agent-tag">智能体 & {{ agent.category }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import SidebarMenu from '@/components/Sidebar.vue'

export default {
  name: 'AIAgentsPage',
  components: {
    SidebarMenu
  },
  data() {
    return {
      activeCategory: '全部',
      categories: ['全部', 'AI搜索', 'AI办公', 'AI教学', 'AI学习'],
      agents: [
        {
          name: 'AI校闻速递',
          icon: require('@/assets/images/首页/u180.png'),
          description: 'AI帮我找校园教育局等官网新闻',
          category: 'AI搜索'
        },
        {
          name: 'AI政策秒读',
          icon: require('@/assets/images/首页/u173.png'),
          description: '查找最新的教育相关政策，AI帮我解读',
          category: 'AI搜索'
        },
        {
          name: 'AI待办精灵',
          icon: require('@/assets/images/首页/u194.png'),
          description: '看着还有哪些待办事项，随时提醒',
          category: 'AI办公'
        },
        {
          name: 'AI通讯助手',
          icon: require('@/assets/images/首页/u203.png'),
          description: '让AI帮你查找校教师联系方式，如此方便',
          category: 'AI办公'
        },
        {
          name: 'AI场馆导航',
          icon: require('@/assets/images/首页/u187.png'),
          description: '我要预约场地，AI帮我快速导航，无需等待',
          category: 'AI办公'
        },
        {
          name: 'AI日程管家',
          icon: require('@/assets/images/首页/u166.png'),
          description: '通过日程关键词，AI可以方便地找到相关日程',
          category: 'AI办公'
        },
        {
          name: 'AI课表助手',
          icon: require('@/assets/images/首页/u187.png'),
          description: '教育局下发到学校公文文章记录和内容',
          category: 'AI教学'
        },
        {
          name: 'AI成绩大师',
          icon: require('@/assets/images/首页/u201.png'),
          description: '学校内部发文申请与审批，领导批示',
          category: 'AI教学'
        },
        {
          name: 'AI自适应学习',
          icon: require('@/assets/images/首页/u207.png'),
          description: '各部门收取工加班申请与审批，部门主管批示',
          category: 'AI学习'
        }
      ]
    }
  },
  computed: {
    filteredAgents() {
      if (this.activeCategory === '全部') {
        return this.agents;
      }
      return this.agents.filter(agent => agent.category === this.activeCategory);
    },
    groupedAgents() {
      const groups = {};
      
      // 如果是全部分类，按类别分组
      if (this.activeCategory === '全部') {
        this.categories.forEach(category => {
          if (category !== '全部') {
            groups[category] = this.agents.filter(agent => agent.category === category);
          }
        });
      } else {
        // 如果是特定分类，只显示该分类
        groups[this.activeCategory] = this.filteredAgents;
      }
      
      return groups;
    }
  },
  methods: {
    ...mapMutations(['setCurrentTopic', 'setInitialMessage']),
    
    startAgent(agentName) {
      // 设置当前主题
      this.setCurrentTopic(agentName)
      // 清空初始消息
      this.setInitialMessage('')
      
      // 跳转到聊天页面
      this.$router.push('/chat')
    },
    
    setActiveCategory(category) {
      this.activeCategory = category;
    }
  }
}
</script>

<style scoped lang="scss">
.ai-agents {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

.agents-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 20px;
  align-items: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.agents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
  
  img {
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
  
  .header-title {
    font-size: 22px;
    font-weight: 700;
    color: #333;
  }
}

.agents-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

.category-section {
  width: 100%;
}

.category-tabs {
  display: flex;
  margin-bottom: 30px;
  gap: 10px;
  padding: 0 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-button {
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 20px;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
  text-align: center;
  border: none;
  min-width: 80px;
  
  &.active {
    color: #fff;
    font-weight: 500;
    background-color: #293B83;
  }
  
  &:first-child.active {
    background-color: #293B83;
    color: #fff;
  }
  
  &:first-child:not(.active) {
    background-color: #f5f5f5;
    color: #333;
  }
  
  &:hover:not(.active) {
    background-color: #e0e0e0;
  }
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 15px;
  color: #333;
  margin-left: 10px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  width: 100%;
  justify-content: center;
  padding: 0 5px;
}

@media (min-width: 768px) and (max-width: 1199px) {
  .agents-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 767px) {
  .agents-grid {
    grid-template-columns: 1fr;
  }
  
  .content-wrapper {
    padding: 0 10px;
  }
}

.agent-card {
  display: flex;
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #fff;
  min-height: 80px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin: 0 5px;
  
  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
    border-color: #d8d8d8;
  }
}

.agent-left {
  margin-right: 15px;
  display: flex;
  align-items: flex-start;
}

.agent-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.agent-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #f8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  img {
    width: 25px;
    height: 25px;
    object-fit: cover;
  }
}

.agent-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.agent-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 6px;
}

.agent-tag {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background-color: #999;
    border-radius: 50%;
    margin-right: 5px;
  }
}
</style> 