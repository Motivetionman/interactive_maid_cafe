# 🍰 Maid Cafe Reservations & AI Interactive System

ระบบจำลองและจัดการการจองโต๊ะร้านเมดคาเฟ่แบบ Interactive ที่เชื่อมต่อระหว่างหน้าเว็บหน้าร้าน (Frontend), ระบบหลังบ้าน (Backend), ฐานข้อมูลแบบ Realtime (Supabase), และ AI Chatbot / Voice Synthesis (Botnoi & Gemini)

---

## ✨ ไฮไลท์ฟีเจอร์ (Key Features)

- **Interactive Maid Display**: น้องเมดมีชีวิตชีวา ตอบสนองและเปลี่ยนสีหน้า/อารมณ์ได้ (Default, Shy, Angry, Crying) พร้อมระบบเสียงพากย์ภาษาไทย
- **Real-time Table Grid**: ผังโต๊ะ 8 โต๊ะธีมคาเฟ่ (🍰, 🍧, 🍡, 🧋, ☕, 🎂, 🍩, 🍪) อัปเดตสถานะโต๊ะว่าง / ถูกจอง แบบ Real-time ทันทีผ่าน Supabase
- **Botnoi Chatbot Webhook**: รองรับการจองโต๊ะ (
eserve_table) และยกเลิกการจอง (cancel_table) ผ่าน Chatbot ของ Botnoi อัปเดตลงฐานข้อมูลอัตโนมัติ
- **Botnoi Voice (TTS)**: ระบบสังเคราะห์เสียงพากย์น้องเมดภาษาไทยผ่าน Botnoi Voice API
- **AI Conversation (Gemini AI)**: กล่องข้อความคุยกับน้องเมด ขับเคลื่อนด้วยโมเดล Gemini ตามบุคลิกตัวละคร (เช่น Reina สาวซึนเดเระ หรือ Yume เมดสาวน้อย)
- **BGM Player**: มีเครื่องเล่นเพลง Background Music สไตล์เมดคาเฟ่/อนิเมะในตัว

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS + shadcn/ui (Radix UI)
  - TanStack React Query (State Management)
  - Lucide Icons & Sonner Toast
- **Backend**:
  - Node.js & Express.js (server.js)
  - @supabase/supabase-js
  - CORS & Dotenv
- **Services & APIs**:
  - **Supabase**: PostgreSQL Real-time Database
  - **Botnoi NLP / Voice**: Webhook Chatbot & Text-to-Speech
  - **Google Gemini API**: AI Persona & Conversational Intelligence

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
`ash
npm install
`

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ .env.example เป็น .env แล้วใส่ข้อมูลของคุณ:
`ash
cp .env.example .env
`

`env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Gemini AI API Key
VITE_GEMINI_API_KEY=your-gemini-api-key

# Botnoi Voice Token
BOTNOI_TOKEN=your-botnoi-token
VITE_BOTNOI_TOKEN=your-botnoi-token
`

### 3. รันโปรเจกต์

**รันฝั่งหลังบ้าน (Backend Server - Port 3000):**
`ash
node server.js
`

**รันฝั่งหน้าบ้าน (Frontend - Port 8080):**
`ash
npm run dev
`

---

## 📡 API Endpoints (Backend)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | /webhook | รับ Webhook จาก Botnoi Chatbot เพื่อสั่งจองโต๊ะ (
eserve_table) หรือยกเลิก (cancel_table) |
| POST | /api/voice | ตัวกลาง Proxy ยิงไปขอเสียงพากย์จาก Botnoi Voice API โดยไม่ต้องเปิดเผย Token ฝั่ง Client |
