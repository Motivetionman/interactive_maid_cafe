export type Emotion = "default" | "shy" | "angry" | "crying";

const emotionImages: Record<Emotion, string> = {
  default: "default.png",
  shy: "shy.png",
  angry: "angry.png",
  crying: "cry.png",
};

const emotionLabel: Record<Emotion, string> = {
  default: "😊 ยิ้มหวาน~",
  shy: "😳 เขินจัง~",
  angry: "😤 โกรธแล้วนะ!",
  crying: "😢 หนูจะร้องนะ...",
};

// สมุดจับคู่อารมณ์กับท่าทางการขยับ
const emotionAnimations: Record<Emotion, string> = {
  default: "animate-breathe", // ปกติให้หายใจ
  shy: "animate-shy",         // เขินให้บิดตัว
  angry: "animate-shake",     // โกรธให้สั่น
  crying: "animate-sob",      // ร้องไห้ให้หงอย
};

interface MaidDisplayProps {
  emotion: Emotion;
  activeMaid: string; // 👈 🔴 เพิ่มบรรทัดนี้!
}

const MaidDisplay = ({ emotion, activeMaid }: MaidDisplayProps) => {
const getImagePath = () => {
    const maidName = activeMaid.toLowerCase(); // แปลงเป็นตัวพิมพ์เล็ก (reina, yume)
    const emotionName = emotion.toLowerCase(); // (default, shy, angry)
    
    return `/${maidName}-${emotionName}.png`; 
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <img
         src={getImagePath()}
         alt={`Maid - ${emotion}`}
         className={`h-64 w-auto rounded-3xl border-4 border-primary/30 shadow-xl transition-all duration-500 lg:h-80 ${emotionAnimations[emotion]}`}
         onError={(e) => {
            e.currentTarget.src = `/${activeMaid.toLowerCase()}-default.png`;
          }}
/>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card px-4 py-1 text-sm font-semibold text-primary shadow-md">
          {emotionLabel[emotion]}
        </div>
      </div>
    </div>
  );
};

export default MaidDisplay;
