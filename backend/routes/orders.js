const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// สร้าง order ใหม่
router.post("/", async (req, res) => {
  const { 
    first_name, last_name, phone, 
    address, district, province, zipcode,
    items, total, status 
  } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      first_name, last_name, phone,
      address, district, province, zipcode,
      items,
      total,
      status: status || "pending",
      created_at: new Date()
    }])
    .select();

  if (error) return res.status(500).json({ error });
  res.json({ message: "สร้าง order สำเร็จ", data });
});

// ดึง order ทั้งหมด (สำหรับ Admin)
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// ดึง order ตาม id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// อัพเดต status ของ order
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return res.status(500).json({ error });
  res.json({ message: "อัพเดต status สำเร็จ", data });
});

module.exports = router;