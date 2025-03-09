import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 生成回复的辅助函数
function generateResponse(message) {
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
}

export default new Vuex.Store({
  state: {
    user: {
      id: '187165',
      name: '张义民',
      avatar: ''
    },
    chatHistory: [],
    currentMessage: '',
    currentTopic: '',
    initialMessage: '',
    chatSessions: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    addChatMessage(state, message) {
      state.chatHistory.push(message)
    },
    setCurrentMessage(state, message) {
      state.currentMessage = message
    },
    setCurrentTopic(state, topic) {
      state.currentTopic = topic
    },
    setInitialMessage(state, message) {
      state.initialMessage = message
    },
    addChatSession(state, session) {
      state.chatSessions.push(session)
    },
    updateChatSession(state, { sessionId, messages }) {
      const session = state.chatSessions.find(s => s.id === sessionId)
      if (session) {
        session.messages = messages
        session.lastUpdated = new Date().toISOString()
      }
    }
  },
  actions: {
    sendMessage({ commit, state }, message) {
      // 检查是否已经有相同内容的消息
      const isDuplicate = state.chatHistory.some(msg => 
        msg.sender === 'user' && 
        msg.content === message && 
        Date.now() - new Date(msg.timestamp).getTime() < 5000 // 5秒内的相同消息视为重复
      );
      
      if (isDuplicate) {
        // 如果是重复消息，只生成回复，不添加用户消息
        // 模拟AI回复
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            content: generateResponse(message),
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
          commit('addChatMessage', aiMessage)
          
          // 更新会话
          if (state.chatSessions.length > 0) {
            const lastSession = state.chatSessions[state.chatSessions.length - 1]
            commit('updateChatSession', {
              sessionId: lastSession.id,
              messages: [...lastSession.messages, aiMessage]
            })
          }
        }, 1000)
        return;
      }
      
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      }
      commit('addChatMessage', userMessage)
      
      // 如果是新会话，创建一个会话
      if (state.chatSessions.length === 0 || state.currentTopic) {
        const sessionId = Date.now().toString()
        commit('addChatSession', {
          id: sessionId,
          title: state.currentTopic || '新对话',
          messages: [userMessage],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
        
        // 重置当前主题
        commit('setCurrentTopic', '')
      } else {
        // 更新最后一个会话
        const lastSession = state.chatSessions[state.chatSessions.length - 1]
        commit('updateChatSession', {
          sessionId: lastSession.id,
          messages: [...lastSession.messages, userMessage]
        })
      }
      
      // 模拟AI回复
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          content: generateResponse(message),
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        commit('addChatMessage', aiMessage)
        
        // 更新会话
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1]
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, aiMessage]
          })
        }
      }, 1000)
    },
    
    createNewSession({ commit }, title = '新对话') {
      const sessionId = Date.now().toString()
      commit('addChatSession', {
        id: sessionId,
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
      return sessionId
    },

    sendResponse({ commit, state }, message) {
      // 检查是否已经有相同内容的消息的回复
      const hasResponse = state.chatSessions.some(session => {
        return session.messages.some(msg => 
          msg.sender === 'ai' && 
          msg.content.includes(message) && 
          Date.now() - new Date(msg.timestamp).getTime() < 10000 // 10秒内的回复
        );
      });
      
      if (hasResponse) {
        // 如果已经有回复，不再重复生成
        // 触发事件，通知组件更新 botTyping 状态
        if (window.EventBus) {
          window.EventBus.$emit('ai-response-complete');
        }
        return;
      }
      
      // 模拟AI回复
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          content: generateResponse(message),
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        commit('addChatMessage', aiMessage)
        
        // 更新会话
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1]
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, aiMessage]
          })
        }
        
        // 触发事件，通知组件更新 botTyping 状态
        if (window.EventBus) {
          window.EventBus.$emit('ai-response-complete');
        }
      }, 1000)
    }
  },
  getters: {
    currentSession(state) {
      if (state.chatSessions.length === 0) {
        return null
      }
      return state.chatSessions[state.chatSessions.length - 1]
    }
  },
  modules: {
  }
}) 