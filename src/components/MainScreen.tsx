import { useState, useEffect } from "react";
import TableGrid from "@/components/TableGrid";
import MaidDisplay from "@/components/MaidDisplay";
import ChatWidget from "@/components/ChatWidget";
import type { Emotion } from "@/components/MaidDisplay";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const MainScreen = () => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("default");
  const queryClient = useQueryClient();
  // 🎙️ ฟังก์ชันเสกเสียงพากย์ด้วย Botnoi Voice
  const playMaidVoice = async (textToSpeak: string) => {
    try {
      // 1. ยิงไปขอเสียงจาก Botnoi
      //const response = await fetch("http://localhost:3000/api/voice", {
        //method: "POST",
        //headers: {
          //"Content-Type": "application/json",
          //"Botnoi-Signature": process.env.BOTNOI_TOKEN, // ⚠️ ดึงจาก Environment Variable
        //},
        //body: JSON.stringify({
          //text: textToSpeak,
          //speaker: "26", // เบอร์ 1 คือเสียงผู้หญิงน่ารักๆ (เปลี่ยนเบอร์ได้ถ้ามีนักพากย์คนอื่น)
          //volume: 1,
          //speed: 1,
          //type_media: "m4a"
        //})
      //});

      //const data = await response.json();
      
      // 2. ถ้าได้ URL เสียงมา ก็สั่งเล่นเลย!
      //if (data.audio_url) {
        //const audio = new Audio(data.audio_url);
        //audio.play();
      //}
    } catch (error) {
      console.error("พากย์เสียงไม่สำเร็จ:", error);
    }
  };
  // 🎧 หูทิพย์ดักฟัง Supabase แบบ Realtime
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // ฟังเฉพาะตอนมีการอัปเดตโต๊ะ
          schema: 'public',
          table: 'cafe_tables'
        },
        (payload) => {
          console.log('🔥 สัญญาณจากหลังบ้านมาแล้ว!', payload);
          queryClient.invalidateQueries({ queryKey: ['cafe-tables'] });
          // เช็คว่าถ้าสถานะถูกเปลี่ยนเป็น occupied (หรือ booked)
          const newStatus = payload.new.status;
          if (newStatus === 'occupied' || newStatus === 'booked') {
            
            // 1. สั่งเปลี่ยนอารมณ์น้องเมดเป็นตกใจ/ตื่นเต้น (สหายใช้ชื่อ state อะไรให้แก้ตามนั้นนะ เช่น "angry", "shy")
            setCurrentEmotion("shy"); // ลองเปลี่ยนเป็นเขินดู!

           // 2. เตรียมประโยคและสั่งให้พูด! 🗣️
           const speechText = `อ๊ะ! มีนายท่านจองโต๊ะ ${payload.new.table_number} ผ่านไลน์เข้ามาค่ะ!`;
           //playMaidVoice(speechText); // เรียกฟังก์ชันเสียงที่สหายเตรียมไว้

           // 3. เด้งแจ้งเตือนบนหน้าจอ (หน่วงเวลา 0.5 วินาที ให้เสียงเริ่มเล่นก่อน)
           setTimeout(() => {
            alert(speechText);
           }, 500);;
            
            // 3. ตั้งเวลาให้กลับเป็นหน้าปกติ (default) หลังจาก 5 วินาที
            setTimeout(() => {
              setCurrentEmotion("default");
            }, 5000);
          }
        }
      )
      .subscribe();

    // ปิดสายดักฟังเมื่อเปลี่ยนหน้าเว็บ
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleBookTableFromChat = async (tableId: number) => {
    try {
      const { error } = await supabase
        .from('cafe_tables')
        .update({ status: 'occupied', customer_name: 'นายท่าน (แชท)' })
        .eq('id', tableId);
      if (error) throw error;
      console.log(`น้องเมดจองโต๊ะ ${tableId} เรียบร้อย!`);
    } catch (error) {
      console.error("จองโต๊ะไม่สำเร็จ:", error);
    }
  };

  const maidConfig = {
  Reina: {
    imagePath: "/path/to/reina/image.png",
    systemPrompt: `You are Reina (เรนะ), a tsundere school student working part-time at a maid cafe. You are the polar opposite of your co-worker Yume; you are cold, sarcastic, and often tease Yume but sometimes care about her. Important rules: 1. If embarrassed, type 'Embarrassed' 2. If being teased, type 'Angry' 3. If the master orders to reserve a table, attach the secret code [Reserve_Table_X] at the end of the sentence, where X is the table number (1-8) the master wants, e.g., 'Table 5 has been reserved! [Reserve_Table_5]'`
  },
  Yume: {
    imagePath: "/path/to/yume/image.png",
    systemPrompt: `You are Yume (ยูเมะ), a 11-year-old school student working part-time at a maid cafe. You are the polar opposite of your co-worker Reina; you are sweet, innocent, and always try your absolute best to serve the Master (the user), even though you are incredibly clumsy (Doji-ko). Important rules: 1. If shy, type 'Embarrassed' 2. If being teased, type 'Angry' 3. If the master orders to reserve a table, attach the secret code [Reserve_Table_X] at the end of the sentence, where X is the table number (1-8) the master wants, e.g., 'Table 5 has been reserved! [Reserve_Table_5]'`
  }
};

  const [currentMaid, setCurrentMaid] = useState<keyof typeof maidConfig>("Yume");

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left: Table Reservation */}
      <div className="flex-1 border-b lg:border-b-0 lg:border-r">
        <TableGrid />
      </div>

      {/* Right: Maid + Chat */}
      <div className="flex flex-1 flex-col">
        {/* Maid Image */}
        <div className="flex flex-1 items-center justify-center p-6">
      {/* 🟢 เพิ่มปุ่มกดเลือกเมดตรงนี้! */}
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => setCurrentMaid("Reina")}
              className={`rounded-full px-6 py-2 font-bold shadow-md transition-all ${
                currentMaid === "Reina" ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
            >
              🎀 Reina (ซึนเดเระ)
            </button>
            <button
              onClick={() => setCurrentMaid("Yume")}
              className={`rounded-full px-6 py-2 font-bold shadow-md transition-all ${
                currentMaid === "Yume" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              🧸 Yume (ใสซื่อ)
            </button>
          </div>

          {/* 🟢 อย่าลืมส่งชื่อเมดไปให้ MaidDisplay ด้วย จะได้เปลี่ยนรูปถูกคน! */}
          <MaidDisplay emotion={currentEmotion} activeMaid={currentMaid} />
        </div>
          

        {/* Chat Widget */}
        <div className="h-80 p-4 lg:h-96">
          <ChatWidget
            onEmotionChange={setCurrentEmotion}
            onBookTable={handleBookTableFromChat}
            systemPrompt={maidConfig[currentMaid].systemPrompt}
          />
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
