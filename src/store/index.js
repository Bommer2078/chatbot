import Vue from 'vue'
import Vuex from 'vuex'
import { sendMessageToAIStream, formatMessagesForAI } from '@/api/aiService'
import config from '@/config'

Vue.use(Vuex)

// 生成回复的辅助函数 (备用，当 API 调用失败时使用)
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

// 根据消息内容生成主题名称
function generateTopicFromMessage(message) {
  // 如果消息太长，截取前20个字符
  if (message.length > 20) {
    return message.substring(0, 20) + '...';
  }
  return message;
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
    chatSessions: [],
    likedMessages: [],
    isAILoading: false, // AI 加载状态
    aiError: null,      // AI 错误信息
    streamingMessageId: null, // 当前正在流式输出的消息ID
    streamingContent: ''      // 当前流式输出的内容
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
      // 保存到 localStorage
      localStorage.setItem('chatSessions', JSON.stringify(state.chatSessions))
    },
    removeChatSession(state, sessionId) {
      const index = state.chatSessions.findIndex(s => s.id === sessionId)
      if (index !== -1) {
        state.chatSessions.splice(index, 1)
        // 保存到 localStorage
        localStorage.setItem('chatSessions', JSON.stringify(state.chatSessions))
      }
    },
    updateChatSession(state, { sessionId, messages }) {
      const session = state.chatSessions.find(s => s.id === sessionId)
      if (session) {
        session.messages = messages
        session.lastUpdated = new Date().toISOString()
        // 保存到 localStorage
        localStorage.setItem('chatSessions', JSON.stringify(state.chatSessions))
      }
    },
    updateSessionTitle(state, { sessionId, title }) {
      const session = state.chatSessions.find(s => s.id === sessionId)
      if (session) {
        session.title = title
        // 保存到 localStorage
        localStorage.setItem('chatSessions', JSON.stringify(state.chatSessions))
      }
    },
    setChatSessions(state, sessions) {
      state.chatSessions = sessions
    },
    toggleLikeMessage(state, messageId) {
      const index = state.likedMessages.indexOf(messageId);
      if (index === -1) {
        // 添加点赞
        state.likedMessages.push(messageId);
      } else {
        // 取消点赞
        state.likedMessages.splice(index, 1);
      }
      
      // 保存到 localStorage
      localStorage.setItem('likedMessages', JSON.stringify(state.likedMessages));
    },
    
    setLikedMessages(state, likedMessages) {
      state.likedMessages = likedMessages;
    },
    
    setAILoading(state, isLoading) {
      state.isAILoading = isLoading;
    },
    
    setAIError(state, error) {
      state.aiError = error;
    },
    
    // 新增：设置流式消息ID
    setStreamingMessageId(state, id) {
      state.streamingMessageId = id;
    },
    
    // 新增：更新流式内容
    updateStreamingContent(state, content) {
      state.streamingContent = content;
    },
    
    // 新增：更新消息内容
    updateMessageContent(state, { messageId, content }) {
      // 更新聊天历史中的消息
      if (state.chatHistory && state.chatHistory.length > 0) {
        const message = state.chatHistory.find(msg => msg.id === messageId);
        if (message) {
          message.content = content;
        }
      }
      
      // 更新会话中的消息
      if (state.chatSessions && state.chatSessions.length > 0) {
        state.chatSessions.forEach(session => {
          if (session.messages && session.messages.length > 0) {
            const sessionMessage = session.messages.find(msg => msg.id === messageId);
            if (sessionMessage) {
              sessionMessage.content = content;
            }
          }
        });
      }
    }
  },
  actions: {
    // 加载聊天会话
    loadChatSessions({ commit }) {
      const savedChatSessions = localStorage.getItem('chatSessions');
      if (savedChatSessions) {
        try {
          const chatSessions = JSON.parse(savedChatSessions);
          commit('setChatSessions', chatSessions || []);
        } catch (e) {
          console.error('Error parsing chat sessions:', e);
          commit('setChatSessions', []);
        }
      } else {
        // 确保即使没有保存的会话，也将 chatSessions 设置为空数组
        commit('setChatSessions', []);
      }
    },
    
    async sendMessage({ commit, state }, message) {
      // 检查是否已经有相同内容的消息
      const isDuplicate = state.chatHistory.some(msg => 
        msg.sender === 'user' && 
        msg.content === message && 
        Date.now() - new Date(msg.timestamp).getTime() < 5000 // 5秒内的相同消息视为重复
      );
      
      if (isDuplicate) {
        // 如果是重复消息，只生成回复，不添加用户消息
        this.dispatch('sendResponse', message);
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
      if (state.chatSessions.length === 0) {
        // 只有在没有会话时才创建新会话
        const sessionId = Date.now().toString()
        
        // 根据消息内容生成主题
        const topicTitle = state.currentTopic || generateTopicFromMessage(message);
        
        commit('addChatSession', {
          id: sessionId,
          title: topicTitle,
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
        
        // 如果会话标题是"新对话"，则根据用户消息更新标题
        if (lastSession.title === '新对话' && lastSession.messages.length <= 1) {
          commit('updateSessionTitle', {
            sessionId: lastSession.id,
            title: generateTopicFromMessage(message)
          })
        }
      }
      
      // 调用 AI API 获取回复（流式输出）
      try {
        commit('setAILoading', true);
        commit('setAIError', null);
        
        // 获取当前会话的所有消息
        const currentSession = state.chatSessions[state.chatSessions.length - 1];
        const sessionMessages = currentSession ? currentSession.messages : [userMessage];
        
        // 格式化消息为 DeepSeek API 所需格式
        const formattedMessages = formatMessagesForAI(sessionMessages);
        
        // 创建一个空的 AI 消息占位
        const aiMessageId = Date.now() + 1;
        const aiMessage = {
          id: aiMessageId,
          content: '', // 初始为空
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        // 添加到聊天历史和会话
        commit('addChatMessage', aiMessage);
        
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1];
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, aiMessage]
          });
        }
        
        // 设置当前流式消息ID
        commit('setStreamingMessageId', aiMessageId);
        commit('updateStreamingContent', '');
        
        // 调用流式 API
        await sendMessageToAIStream(
          formattedMessages,
          config.deepseek.apiKey,
          // 处理每个数据块
          (chunk, fullContent) => {
            commit('updateStreamingContent', fullContent);
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fullContent 
            });
          },
          // 完成回调
          (fullContent) => {
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fullContent 
            });
            commit('setStreamingMessageId', null);
            commit('setAILoading', false);
            
            // 触发事件，通知组件更新 botTyping 状态
            if (window.EventBus) {
              window.EventBus.$emit('ai-response-complete');
            }
          },
          // 错误回调
          (error) => {
            console.error('AI 流式回复错误:', error);
            commit('setAIError', error.message || '获取 AI 回复失败');
            
            // 使用备用回复方法
            const fallbackContent = generateResponse(message) + "\n\n(注: 由于 AI 服务暂时不可用，这是一个预设的回复)";
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fallbackContent 
            });
            
            commit('setStreamingMessageId', null);
            commit('setAILoading', false);
            
            // 触发事件，通知组件更新 botTyping 状态
            if (window.EventBus) {
              window.EventBus.$emit('ai-response-complete');
            }
          }
        );
      } catch (error) {
        console.error('AI 回复错误:', error);
        commit('setAIError', error.message || '获取 AI 回复失败');
        
        // 使用备用回复方法
        const fallbackMessage = {
          id: Date.now() + 1,
          content: generateResponse(message) + "\n\n(注: 由于 AI 服务暂时不可用，这是一个预设的回复)",
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        commit('addChatMessage', fallbackMessage);
        
        // 更新会话
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1];
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, fallbackMessage]
          });
        }
        
        // 触发事件，通知组件更新 botTyping 状态
        if (window.EventBus) {
          window.EventBus.$emit('ai-response-complete');
        }
        
        commit('setAILoading', false);
      }
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

    async sendResponse({ commit, state }, message) {
      // 检查是否已经有相同内容的消息的回复
      const hasResponse = state.chatSessions && state.chatSessions.some(session => {
        return session.messages && session.messages.some(msg => 
          msg && msg.sender === 'ai' && 
          msg.content && msg.content.includes(message) && 
          msg.timestamp && Date.now() - new Date(msg.timestamp).getTime() < 10000 // 10秒内的回复
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
      
      // 调用 AI API 获取回复（流式输出）
      try {
        commit('setAILoading', true);
        commit('setAIError', null);
        
        // 创建一个临时用户消息用于获取上下文
        const tempUserMessage = {
          role: 'user',
          content: message
        };
        
        // 创建一个空的 AI 消息占位
        const aiMessageId = Date.now() + 1;
        const aiMessage = {
          id: aiMessageId,
          content: '', // 初始为空
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        // 添加到聊天历史和会话
        commit('addChatMessage', aiMessage);
        
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1];
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, aiMessage]
          });
          
          // 如果会话标题是"新对话"，则根据用户消息更新标题
          if (lastSession.title === '新对话') {
            commit('updateSessionTitle', {
              sessionId: lastSession.id,
              title: generateTopicFromMessage(message)
            });
          }
        }
        
        // 设置当前流式消息ID
        commit('setStreamingMessageId', aiMessageId);
        commit('updateStreamingContent', '');
        
        // 调用流式 API
        await sendMessageToAIStream(
          [tempUserMessage],
          config.deepseek.apiKey,
          // 处理每个数据块
          (chunk, fullContent) => {
            commit('updateStreamingContent', fullContent);
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fullContent 
            });
          },
          // 完成回调
          (fullContent) => {
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fullContent 
            });
            commit('setStreamingMessageId', null);
            commit('setAILoading', false);
            
            // 触发事件，通知组件更新 botTyping 状态
            if (window.EventBus) {
              window.EventBus.$emit('ai-response-complete');
            }
          },
          // 错误回调
          (error) => {
            console.error('AI 流式回复错误:', error);
            commit('setAIError', error.message || '获取 AI 回复失败');
            
            // 使用备用回复方法
            const fallbackContent = generateResponse(message) + "\n\n(注: 由于 AI 服务暂时不可用，这是一个预设的回复)";
            commit('updateMessageContent', { 
              messageId: aiMessageId, 
              content: fallbackContent 
            });
            
            commit('setStreamingMessageId', null);
            commit('setAILoading', false);
            
            // 触发事件，通知组件更新 botTyping 状态
            if (window.EventBus) {
              window.EventBus.$emit('ai-response-complete');
            }
          }
        );
      } catch (error) {
        console.error('AI 回复错误:', error);
        commit('setAIError', error.message || '获取 AI 回复失败');
        
        // 使用备用回复方法
        const fallbackMessage = {
          id: Date.now() + 1,
          content: generateResponse(message) + "\n\n(注: 由于 AI 服务暂时不可用，这是一个预设的回复)",
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        commit('addChatMessage', fallbackMessage);
        
        // 更新会话
        if (state.chatSessions.length > 0) {
          const lastSession = state.chatSessions[state.chatSessions.length - 1];
          commit('updateChatSession', {
            sessionId: lastSession.id,
            messages: [...lastSession.messages, fallbackMessage]
          });
        }
        
        // 触发事件，通知组件更新 botTyping 状态
        if (window.EventBus) {
          window.EventBus.$emit('ai-response-complete');
        }
        
        commit('setAILoading', false);
      }
    },

    likeMessage({ commit }, messageId) {
      commit('toggleLikeMessage', messageId);
    },
    
    loadLikedMessages({ commit }) {
      const savedLikedMessages = localStorage.getItem('likedMessages');
      if (savedLikedMessages) {
        try {
          const likedMessages = JSON.parse(savedLikedMessages);
          commit('setLikedMessages', likedMessages);
        } catch (e) {
          console.error('Error parsing liked messages:', e);
          commit('setLikedMessages', []);
        }
      }
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