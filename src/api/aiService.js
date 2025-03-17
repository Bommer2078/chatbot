// DeepSeek API 服务
const API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * 发送消息到 DeepSeek API
 * @param {Array} messages - 消息历史记录
 * @param {String} apiKey - DeepSeek API Key
 * @returns {Promise} - 返回 API 响应
 */
export const sendMessageToAI = async (messages, apiKey) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求 AI 服务失败');
    }

    return await response.json();
  } catch (error) {
    console.error('AI 服务请求错误:', error);
    throw error;
  }
};

/**
 * 发送消息到 DeepSeek API（流式输出）
 * @param {Array} messages - 消息历史记录
 * @param {String} apiKey - DeepSeek API Key
 * @param {Function} onChunk - 处理每个数据块的回调函数
 * @param {Function} onComplete - 完成时的回调函数
 * @param {Function} onError - 错误处理回调函数
 */
export const sendMessageToAIStream = async (messages, apiKey, onChunk, onComplete, onError) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求 AI 服务失败');
    }

    // 获取响应的可读流
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    
    // 处理流式数据
    let streamActive = true; // 使用变量控制循环
    while (streamActive) {
      const { done, value } = await reader.read();
      if (done) {
        streamActive = false; // 结束循环
        break;
      }
      
      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true });
      
      // 处理 SSE 格式的数据
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              const content = data.choices[0].delta.content;
              fullContent += content;
              onChunk(content, fullContent);
            }
          } catch (e) {
            console.error('解析流数据错误:', e);
          }
        } else if (line === 'data: [DONE]') {
          streamActive = false; // 收到结束标记，结束循环
        }
      }
    }

    // 流处理完成
    onComplete(fullContent);
    return fullContent;
  } catch (error) {
    console.error('AI 流式服务请求错误:', error);
    onError(error);
    throw error;
  }
};

/**
 * 格式化消息历史记录为 DeepSeek API 所需格式
 * @param {Array} messages - 应用内的消息历史记录
 * @param {Number} maxMessages - 最大消息数量限制，默认为10条
 * @returns {Array} - 格式化后的消息
 */
export const formatMessagesForAI = (messages, maxMessages = 10) => {
  // 过滤掉空消息
  const validMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
  
  // 如果消息数量超过限制，只保留最近的消息
  const recentMessages = validMessages.length > maxMessages 
    ? validMessages.slice(validMessages.length - maxMessages) 
    : validMessages;
  
  // 转换为 DeepSeek API 格式
  return recentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}; 