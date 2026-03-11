<template>
  <div class="signup-container">
    <div class="signup-box shadow">
      <img src="/logo.png" alt="Logo" class="signup-logo" />
      <h2>สมัครสมาชิก Student Portal</h2>
      <form @submit.prevent="handleSignUp">
        <div class="input-group">
          <label>ชื่อ-นามสกุล</label>
          <input v-model="formData.name" type="text" placeholder="กรอกชื่อ-นามสกุล" required />
        </div>
        <div class="input-group">
          <label>รหัสนิสิต</label>
          <input v-model="formData.studentId" type="text" placeholder="เช่น b6730200031" required />
        </div>
        <div class="input-group">
          <label>สาขาวิชา</label>
          <input v-model="formData.major" type="text" placeholder="เช่น วิทยาการคอมพิวเตอร์" required />
        </div>
        <div class="input-group">
          <label>โรงเรียนเดิม</label>
          <input v-model="formData.school" type="text" placeholder="ชื่อโรงเรียน" required />
        </div>
        <div class="input-group">
          <label>Username (สำหรับล็อกอิน)</label>
          <input v-model="formData.username" type="text" placeholder="ตั้งชื่อผู้ใช้" required />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input v-model="formData.password" type="password" placeholder="ตั้งรหัสผ่าน" required />
        </div>
        <div class="input-group">
          <label>ยืนยันรหัสผ่าน</label>
          <input v-model="formData.confirmPassword" type="password" placeholder="ยืนยันรหัสผ่านอีกครั้ง" required />
        </div>
        <button type="submit" class="btn-signup">สมัครสมาชิก</button>
      </form>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <p v-if="success" class="success-msg">{{ success }}</p>
      <p class="login-link">
        มีบัญชีแล้ว? <router-link to="/">เข้าสู่ระบบ</router-link>
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

const formData = ref({
  name: '',
  studentId: '',
  major: '',
  school: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const success = ref('')

const handleSignUp = async () => {
  error.value = ''
  success.value = ''

  // ตรวจสอบรหัสผ่าน
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  if (formData.value.password.length < 4) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'
    return
  }

  try {
    // บันทึกข้อมูล profile
    const profileData = {
      name: formData.value.name,
      studentId: formData.value.studentId,
      major: formData.value.major,
      school: formData.value.school,
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      username: formData.value.username,
      password: formData.value.password
    }

    await axios.post(`${API_URL}/profile`, profileData)

    success.value = 'สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนไปหน้า Login...'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    error.value = 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
    console.error(err)
  }
}
</script>

<style scoped>
.signup-container { 
  height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 20px;
}

.signup-box { 
  background: white; 
  padding: 40px; 
  border-radius: 20px; 
  width: 100%; 
  max-width: 450px; 
  text-align: center;
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.signup-logo { 
  width: 60px; 
  margin-bottom: 20px; 
}

.signup-box h2 {
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

.btn-signup { 
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

.btn-signup:hover { 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-signup:active {
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

.success-msg {
  color: #16a34a;
  font-size: 0.9rem;
  margin-top: 15px;
  padding: 10px;
  background: rgba(22, 163, 74, 0.1);
  border-radius: 8px;
}

.shadow { 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-link {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #64748b;
}

.login-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.login-link a:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>
