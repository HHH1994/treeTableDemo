import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/treeTable',
  },
  {
    path: '/treeTable',
    name: 'treeTable',
    component: () => import(/* webpackChunkName: "about" */ '../views/dragTable/table.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
