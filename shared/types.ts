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
  id: string; // Required for IndexedEntity
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
  origin: string;
  history: string;
  imageUrl: string;
  artisanId: string;
  artisanName: string;
}
// New types for ML Analysis Result
export interface MLPrediction {
  motif: string;
  confidence: number; // e.g., 0.95
  class_id: number;
}
export interface Philosophy {
  description: string;
  historical_context: string;
}
export interface Authenticity {
  label: 'Authentic' | 'Likely Authentic' | 'Indeterminate' | 'Likely Counterfeit';
  confidence: number;
  features_analyzed: string[];
}
export interface MLAnalysisResult {
  top_prediction: MLPrediction;
  other_predictions: MLPrediction[];
  pattern_type: 'Geometric' | 'Non-Geometric' | 'Indeterminate';
  philosophy: Philosophy;
  authenticity: Authenticity;
}