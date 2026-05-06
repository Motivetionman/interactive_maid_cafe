
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // 👈 ดึงสมุดจดเข้ามา! (เช็คโฟลเดอร์ให้ตรงด้วยนะ)

interface Table {
  id: number;
  name: string;
  booked: boolean;
}

//const initialTables: Table[] = [
  //{ id: 1, name: "โต๊ะ 1 🍰", booked: false },
  //{ id: 2, name: "โต๊ะ 2 🧁", booked: false },
  //{ id: 3, name: "โต๊ะ 3 🍡", booked: false },
  //{ id: 4, name: "โต๊ะ 4 ☕", booked: false },
  //{ id: 5, name: "โต๊ะ 5 🍮", booked: false },
  //{ id: 6, name: "โต๊ะ 6 🎂", booked: false },
  //{ id: 7, name: "โต๊ะ 7 🍩", booked: false },
  //{ id: 8, name: "โต๊ะ 8 🍪", booked: false },
//];

const TableGrid = () => {
  // 1. สร้างตารางเปล่าๆ มารอรับข้อมูล
  const [tables, setTables] = useState<any[]>([]);

  // 2. ฟังก์ชันดึงข้อมูลโต๊ะจากฐานข้อมูล
  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .order('table_number', { ascending: true }); // เรียงตามเบอร์โต๊ะ

    if (error) console.error("พังแล้วแชท ดึงโต๊ะไม่ได้:", error);
    else setTables(data || []);
  };

  // ฟังก์ชันสลับสถานะการจองโต๊ะ
  // ฟังก์ชันจัดการการจองและยกเลิกโต๊ะ
  const toggleBooking = async (table: any) => {
    
    // 🟢 กรณีที่ 1: โต๊ะว่าง -> ทำการจอง
    if (table.status === 'vacant') {
      const customerName = window.prompt(`กำลังจองโต๊ะ ${table.table_number}\nกรุณาใส่ชื่อนายท่าน/คุณหนู:`);
      if (!customerName) return; // ถ้ายกเลิกหรือไม่ใส่ชื่อ ให้หยุดทำงาน

      const customerPhone = window.prompt(`กรุณาใส่เบอร์โทรศัพท์ (เพื่อใช้ยกเลิกการจอง):`);
      if (!customerPhone) return;

      // ส่งข้อมูลขึ้น Supabase
      const { error } = await supabase
        .from('cafe_tables')
        .update({ 
          status: 'occupied', 
          customer_name: customerName, 
          customer_phone: customerPhone 
        })
        .eq('id', table.id); // อัปเดตเฉพาะโต๊ะที่กด

      if (error) {
        console.error("จองไม่สำเร็จ:", error);
        window.alert("เกิดข้อผิดพลาดในการจอง แชทขอโทษด้วยครับ!");
      }
    } 
    
    // 🔴 กรณีที่ 2: โต๊ะมีคนจองแล้ว -> ทำการยกเลิก
    else if (table.status === 'occupied') {
      const phoneConfirm = window.prompt(
        `โต๊ะ ${table.table_number} ถูกจองโดย ${table.customer_name}\nหากต้องการยกเลิก กรุณาใส่เบอร์โทรศัพท์ที่ใช้จอง:`
      );

      // ถ้ากด Cancel ใน prompt จะได้ค่า null ก็ไม่ต้องทำอะไร
      if (phoneConfirm === null) return; 

      // เช็คว่าเบอร์ตรงกับในฐานข้อมูลไหม
      if (phoneConfirm === table.customer_phone) {
        // ถ้าตรง ให้ล้างข้อมูลโต๊ะเป็นโต๊ะว่าง
        const { error } = await supabase
          .from('cafe_tables')
          .update({ 
            status: 'vacant', 
            customer_name: null, 
            customer_phone: null 
          })
          .eq('id', table.id);

        if (error) window.alert("ระบบมีปัญหา ยกเลิกไม่ได้ครับ!");
        else window.alert("ยกเลิกโต๊ะเรียบร้อยแล้วค่ะนายท่าน!");
      } else {
        window.alert("❌ เบอร์โทรศัพท์ไม่ถูกต้อง! น้อง Reina ไม่ยอมให้ยกเลิกหรอกนะ!");
      }
    }
  };

  // 3. เริ่มดึงข้อมูล และตั้งเสารับสัญญาณ (Realtime)
  useEffect(() => {
    fetchTables(); // ดึงข้อมูลก้อนแรกก่อน

    // ตั้งเสาสัญญาณ: ถ้าตาราง 'cafe_tables' มีการเปลี่ยนแปลง ให้โหลดข้อมูลใหม่ทันที
    const subscription = supabase
      .channel('table-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cafe_tables' }, () => {
        fetchTables();
      })
      .subscribe();

    // ตอนลูกค้าเดินออกจากร้าน (ปิดเว็บ) ก็รื้อเสาสัญญาณทิ้งด้วย
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="flex h-full flex-col p-6 min-h-screen bg-cover bg-center bg-fixed" 
     style={{ backgroundImage: "url('/cafe_bg.png')" }}>
 
      <h2 className="mb-1 text-2xl font-bold text-primary">🪑 จองโต๊ะ</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        กดเลือกโต๊ะที่ต้องการจองนะคะ~
      </p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tables.map((table) => (
          <button
            key={table.id}
          onClick={() => toggleBooking(table)} // 👈 ส่งข้อมูลโต๊ะไปทั้งก้อนเลย จะได้ใช้ประโยชน์ง่ายๆ
          className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 text-center shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            table.status === 'occupied' 
              ? "border-table-booked bg-table-booked/20 text-table-booked cursor-not-allowed" // โต๊ะแดง กดไม่ได้
              : "border-table-available bg-table-available/20 text-table-available" // โต๊ะเขียว กดได้
          }`}
          
        >
          {/* รูปไฟสถานะ */}
          <span className="mb-1 text-3xl">{table.status === 'occupied' ? "🔴" : "🟢"}</span>
          
          {/* เบอร์โต๊ะ */}
          <span className="text-sm font-semibold text-foreground">โต๊ะ {table.table_number}</span>
          
          {/* สถานะ (ถ้าจองแล้ว โชว์ชื่อคนจองด้วย!) */}
          <span className={`mt-1 text-xs font-medium ${table.status === 'occupied' ? "text-table-booked" : "text-table-available"}`}>
            {table.status === 'occupied' ? `จองโดย: ${table.customer_name || 'ไม่ระบุชื่อ'}` : "ว่าง"}
          </span>
        </button>
        ))}
      </div>
    </div>
  );
};

export default TableGrid;
