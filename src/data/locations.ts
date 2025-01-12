export type Location = {
  name: string;
  description: string;
  roles: string[];
  category: 'education' | 'entertainment' | 'business' | 'public' | 'transportation';
};

export const locations: Location[] = [
  {
    name: 'โรงเรียน',
    description: 'สถานที่ให้การศึกษา',
    category: 'education',
    roles: ['ครู', 'นักเรียน', 'ภารโรง', 'ผู้อำนวยการ', 'แม่ครัว', 'พยาบาล']
  },
  {
    name: 'โรงพยาบาล',
    description: 'สถานพยาบาล',
    category: 'public',
    roles: ['หมอ', 'พยาบาล', 'คนไข้', 'เภสัชกร', 'ผู้อำนวยการ', 'พนักงานทำความสะอาด']
  },
  {
    name: 'ร้านอาหาร',
    description: 'ร้านอาหารทั่วไป',
    category: 'business',
    roles: ['พ่อครัว', 'บริกร', 'แคชเชียร์', 'ลูกค้า', 'เจ้าของร้าน', 'พนักงานล้างจาน']
  },
  {
    name: 'ห้างสรรพสินค้า',
    description: 'ศูนย์การค้าขนาดใหญ่',
    category: 'business',
    roles: ['พนักงานขาย', 'ลูกค้า', 'รปภ.', 'แม่บ้าน', 'ผู้จัดการ', 'พนักงานแคชเชียร์']
  },
  {
    name: 'สถานีตำรวจ',
    description: 'สถานที่ทำการของตำรวจ',
    category: 'public',
    roles: ['ตำรวจ', 'นักสืบ', 'ผู้ต้องหา', 'ทนาย', 'พนักงานธุรการ', 'ผู้กำกับ']
  },
  {
    name: 'สนามบิน',
    description: 'ท่าอากาศยาน',
    category: 'transportation',
    roles: ['นักบิน', 'แอร์โฮสเตส', 'ผู้โดยสาร', 'พนักงานเช็คอิน', 'รปภ.', 'พนักงานขนกระเป๋า']
  },
  {
    name: 'ชายหาด',
    description: 'สถานที่พักผ่อนริมทะเล',
    category: 'entertainment',
    roles: ['นักท่องเที่ยว', 'คนให้เช่าเตียง', 'หน่วยกู้ภัย', 'พ่อค้าแม่ค้า', 'ช่างภาพ', 'มัคคุเทศก์']
  },
  {
    name: 'โรงแรม',
    description: 'สถานที่พักแรม',
    category: 'business',
    roles: ['พนักงานต้อนรับ', 'แม่บ้าน', 'เชฟ', 'ลูกค้า', 'ผู้จัดการ', 'พนักงานยกกระเป๋า']
  },
  {
    name: 'มหาวิทยาลัย',
    description: 'สถาบันการศึกษาระดับอุดมศึกษา',
    category: 'education',
    roles: ['อาจารย์', 'นักศึกษา', 'เจ้าหน้าที่', 'คนขายอาหาร', 'บรรณารักษ์', 'นักการภารโรง']
  },
  {
    name: 'สวนสนุก',
    description: 'สถานที่พักผ่อนและความบันเทิง',
    category: 'entertainment',
    roles: ['พนักงานขายตั๋ว', 'ช่างเทคนิค', 'พนักงานขายของที่ระลึก', 'นักท่องเที่ยว', 'มาสคอต', 'เจ้าหน้าที่รักษาความปลอดภัย']
  },
  {
    name: 'ซูเปอร์มาร์เก็ต',
    description: 'ร้านค้าปลีกขนาดใหญ่',
    category: 'business',
    roles: ['พนักงานแคชเชียร์', 'พนักงานจัดของ', 'ผู้จัดการ', 'ลูกค้า', 'พนักงานรักษาความปลอดภัย', 'พนักงานทำความสะอาด']
  },
  {
    name: 'สถานีรถไฟ',
    description: 'สถานีขนส่งทางราง',
    category: 'transportation',
    roles: ['พนักงานขายตั๋ว', 'พนักงานรถไฟ', 'ผู้โดยสาร', 'พ่อค้าแม่ค้า', 'พนักงานทำความสะอาด', 'เจ้าหน้าที่รักษาความปลอดภัย']
  },
  {
    name: 'โรงภาพยนตร์',
    description: 'สถานที่ฉายภาพยนตร์',
    category: 'entertainment',
    roles: ['พนักงานขายตั๋ว', 'พนักงานขายป๊อปคอร์น', 'ผู้ชม', 'ช่างเทคนิค', 'พนักงานฉีกตั๋ว', 'แม่บ้าน']
  },
  {
    name: 'ร้านเสริมสวย',
    description: 'สถานเสริมความงาม',
    category: 'business',
    roles: ['ช่างทำผม', 'ช่างเล็บ', 'แคชเชียร์', 'ลูกค้า', 'ผู้จัดการ', 'พนักงานสระผม']
  },
  {
    name: 'สถานีดับเพลิง',
    description: 'หน่วยดับเพลิง',
    category: 'public',
    roles: ['นักดับเพลิง', 'พนักงานขับรถ', 'หัวหน้าหน่วย', 'เจ้าหน้าที่วิทยุ', 'ช่างซ่อมบำรุง', 'พยาบาล']
  },
  {
    name: 'ฟิตเนส',
    description: 'ศูนย์ออกกำลังกาย',
    category: 'entertainment',
    roles: ['เทรนเนอร์', 'สมาชิก', 'พนักงานต้อนรับ', 'แม่บ้าน', 'ผู้จัดการ', 'พนักงานขายอาหารเสริม']
  },
  {
    name: 'สวนสัตว์',
    description: 'สถานที่เลี้ยงและจัดแสดงสัตว์',
    category: 'entertainment',
    roles: ['สัตวแพทย์', 'ผู้เลี้ยงสัตว์', 'มัคคุเทศก์', 'พนักงานขายตั๋ว', 'ช่างภาพ', 'พนักงานขายของที่ระลึก']
  },
  {
    name: 'ร้านกาแฟ',
    description: 'ร้านเครื่องดื่มและขนม',
    category: 'business',
    roles: ['บาริสต้า', 'พนักงานเสิร์ฟ', 'เบเกอร์', 'ลูกค้า', 'ผู้จัดการ', 'แคชเชียร์']
  },
  {
    name: 'สถานีขนส่ง',
    description: 'สถานีรถโดยสารประจำทาง',
    category: 'transportation',
    roles: ['พนักงานขายตั๋ว', 'คนขับรถ', 'ผู้โดยสาร', 'พนักงานขนกระเป๋า', 'ผู้จัดการสถานี', 'พนักงานทำความสะอาด']
  },
  {
    name: 'ตลาดนัด',
    description: 'แหล่งซื้อขายสินค้า',
    category: 'business',
    roles: ['พ่อค้า', 'แม่ค้า', 'ลูกค้า', 'คนเก็บค่าแผง', 'รปภ.', 'คนกวาดตลาด']
  },
  {
    name: 'สนามกีฬา',
    description: 'สถานที่แข่งขันกีฬา',
    category: 'entertainment',
    roles: ['นักกีฬา', 'โค้ช', 'กรรมการ', 'ผู้ชม', 'พนักงานขายของ', 'เจ้าหน้าที่สนาม']
  },
  {
    name: 'พิพิธภัณฑ์',
    description: 'สถานที่จัดแสดงศิลปะและประวัติศาสตร์',
    category: 'education',
    roles: ['ภัณฑารักษ์', 'มัคคุเทศก์', 'ผู้เข้าชม', 'พนักงานขายตั๋ว', 'นักวิจัย', 'เจ้าหน้าที่รักษาความปลอดภัย']
  },
  {
    name: 'ร้านเกม',
    description: 'ร้านให้บริการเล่นเกม',
    category: 'entertainment',
    roles: ['พนักงานเติมเงิน', 'ผู้เล่น', 'ช่างคอม', 'แม่บ้าน', 'ผู้จัดการ', 'พนักงานขายขนม']
  },
  {
    name: 'โรงงาน',
    description: 'สถานที่ผลิตสินค้า',
    category: 'business',
    roles: ['คนงาน', 'วิศวกร', 'ผู้จัดการ', 'พนักงาน QC', 'ช่างซ่อมบำรุง', 'พนักงานคลังสินค้า']
  },
  {
    name: 'สถานีวิทยุ',
    description: 'สถานีกระจายเสียง',
    category: 'entertainment',
    roles: ['ดีเจ', 'ผู้ประกาศข่าว', 'ช่างเทคนิค', 'ผู้จัดรายการ', 'พนักงานขายโฆษณา', 'เจ้าหน้าที่ธุรการ']
  },
  {
    name: 'ศูนย์การเรียนพิเศษ',
    description: 'สถาบันกวดวิชา',
    category: 'education',
    roles: ['ติวเตอร์', 'นักเรียน', 'ผู้จัดการ', 'พนักงานต้อนรับ', 'แม่บ้าน', 'พนักงานการตลาด']
  },
  {
    name: 'ท่าเรือ',
    description: 'สถานีขนส่งทางน้ำ',
    category: 'transportation',
    roles: ['กัปตันเรือ', 'ลูกเรือ', 'ผู้โดยสาร', 'พนักงานขายตั๋ว', 'คนขนของ', 'เจ้าหน้าที่รักษาความปลอดภัย']
  }
]; 