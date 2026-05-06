import { useState, useRef, useEffect } from "react";

// 💿 1. สร้าง Playlist ของนายท่าน (ใส่ชื่อไฟล์ที่มีในโฟลเดอร์ public ได้เลย)
const playlist = [
  "/renai-circulation.mp3",
  "/eva.mp3",
  "/answer.mp3", 
  "/silky-heart.mp3", // 👈 ไปหาโหลดมาเพิ่มแล้วเปลี่ยนชื่อตรงนี้นะ
  "/hakone-hakoiri-musume.mp3",
  "/bon-appetit-s.mp3",
  "/daydream-cafe.mp3",
  "/little-mischief.mp3",
  "/world-is-mine.mp3",
  "/popipo.mp3",
  // 👈 ถ้ามีอีกก็ใส่ลูกน้ำ (,) ต่อลงมาได้เรื่อยๆ
];

const BgmPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0); // ตัวแปรจำว่าตอนนี้เล่นเพลงที่เท่าไหร่
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ฟังก์ชันกดปุ่ม Play / Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // ฟังก์ชันกดเปลี่ยนเพลง (Next Track)
  const nextTrack = () => {
    // เอาลำดับเพลงปัจจุบัน +1 ถ้าถึงเพลงสุดท้ายแล้ว ให้ม้วนกลับมาเพลงแรก (index 0)
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  // เวทมนตร์: ถ้ามีการเปลี่ยนเพลง แล้วสถานะเดิมคือ "กำลังเล่นอยู่" ให้มันเล่นเพลงใหม่ต่อทันที
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05; // หรี่เสียงไว้ที่ 5% จะได้ไม่กวนเสียงเมด
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-3">
      {/* แท็กซ่อนเครื่องเล่นเสียง */}
      <audio 
        ref={audioRef} 
        src={playlist[currentTrack]} 
        autoPlay 
        onEnded={nextTrack}
        
      />
      
      {/* 🎵 ปุ่มเปิด-ปิดเพลง */}
      <button
        onClick={togglePlay}
        className={`flex h-12 w-12 items-center justify-center rounded-full border-4 shadow-lg transition-all duration-300 hover:scale-110 ${
          isPlaying ? "border-pink-400 bg-pink-100 text-pink-600" : "border-gray-300 bg-gray-100 text-gray-400"
        }`}
        title="เล่น/หยุดเพลง"
      >
        <span className="text-2xl">{isPlaying ? "🎵" : "🔇"}</span>
      </button>

      {/* ⏭️ ปุ่ม Next Track */}
      <button
        onClick={nextTrack}
        className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-indigo-300 bg-indigo-100 text-indigo-600 shadow-lg transition-all duration-300 hover:scale-110"
        title="เพลงถัดไป"
      >
        <span className="text-2xl">⏭️</span>
      </button>
    </div>
  );
};

export default BgmPlayer;