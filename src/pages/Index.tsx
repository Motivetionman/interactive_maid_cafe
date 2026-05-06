import { useState } from "react";
import EntryScreen from "@/components/EntryScreen";
import MainScreen from "@/components/MainScreen";
import BgmPlayer from "@/components/BgmPlayer";
import { supabase } from "@/lib/supabase";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  const [entered, setEntered] = useState(false);
  // ฟังก์ชันให้น้องเมดใช้จองโต๊ะ
  

  if (!entered) {
    return <EntryScreen onEnter={() => setEntered(true)} />;
  }
  
  return (
    <>
      <BgmPlayer />
      <MainScreen />
      
      
   
    </>
  );
};

export default Index;
