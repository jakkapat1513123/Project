<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = 'http://localhost:4000'

const profile = ref({ name: '', studentId: '', major: '', school: '', image: '' })
const courses = ref([])
const posts = ref([])
const isEditProfile = ref(false)
const isEditingCourse = ref(false)
const isAddingPost = ref(false)
const isDraggingImage = ref(false)
const courseForm = ref({ id: null, code: '', name: '', credit: 3, grade: '' })
const postForm = ref({ title: '', content: '' })
const editingCourse = ref(null)

const fetchData = async () => {
  try {
    const resP = await axios.get(`${API_URL}/profile`)
    profile.value = resP.data
    const resC = await axios.get(`${API_URL}/courses`)
    courses.value = resC.data
    const resPost = await axios.get(`${API_URL}/posts`)
    posts.value = resPost.data
  } catch (err) {
    console.error("Fetch error:", err)
  }
}

const updateProfile = async () => {
  await axios.put(`${API_URL}/profile`, profile.value)
  isEditProfile.value = false
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    convertImageToBase64(file)
  }
}

const handleImageDrop = (event) => {
  event.preventDefault()
  isDraggingImage.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    convertImageToBase64(files[0])
  }
}

const convertImageToBase64 = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    profile.value.image = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveCourse = async () => {
  if (!courseForm.value.code || !courseForm.value.name) {
    alert('กรุณากรอกรหัสวิชาและชื่อวิชา')
    return
  }
  const payload = { ...courseForm.value, id: courseForm.value.id || Date.now().toString() }
  if (courseForm.value.id) {
    await axios.put(`${API_URL}/courses/${courseForm.value.id}`, payload)
  } else {
    await axios.post(`${API_URL}/courses`, payload)
  }
  courseForm.value = { id: null, code: '', name: '', credit: 3, grade: '' }
  isEditingCourse.value = false
  fetchData()
}

const editCourse = (course) => {
  editingCourse.value = course
  courseForm.value = { ...course }
  isEditingCourse.value = true
}

const cancelEditCourse = () => {
  isEditingCourse.value = false
  editingCourse.value = null
  courseForm.value = { id: null, code: '', name: '', credit: 3, grade: '' }
}

const deleteCourse = async (id) => {
  if (confirm('ยืนยันการลบข้อมูล?')) {
    await axios.delete(`${API_URL}/courses/${id}`)
    fetchData()
  }
}

const addPost = async () => {
  if (!postForm.value.title || !postForm.value.content) {
    alert('กรุณากรอกหัวข้อและเนื้อหา')
    return
  }
  const newPost = {
    id: Date.now().toString(),
    title: postForm.value.title,
    content: postForm.value.content,
    date: new Date().toISOString().split('T')[0]
  }
  await axios.post(`${API_URL}/posts`, newPost)
  postForm.value = { title: '', content: '' }
  isAddingPost.value = false
  fetchData()
}

const deletePost = async (id) => {
  if (confirm('ยืนยันการลบกระทู้นี้?')) {
    await axios.delete(`${API_URL}/posts/${id}`)
    fetchData()
  }
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/')
}

