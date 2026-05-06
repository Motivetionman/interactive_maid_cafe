import { Button } from "@/components/ui/button";

interface EntryScreenProps {
  onEnter: () => void;
}

const EntryScreen = ({ onEnter }: EntryScreenProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 text-4xl animate-float" style={{ animationDelay: "0s" }}>🌸</div>
      <div className="absolute top-20 right-16 text-3xl animate-float" style={{ animationDelay: "0.5s" }}>🎀</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-float" style={{ animationDelay: "1s" }}>☕</div>
      <div className="absolute bottom-16 right-10 text-4xl animate-float" style={{ animationDelay: "1.5s" }}>🧁</div>

      <div className="text-center animate-fade-in-up">
        <div className="mb-4 text-6xl animate-wiggle">🏠</div>
        <h1 className="mb-2 text-4xl font-bold text-primary">
          ☆ Maid Café ☆
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          ยินดีต้อนรับกลับบ้านค่ะ นายท่าน~ 💕
        </p>
        <Button
          onClick={onEnter}
          size="lg"
          className="rounded-full bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
        >
          🚪 ผลักประตูเข้าร้าน
        </Button>
      </div>
    </div>
  );
};

export default EntryScreen;
