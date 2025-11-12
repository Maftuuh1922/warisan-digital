export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'artisan' | 'admin';
  status: 'pending' | 'verified' | 'rejected';
}
export interface PengrajinDetails {
  userId: string;
  storeName: string;
  address: string;
  phoneNumber: string;
  qualificationDocumentUrl: string;
}
export interface Batik {
  id: string;
  name: string;
  motif: string;
  history: string;
  imageUrl: string;
  artisanId: string;
  artisanName: string;
}