onMounted(fetchData)
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-wrapper">
        <div class="brand">STUDENT <span>PORTAL</span></div>
        <button @click="handleLogout" class="btn-logout">LOGOUT</button>
      </div>
    </nav>

    <div class="dashboard-grid">
      <aside class="sidebar">
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar-wrapper"
              @dragover.prevent="isDraggingImage = true"
              @dragleave="isDraggingImage = false"
              @drop="handleImageDrop"
              :class="{ dragging: isDraggingImage }">
              <img :src="profile.image" class="avatar" alt="User" />
              <div class="avatar-overlay">
                <input 
                  type="file" 
                  @change="handleImageUpload"
                  accept="image/*"
                  style="display: none;"
                  ref="fileInput" />
                <label class="upload-label" @click="$refs.fileInput?.click()">
                  📸 Change Photo
                </label>
              </div>
            </div>
          </div>
          
          <div v-if="!isEditProfile" class="profile-detail">
            <h2 class="user-name">{{ profile.name }}</h2>
            <p class="user-id">ID: {{ profile.studentId }}</p>
            <div class="info-list">
              <div class="info-group">
                <label>MAJOR</label>
                <span>{{ profile.major }}</span>
              </div>
              <div class="info-group">
                <label>SCHOOL</label>
                <span>{{ profile.school }}</span>
              </div>
            </div>
            <button @click="isEditProfile = true" class="btn-edit-full">EDIT PROFILE</button>
          </div>

          <form v-else @submit.prevent="updateProfile" class="edit-form">
            <div class="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input v-model="profile.name" placeholder="ชื่อของคุณ" />
            </div>
            <div class="form-group">
              <label>สาขา</label>
              <input v-model="profile.major" placeholder="สาขาวิชา" />
            </div>
            <div class="form-btns">
              <button type="submit" class="btn-save">บันทึก</button>
              <button @click="isEditProfile = false" type="button" class="btn-cancel">ยกเลิก</button>
            </div>
          </form>
        </div>
      </aside>

      <main class="content-area">
        <div class="data-card">
          <div class="card-title">
            <h3>รายละเอียดการเรียน</h3>
            <p>จัดการวิชาเรียนและเกรด</p>
          </div>

          <button 
            v-if="!isEditingCourse"
            @click="isEditingCourse = true" 
            class="btn-add-course">
            เพิ่มวิชา
          </button>

          <div class="table-container">
            <table v-if="courses.length > 0">
              <thead>
                <tr>
                  <th>รหัสวิชา</th>
                  <th>ชื่อวิชา</th>
                  <th>หน่วยกิต</th>
                  <th>เกรด</th>
                  <th class="txt-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in courses" :key="item.id" class="course-row">
                  <td class="f-bold">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td class="txt-center">{{ item.credit }}</td>
                  <td class="txt-center"><span class="grade-box" :class="item.grade">{{ item.grade }}</span></td>
                  <td class="txt-center action-btns">
                    <button @click="editCourse(item)" class="btn-edit-text">แก้ไข</button>
                    <button @click="deleteCourse(item.id)" class="btn-del-text">ลบ</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <p>📚 ยังไม่มีวิชาเรียน</p>
            </div>
          </div>
        </div>
      </main>

      <section class="posts-section">
        <div class="data-card">
          <div class="card-title">
            <h3>กระทู้คำถาม/บันทึก</h3>
            <p>แบ่งปันความคิดเห็นและประสบการณ์กับสมาชิกคน</p>
          </div>

          <button 
            v-if="!isAddingPost"
            @click="isAddingPost = true" 
            class="btn-add-post">
            เพิ่มกระทู้ใหม่
          </button>

          <div v-if="isAddingPost" class="post-form-container">
            <form @submit.prevent="addPost" class="post-form">
              <div class="form-group">
                <label for="post-title">หัวข้อ</label>
                <input 
                  id="post-title"
                  v-model="postForm.title" 
                  placeholder="ระบุหัวข้อกระทู้"
                  required 
                />
              </div>
              <div class="form-group">
                <label for="post-content">เนื้อหา</label>
                <textarea 
                  id="post-content"
                  v-model="postForm.content" 
                  placeholder="เขียนเนื้อหาของคุณ..."
                  rows="5"
                  required
                ></textarea>
              </div>
              <div class="form-buttons">
                <button type="submit" class="btn-submit-post">บันทึกกระทู้</button>
                <button type="button" @click="isAddingPost = false" class="btn-cancel-post">ยกเลิก</button>
              </div>
            </form>
          </div>

          <div class="posts-list">
            <div v-if="posts.length === 0" class="empty-posts">
              <p>ยังไม่มีกระทู้</p>
            </div>
            <div v-else v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <div>
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-date">{{ post.date }}</p>
                </div>
                <button @click="deletePost(post.id)" class="btn-delete-post">ลบ</button>
              </div>
              <p class="post-content">{{ post.content }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal สำหรับเพิ่ม/แก้ไขวิชา -->
    <div v-if="isEditingCourse" class="modal-overlay" @click.self="cancelEditCourse">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ courseForm.id ? 'แก้ไขวิชา' : 'เพิ่มวิชา' }}</h3>
          <button @click="cancelEditCourse" class="btn-close">✕</button>
        </div>
        <form @submit.prevent="saveCourse" class="modal-form">
          <div class="form-section">
            <div class="form-row-two-cols">
              <div class="form-group">
                <label for="courseCode">รหัสวิชา</label>
                <input 
                  id="courseCode"
                  v-model="courseForm.code" 
                  type="text"
                  placeholder="เช่น 01418214" 
                  required 
                />
              </div>
              <div class="form-group">
                <label for="courseName">ชื่อวิชา</label>
                <input 
                  id="courseName"
                  v-model="courseForm.name" 
                  type="text"
                  placeholder="Practicum in Software Development" 
                  required 
                />
              </div>
            </div>
            <div class="form-row-two-cols">
              <div class="form-group">
                <label for="courseCredit">หน่วยกิต</label>
                <input 
                  id="courseCredit"
                  v-model.number="courseForm.credit" 
                  type="number" 
                  min="1" 
                  max="10" 
                  required 
                />
              </div>
              <div class="form-group">
                <label for="courseGrade">เกรด</label>
                <select 
                  id="courseGrade"
                  v-model="courseForm.grade" 
                  required
                >
                  <option value="">เลือกเกรด</option>
                  <option v-for="g in ['A','B+','B','C+','C','D+','D','F']" :key="g">{{g}}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-buttons">
            <button type="submit" class="btn-save-modal">บันทึกข้อมูล</button>
            <button type="button" @click="cancelEditCourse" class="btn-cancel-modal">ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

