-- ========================================================
-- EMOO: REBUILD PRODUCT SYSTEM TO EXACT MATCH
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- 1. Create the simplified product table
CREATE TABLE IF NOT EXISTS public.product (
    id text PRIMARY KEY,
    name text NOT NULL,
    img text,
    details text,
    price numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Turn on Row Level Security
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Policy
CREATE POLICY "Public read products"
  ON public.product FOR SELECT
  USING (true);

-- 4. Write Policies (Public for Development / Testing)
CREATE POLICY "Admin can insert products"
  ON public.product FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update products"
  ON public.product FOR UPDATE
  USING (true);

CREATE POLICY "Admin can delete products"
  ON public.product FOR DELETE
  USING (true);

-- 5. Seed Initial Data from product.json
INSERT INTO public.product (id, name, img, details, price) VALUES
('01', 'สร้อยข้อมือจี้หินโรสควอตซ์', '/products/01.png', 'ช่วยเสริมเสน่ห์ ความเมตตาเอ็นดู ดึงดูดความรักที่ดี และช่วยเยียวยาอารมณ์ให้ความรู้สึกอ่อนโยน', 599),
('02', 'สร้อยข้อมือจี้หินมูนสโตน', '/products/02.png', 'ช่วยเสริมเสน่ห์ดึงดูดความรัก ความเมตตา และสร้างสมดุลทางอารมณ์ โดยเฉพาะพลังงานเพศหญิง', 599),
('03', 'สร้อยข้อมือจี้หินอเมทิสต์', '/products/03.png', 'ช่วยบำบัดความเครียด ทำให้นอนหลับสนิท ลดความเหนื่อยล้าทางจิตใจ และส่งเสริมสมาธิ', 599),
('04', 'สร้อยข้อมือจี้หินไหมทอง', '/products/04.png', 'ช่วยดึงดูดโชคลาภ เงินทอง และทรัพย์สิน เหมาะสำหรับนักธุรกิจและผู้ค้าขาย เสริมพลังบวก กระตุ้นความมั่นใจ และลดความเครียด', 599),
('05', 'สร้อยข้อมือจี้โอปอล', '/products/05.png', 'ช่วยเสริมเสน่ห์ ปรับสมดุลอารมณ์ และนำพาความสมหวังมาสู่ผู้สวมใส่', 599),
('06', 'สร้อยข้อมือจี้หินลาพิสลาซูลี', '/products/06.png', 'ช่วยเสริมสติปัญญา ความกล้าหาญ การสื่อสารที่ชัดเจน และช่วยอุดรูรั่วทางการเงิน', 599),
('07', 'สร้อยข้อมือจี้หยก', '/products/07.png', 'ช่วยปกป้องคุ้มครองให้ผู้สวมใส่ปลอดภัยจากสิ่งชั่วร้าย รวมถึงเสริมความเจริญก้าวหน้า สุขภาพดี และทำให้อายุยืนยาว', 599),
('08', 'สร้อยข้อมือจี้ไทเกอร์อาย', '/products/08.png', 'ช่วยเสริมอำนาจบารมี ความมั่นใจ ความกล้าหาญ พร้อมทั้งดึงดูดความมั่งคั่งและปกป้องคุ้มครองจากภยันตรายและสิ่งที่มองไม่เห็น', 599),
('09', 'สร้อยข้อมือจี้ลาบราโดไรต์', '/products/09.png', 'ช่วยเสริมสร้างความคิดสร้างสรรค์และจินตนาการ ปรับสมดุลพลังงานในร่างกาย ชำระล้างจิตใจให้ผ่องใส', 599),
('10', 'สร้อยข้อมือจี้นิลดำ', '/products/10.png', 'ช่วยสร้างความเชื่อมั่นและพลังใจที่เข้มแข็ง ปัดเป่าพลังงานลบและป้องกันคุณไสยหรือสิ่งอัปมงคล', 599),
('11', 'สร้อยข้อมือจี้เคลียร์ควอตซ์', '/products/11.png', 'ช่วยเรื่องเสริมพลังงานบวก ชำระล้างจิตใจให้สะอาดบริสุทธิ์ สามารถใช้ร่วมกับหินชนิดอื่นเพื่อเสริมส่งพลังของหินเหล่านั้นให้สูงยิ่งขึ้นได้', 599),
('12', 'สร้อยข้อมือจี้ซันสโตน', '/products/12.png', 'ช่วยปลุกพลังชีวิต ขจัดความหม่นหมองในใจ เพิ่มความมั่นใจ พร้อมดึงดูดโชคลาภและความสำเร็จมาสู่ผู้สวมใส่', 599);

-- ========================================================
-- 6. Storage Bucket for Products (Images)
-- ========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy สำหรับให้ทุกคนดูรูปภาพได้
CREATE POLICY "Public Read Image" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Policy สำหรับให้ Admin อัพโหลดรูปใหม่ได้
CREATE POLICY "Admin Insert Image" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
