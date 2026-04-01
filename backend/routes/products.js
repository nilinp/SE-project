const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*");
  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.post("/", async (req, res) => {
  const { name, description, price, amount, image } = req.body;
  const { data, error } = await supabase
    .from("products")
    .insert([{ name, description, price, amount, image }]);
  if (error) return res.status(500).json({ error });
  res.json({ message: "เพิ่มสินค้าสำเร็จ", data });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, amount, image } = req.body;
  const { data, error } = await supabase
    .from("products")
    .update({ name, description, price, amount, image })
    .eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json({ message: "แก้ไขสำเร็จ", data });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json({ message: "ลบสำเร็จ" });
});

module.exports = router;