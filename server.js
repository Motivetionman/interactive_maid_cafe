import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors'; // 🟢 จุดที่ 1: Import CORS
import dotenv from 'dotenv'; // 🟢 1. Import dotenv เข้ามา

dotenv.config(); // 🟢 2. สั่งให้อ่านค่าจากไฟล์ .env
const app = express();
app.use(express.json());
app.use(cors()); // 🟢 จุดที่ 2: อนุญาตให้หน้าเว็บเราคุยกับหลังบ้านตัวเองได้

const PORT = 3000;

// 🟢 1. ตั้งค่าการเชื่อมต่อ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// 🟢 จุดที่ 3: สร้างช่องทางให้หน้าเว็บมาขอเสียงพากย์ (ประตูใหม่)
app.post('/api/voice', async (req, res) => {
    try {
        const response = await fetch("https://api-voice.botnoi.ai/api/service/generate_audio", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Botnoi-Signature": process.env.BOTNOI_TOKEN // <-- ระวังลืมใส่ Token นะ!
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.json(data); 

    } catch (error) {
        console.error("พังครับลูกพี่:", error);
        res.status(500).json({ error: "สร้างเสียงไม่ได้" });
    }
});
app.post('/webhook', async (req, res) => {
    const data = req.body;
    console.log("📩 ได้รับข้อความจาก Botnoi:", data);

    try {
        // 1. สร้าง Map แปลงร่างเลขโต๊ะ (ย้ายมาไว้ข้างนอก จะได้ใช้ร่วมกันทั้งจองและยกเลิก)
        const emojiMap = {
            1: '1 🍰', 2: '2 🍧', 3: '3 🍡', 4: '4 🧋',
            5: '5 ☕', 6: '6 🎂', 7: '7 🍩', 8: '8 🍪'
        };

        const targetTable = emojiMap[data.table_number];

        // ถ้ามีการส่งเลขโต๊ะมา แต่หาไม่เจอในร้าน ให้หยุดแค่นี้
        if (data.table_number && !targetTable) {
            console.log("❌ ไม่มีเบอร์โต๊ะนี้ในร้านนะนายท่าน!");
            return res.status(200).send('OK');
        }

       // 🟢 กรณีที่ 1: ลูกค้า "จองโต๊ะ"
        if (data.intent === 'reserve_table') {
            const { error } = await supabase
                .from('cafe_tables')
                .update({
                    status: 'occupied',
                    customer_name: data.customer_name, 
                    customer_phone: data.phone_number // 👈 จุดเกิดเหตุ: แก้คีย์ฝั่งซ้ายเป็น customer_phone ให้ตรงเป๊ะ!
                })
                .eq('table_number', targetTable);

            if (error) throw error;
            console.log(`✅ จองโต๊ะ ${targetTable} ให้คุณ ${data.customer_name} สำเร็จ!`);
        }
        
        // 🔴 กรณีที่ 2: ลูกค้า "ยกเลิกโต๊ะ"
        else if (data.intent === 'cancel_table') {
            const { error } = await supabase
                .from('cafe_tables')
                .update({
                    status: 'vacant',       // 👈 แอบเห็นในรูปว่าสหายใช้คำว่า vacant เปลี่ยนให้ตรงด้วยครับ
                    customer_name: null,    // ล้างชื่อลูกค้าออก
                    customer_phone: null    // 👈 ล้างเบอร์โทรออก (แก้เป็น customer_phone ด้วย)
                })
                .eq('table_number', targetTable);

            if (error) throw error;
            console.log(`🗑️ ยกเลิกโต๊ะ ${targetTable} สำเร็จ! โต๊ะกลับมาว่างแล้ว`);
        }

    res.status(200).send('OK');
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        res.status(500).json({ error: "ไม่สามารถประมวลผลได้" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 หลังบ้านเปิดแล้วที่ http://localhost:${PORT}`);
});