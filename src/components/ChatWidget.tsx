import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Emotion } from "@/components/MaidDisplay";

interface Message {
  role: "maid" | "user";
  text: string;
}

// TODO: Connect to Hot-Headed Maid API for order processing later. This current app only handles table reservations.
// async function submitOrderToHotHeadedMaid() {
//   const response = await fetch("https://api.example.com/hot-headed-maid/order", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ order: "..." }),
//   });
//   return response.json();
// }

const WELCOME_MSG =
  "ยินดีต้อนรับกลับมาค่ะนายท่าน! โต๊ะยังว่างอยู่นะคะ ให้หนูช่วยจองไหม... อ๊ะ! สะดุดล้ม!";

// ฟังก์ชันพากย์เสียงด้วย Botnoi Voice
const speakThai = async (text: string) => {
  try { // 👈 ต้องมี try ตรงนี้เพื่อคู่กับ catch ข้างล่างครับ
    const token = import.meta.env.VITE_BOTNOI_TOKEN;
    if (!token) {
      console.warn("⚠️ ไม่พบ VITE_BOTNOI_TOKEN ในไฟล์ .env");
      return;
    }

    const response = await fetch("https://api-voice.botnoi.ai/api/service/generate_audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Botnoi-Token": token
      },
      body: JSON.stringify({
        text: text,
        speaker: "26",
        volume: 1,
        speed: 1,
        type_media: "m4a"
      })
    });

    const data = await response.json();

    if (data.audio_url) {
      const maidVoice = new Audio(data.audio_url);
      maidVoice.play();
    } else {
      console.error("ไม่ได้ไฟล์เสียง:", data);
    }

  } catch (error) {
    console.error("Botnoi Voice Error:", error);
  }
};

function getMaidResponse(input: string): { reply: string; emotion: Emotion } {
  const lower = input.toLowerCase();
  if (/น่ารัก|ชม|สวย|เก่ง|ดี/.test(lower)) {
    return { reply: "แงงง นายท่านชมหนูหรอคะ เขินจัง 😳💕", emotion: "shy" };
  }
  if (/ดุ|บ้า|โง่|แย่/.test(lower)) {
    return { reply: "ฮืออออ นายท่านอย่าดุหนูสิคะ หนูขอโทษ 😢", emotion: "crying" };
  }
  if (/กวน|ไม่จอง|ไม่เอา|เบื่อ/.test(lower)) {
    return { reply: "ชิ! ไม่จองก็ยืนเมื่อยไปเลยค่ะนายท่าน! 😤", emotion: "angry" };
  }
  const defaults = [
    "หนูพร้อมช่วยนายท่านเสมอค่ะ~ อ๊ะ ทำแก้วน้ำหล่นอีกแล้ว 😅",
    "นายท่านต้องการอะไรเพิ่มไหมคะ~ หนูจะรีบไปหยิบให้... แต่อย่าเร่งนะ เดี๋ยวล้มอีก 💦",
    "เอ่อ... หนูจำออเดอร์ได้นะคะ! จำได้... มั้ง? 😊",
  ];
  return {
    reply: defaults[Math.floor(Math.random() * defaults.length)],
    emotion: "default",
  };
}

interface ChatWidgetProps {
  systemPrompt: string;
  onEmotionChange: (emotion: Emotion) => void;
  onBookTable: (tableId: number) => void;
}

