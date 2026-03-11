import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import Dashboard from '../App.vue' 

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'login',
      component: LoginView 
    },
    { 
      path: '/signup', 
      name: 'signup',
      component: SignUpView 
    },
    { 
      path: '/dashboard', 
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    }
  ]
})

// Route guard เพื่อตรวจสอบการล็อกอิน
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    // ถ้าต้องการตรวจสอบและยังไม่ได้ล็อกอิน ให้ไปที่ login
    next('/')
  } else if (to.path === '/' && isLoggedIn) {
    // ถ้าล็อกอินแล้วและเข้า login ให้ไปที่ dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router