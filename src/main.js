import { createApp } from 'vue'
import App from './AppWrapper.vue' 
import router from './router'      // ตรวจสอบว่าใน src มีโฟลเดอร์ router และไฟล์ index.js

const app = createApp(App)
app.use(router)                    
app.mount('#app')