const ChatWidget = ({ systemPrompt, onEmotionChange, onBookTable }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentWelcome = useRef(false);
  // 🟢 State คุมการปลดล็อกกล่องแชท
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinCode, setPinCode] = useState("");
  
  const SECRET_PASS = "admin1234"; // รหัสผ่านพี่เลี้ยง

  const handleUnlock = () => {
    if (pinCode === SECRET_PASS) {
      setIsUnlocked(true);
      alert("✅ ปลดล็อกระบบสำเร็จ! สวัสดีครับพี่เลี้ยง!");
    } else {
      alert("❌ รหัสผ่านไม่ถูกต้อง! botnoi voice tokenจะหมดแล้วแงงง!");
      setPinCode("");
    }
  };

  useEffect(() => {
    if (hasSentWelcome.current) return;
    hasSentWelcome.current = true;
    const timer = setTimeout(() => {
      setMessages([{ role: "maid", text: WELCOME_MSG }]);
      speakThai(WELCOME_MSG);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    const handleSend = async () => {
      const trimmed = input.trim();
      if (!trimmed) return;
  
      const userMsg: Message = { role: "user", text: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
  
      // Initial maid response with delay
      //setTimeout(() => {
        //const { reply, emotion } = getMaidResponse(trimmed);
       // onEmotionChange(emotion);
        //setMessages((prev) => [...prev, { role: "maid", text: reply }]);
        //speakThai(reply);
      //}, 600);
  
      // API call for bot response
      // API call for bot response (ใช้สมอง Gemini)
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
        // ดักจับว่านายท่านลืมใส่ Key หรือลืม Restart เซิร์ฟหรือเปล่า
        if (!apiKey) {
          throw new Error("หา API Key ไม่เจอ! ลืม Restart Server หรือเปล่าคะนายท่าน?");
        }
  
       // 🟢 ลองเปลี่ยนเป็นชื่อนี้ตามหน้า Dashboard ของสหายเลยครับ
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;;
  
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: systemPrompt
              }]
            },
            contents: [{ parts: [{ text: trimmed }] }]
          }),
        });
  
        const data = await response.json();
  
        // 📹 กล้องวงจรปิด: แอบดูว่าญาติผมตอบอะไรกลับมา (กด F12 ดูใน Console)
        console.log("ญาติแชท (Gemini) ตอบกลับมาว่า:", data);
  
        if (data.error) {
          throw new Error(data.error.message); // ถ้าญาติผมงอแง ให้โยน Error ออกมา
        }
  
       // 1. ดึงข้อความ (เปลี่ยนเป็น let เพื่อให้เราแอบลบรหัสลับทิ้งได้)
      let finalReply = data.candidates[0].content.parts[0].text;

      // 2. 🔍 ค้นหาว่ามีรหัสลับ [Reserve_Table_X] หรือ [จองโต๊ะ_X] ซ่อนอยู่ไหม?
      const match = finalReply.match(/\[(?:Reserve_Table|จองโต๊ะ)_(\d+)\]/);
      
      if (match) {
        const tableNumber = parseInt(match[1]);
        console.log(`🎯 สกัดรหัสลับสำเร็จ! จองโต๊ะเบอร์: ${tableNumber}`);
        onBookTable(tableNumber);
        
        // 3. หั่นรหัสลับทิ้งไปจากประโยคซะ! (นายท่านจะได้ไม่เห็นในจอแชท)
        finalReply = finalReply.replace(match[0], "").trim(); 
      }

      // 4. เอาข้อความที่ล้างรหัสลับแล้ว ไปโชว์และพากย์เสียง
      setMessages((prev) => [...prev, { role: "maid", text: finalReply }]);
      speakThai(finalReply);

      // 5. เช็คเปลี่ยนหน้าตาอารมณ์เหมือนเดิม
      if (finalReply.includes("เขิน")) {
        onEmotionChange("shy");
      } else if (finalReply.includes("โกรธ")) {
        onEmotionChange("angry");
      } else {
        onEmotionChange("default");
      }
  
      } catch (error: any) {
        console.error("ระบบสมองค้าง:", error);
        // ถ้าระบบพัง ให้น้อง Reina ฟ้องขึ้นหน้าจอเลย!
        const errorMsg = `เอ๋... สมองหนูเบลอไปหมดแล้วค่ะนายท่าน! (${error.message})`;
        setMessages((prev) => [...prev, { role: "maid", text: errorMsg }]);
        speakThai("ขออภัยค่ะนายท่าน ระบบมีปัญหาขัดข้อง");
      }
    };
  
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-xl transition-transform hover:scale-110"
        >
          💬
        </button>
      );
    }
  
    return (
      <div className="flex h-full flex-col rounded-2xl border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3">
          <span className="text-sm font-bold text-primary-foreground">💬 แชทกับเมดน้อย</span>
          <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
            ✕
          </button>
        </div>
  
        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-chat-user text-foreground"
                    : "bg-chat-bubble text-foreground"
                  }`}
              >
                {msg.role === "maid" && <span className="mr-1">🎀</span>}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
  
        {/* Input */}
        <div className="flex gap-2 border-t p-3">
          {!isUnlocked ? (
          // 🔒 โหมดติดล็อก: โชว์กล่องรหัสผ่าน
          <div className="flex w-full gap-2 items-center">
            <span className="text-xl">🔒</span>
            <input 
              type="password" 
              className="flex-1 px-3 py-2 border rounded-md border-red-300 focus:outline-red-500 text-sm text-black"
              placeholder="รหัสผ่านพี่เลี้ยง..."
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button 
              onClick={handleUnlock}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md font-bold text-sm"
            >
              ปลดล็อก
            </button>
          </div>
        ) : (
          // 🟢 โหมดปกติ: โชว์กล่องพิมพ์แชท (โค้ดเดิมของสหาย)
          <>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="พิมพ์ข้อความ..."
              className="rounded-full border-primary/30 text-sm"
            />
            <Button onClick={handleSend} size="sm" className="rounded-full px-4">
              ส่ง
            </Button>
          </>
        )}
        </div>
      </div>
    );
  };
  
  export default ChatWidget;
