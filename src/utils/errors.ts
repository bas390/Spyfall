export class FirebaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

export const handleFirebaseError = (error: any): never => {
  console.error('Firebase Error:', error);
  
  if (error.code === 'permission-denied') {
    throw new FirebaseError('คุณไม่มีสิทธิ์ในการดำเนินการนี้', error.code);
  }
  
  if (error.code === 'not-found') {
    throw new FirebaseError('ไม่พบข้อมูลที่ต้องการ', error.code);
  }
  
  if (error.code === 'already-exists') {
    throw new FirebaseError('ข้อมูลนี้มีอยู่แล้ว', error.code);
  }
  
  throw new FirebaseError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Firebase', error.code);
} 