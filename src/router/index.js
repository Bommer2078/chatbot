import Vue from 'vue'
import VueRouter from 'vue-router'
import ChatHome from '../views/ChatHome.vue'
import ChatDialog from '../views/ChatDialog.vue'
import AIAgents from '../views/AIAgents.vue'
import ChatHistory from '../views/ChatHistory.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ChatHome',
    component: ChatHome
  },
  {
    path: '/chat',
    name: 'ChatDialog',
    component: ChatDialog
  },
  {
    path: '/agents',
    name: 'AIAgents',
    component: AIAgents
  },
  {
    path: '/history',
    name: 'ChatHistory',
    component: ChatHistory
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router 