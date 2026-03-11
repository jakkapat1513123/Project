<template>
  <div class="login-container">
    <div class="login-box shadow">
      <img src="/logo.png" alt="Logo" class="login-logo" />
      <h2>Student Portal Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="ระบุชื่อผู้ใช้" required />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="ระบุรหัสผ่าน" required />
        </div>
        <button type="submit" class="btn-login">เข้าสู่ระบบ</button>
      </form>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <p class="signup-link">
        ยังไม่มีบัญชี? <router-link to="/signup">สมัครสมาชิก</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_URL = 'http://localhost:4000'
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  try {
    // ตรวจสอบจาก json-server
    const response = await axios.get(`${API_URL}/profile`)
    const user = response.data
    
    if (user.username === username.value && user.password === password.value) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', JSON.stringify(user))
      router.push('/dashboard')
    } else {
      error.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    }
  } catch (err) {
    error.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์'
    console.error(err)
  }
}
</script>

<style scoped>
.login-container { 
  height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.login-box { 
  background: white; 
  padding: 40px; 
  border-radius: 20px; 
  width: 100%; 
  max-width: 400px; 
  text-align: center;
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.login-logo { 
  width: 60px; 
  margin-bottom: 20px; 
}

.login-box h2 {
  margin: 0 0 30px 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.input-group { 
  text-align: left; 
  margin-bottom: 15px; 
}

.input-group label { 
  display: block; 
  font-size: 0.85rem; 
  margin-bottom: 6px; 
  color: #1e293b;
  font-weight: 600;
}

.input-group input { 
  width: 100%; 
  padding: 12px; 
  border: 1.5px solid rgba(226, 232, 240, 0.5);
  border-radius: 10px; 
  box-sizing: border-box;
  font-size: 0.95rem;
  transition: all 0.25s ease;
  background: #f8fafc;
}

.input-group input:hover {
  border-color: rgba(226, 232, 240, 0.8);
  background: #ffffff;
}

.input-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.btn-login { 
  width: 100%; 
  padding: 12px; 
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white; 
  border: none; 
  border-radius: 10px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.3s;
  margin-top: 10px;
  box-shadow: 0 4px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-login:hover { 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.error-msg { 
  color: #ef4444; 
  font-size: 0.9rem; 
  margin-top: 15px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.shadow { 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.signup-link {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #64748b;
}

.signup-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.signup-link a:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>