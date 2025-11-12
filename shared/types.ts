export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  role: 'artisan' | 'admin';
  status: 'pending' | 'verified' | 'rejected';
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