.navbar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding: 1.25rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.nav-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.brand span {
  color: #3b82f6;
  font-weight: 800;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #0f172a;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(226, 232, 240, 0.8);
}

.dashboard-grid {
  max-width: 1400px;
  margin: 2.5rem auto;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 2rem;
  padding: 0 1.5rem;
}

.profile-card, .data-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  overflow: hidden;
  box-shadow: 0 8px 32px -8px rgba(15, 23, 42, 0.08);
  transition: all 0.3s ease;
}

.profile-card:hover, .data-card:hover {
  box-shadow: 0 20px 48px -12px rgba(15, 23, 42, 0.12);
  border-color: rgba(226, 232, 240, 0.8);
}

.avatar-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 3rem 0;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-wrapper.dragging {
  transform: scale(1.05);
  opacity: 0.85;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 20px;
  object-fit: cover;
  background: #fff;
  border: 4px solid #fff;
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.15);
  display: block;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(4px);
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.upload-label {
  color: white;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.9);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: background 0.3s ease;
}

.upload-label:hover {
  background: rgba(59, 130, 246, 1);
}

.profile-detail {
  padding: 2.5rem;
  text-align: center;
}

.user-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.user-id {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.info-list {
  margin: 2rem 0;
  text-align: left;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding: 1.5rem 0;
}

.info-group {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-group:last-child {
  margin-bottom: 0;
}

.info-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-group span {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.btn-edit-full {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.btn-edit-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(30, 41, 59, 0.2);
}

.edit-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.5);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
  background: rgba(240, 249, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-save, .btn-cancel {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-save {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(30, 41, 59, 0.2);
}

.btn-cancel {
  background: rgba(241, 245, 249, 0.7);
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.btn-cancel:hover {
  background: rgba(241, 245, 249, 0.9);
}

.data-card {
  padding: 2rem;
}

.card-title {
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding-bottom: 1.5rem;
}

.card-title h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: #0f172a;
}

.card-title p {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.btn-add-course,
.btn-add-post {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.btn-add-course:hover,
.btn-add-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(30, 41, 59, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeInBackdrop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInBackdrop {
  from { 
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1;
    backdrop-filter: blur(5px);
  }
}

.modal-content {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px -10px rgba(15, 23, 42, 0.25), 
              0 0 1px rgba(15, 23, 42, 0.05);
  width: 91%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideInModal 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(226, 232, 240, 0.3);
  overflow: hidden;
}

@keyframes slideInModal {
  0% {
    transform: translateY(40px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.25rem 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.btn-close {
  background: rgba(226, 232, 240, 0.3);
  border: none;
  font-size: 1.375rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  line-height: 1;
  font-weight: 300;
}

.btn-close:hover {
  background: rgba(226, 232, 240, 0.6);
  color: #0f172a;
  transform: rotate(90deg) scale(1.1);
}

.btn-close:active {
  transform: rotate(90deg) scale(0.95);
}

.modal-form {
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-row-two-cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.modal-form .form-group {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.modal-form label {
  display: block;
  font-size: 0.8rem;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-shadow: 0px 0.5px 0px rgba(255, 255, 255, 0.5);
}

.modal-form input,
.modal-form select {
  width: 100%;
  padding: 0.95rem 1.2rem;
  border: 1.5px solid rgba(226, 232, 240, 0.5);
  border-radius: 14px;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  background: #f8fafc;
  color: #0f172a;
  font-weight: 500;
}

.modal-form input::placeholder,
.modal-form select::placeholder {
  color: #cbd5e1;
  font-weight: 400;
}

.modal-form input:hover,
.modal-form select:hover {
  border-color: rgba(226, 232, 240, 0.8);
  background: #ffffff;
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.05);
}

.modal-form input:focus,
.modal-form select:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 
              0 4px 12px -2px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.modal-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(226, 232, 240, 0.3);
}

.btn-save-modal, .btn-cancel-modal {
  padding: 1rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.btn-save-modal {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 6px 20px -4px rgba(59, 130, 246, 0.35);
}

.btn-save-modal:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px -6px rgba(59, 130, 246, 0.45);
}

.btn-save-modal:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.25);
}

.btn-cancel-modal {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid rgba(226, 232, 240, 0.6);
}

.btn-cancel-modal:hover {
  background: #e2e8f0;
  border-color: rgba(226, 232, 240, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08);
}

.btn-cancel-modal:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(15, 23, 42, 0.05);
}

.table-container {
  margin-top: 2rem;
  overflow-x: auto;
}

.empty-state,
.empty-posts {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: rgba(241, 245, 249, 0.5);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

th {
  text-align: left;
  font-size: 0.75rem;
  color: #64748b;
  padding: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  color: #0f172a;
}

.course-row:hover {
  background: rgba(241, 245, 249, 0.5);
}

.grade-box {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  display: inline-block;
}

.grade-box.A { background: rgba(220, 252, 231, 0.6); color: #166534; }
.grade-box.B { background: rgba(219, 234, 254, 0.6); color: #1e40af; }
.grade-box.B\+ { background: rgba(219, 234, 254, 0.6); color: #1e40af; }
.grade-box.C { background: rgba(254, 243, 199, 0.6); color: #b45309; }
.grade-box.C\+ { background: rgba(254, 243, 199, 0.6); color: #b45309; }
.grade-box.D { background: rgba(254, 215, 170, 0.6); color: #92400e; }
.grade-box.D\+ { background: rgba(254, 215, 170, 0.6); color: #92400e; }
.grade-box.F { background: rgba(254, 226, 226, 0.6); color: #991b1b; }

.action-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-edit-text, .btn-del-text {
  background: transparent;
  border: none;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}

.btn-edit-text {
  color: #3b82f6;
}

.btn-edit-text:hover {
  background: rgba(219, 234, 254, 0.5);
}

.btn-del-text {
  color: #ef4444;
}

.btn-del-text:hover {
  background: rgba(254, 226, 226, 0.5);
}

/* Posts Section Styles */
.posts-section {
  max-width: 1400px;
  margin: 0 auto 2.5rem;
  padding: 0 1.5rem;
}

.post-form-container {
  margin-bottom: 2rem;
}

.post-form {
  background: rgba(255, 255, 255, 0.5);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.post-form .form-group {
  margin-bottom: 1.25rem;
}

.post-form label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.post-form input,
.post-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
}

.post-form input:focus,
.post-form textarea:focus {
  border-color: #3b82f6;
  background: rgba(240, 249, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-submit-post, .btn-cancel-post {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-submit-post {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  flex: 1;
}

.btn-submit-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(30, 41, 59, 0.2);
}

.btn-cancel-post {
  background: rgba(241, 245, 249, 0.7);
  color: #0f172a;
  border: 1px solid rgba(226, 232, 240, 0.5);
  flex: 0.5;
}

.btn-cancel-post:hover {
  background: rgba(241, 245, 249, 0.9);
}

.posts-list {
  display: grid;
  gap: 1.25rem;
}

.post-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.08);
  border-color: rgba(226, 232, 240, 0.8);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.post-date {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.post-content {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #475569;
  word-break: break-word;
}

.btn-delete-post {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete-post:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.txt-center {
  text-align: center;
}

.f-bold {
  font-weight: 700;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .nav-wrapper {
    padding: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .table-container {
    font-size: 0.8rem;
  }

  th, td {
    padding: 0.75rem;
  }

  .action-btns {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
  }

  .posts-section {
    padding: 0 1rem;
  }

  .form-buttons {
    flex-direction: column;
  }

  .btn-submit-post, .btn-cancel-post {
    width: 100%;
  }
}
</style>