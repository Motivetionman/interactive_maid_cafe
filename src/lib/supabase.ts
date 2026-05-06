import { createClient } from '@supabase/supabase-js';

// ดึงกุญแจมาจากไฟล์ .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ถ้าลืมใส่กุญแจ ให้มันโวยวายเตือนเรา
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("นายท่านลืมใส่ URL หรือ Key ของ Supabase ในไฟล์ .env หรือเปล่าครับเนี่ย!");
}

// สร้างช่องทางเชื่อมต่อ
export const supabase = createClient(supabaseUrl, supabaseAnonKey);