import type { Batik, User, PengrajinDetails } from '@shared/types';
export const MOCK_USERS: User[] = [
  { id: 'admin1', name: 'Admin Utama', email: 'admin@warisan.digital', role: 'admin', status: 'verified' },
  { id: 'a1', name: 'Ibu Wati', email: 'wati@batik.com', role: 'artisan', status: 'verified' },
  { id: 'a2', name: 'Bapak Joko', email: 'joko@batik.com', role: 'artisan', status: 'verified' },
  { id: 'a3', name: 'Sanggar Lestari', email: 'lestari@batik.com', role: 'artisan', status: 'pending' },
  { id: 'a4', name: 'Galeri Indah', email: 'indah@batik.com', role: 'artisan', status: 'rejected' },
];
export const MOCK_PENGRAJIN_DETAILS: PengrajinDetails[] = [
  { id: 'a1', userId: 'a1', storeName: 'Batik Wati Solo', address: 'Jl. Slamet Riyadi No. 1, Solo', phoneNumber: '081234567890', qualificationDocumentUrl: '/docs/doc1.pdf' },
  { id: 'a2', userId: 'a2', storeName: 'Joko Batik Pekalongan', address: 'Jl. Pesisir No. 10, Pekalongan', phoneNumber: '081234567891', qualificationDocumentUrl: '/docs/doc2.pdf' },
  { id: 'a3', userId: 'a3', storeName: 'Sanggar Lestari Yogyakarta', address: 'Jl. Malioboro No. 5, Yogyakarta', phoneNumber: '081234567892', qualificationDocumentUrl: '/docs/doc3.pdf' },
  { id: 'a4', userId: 'a4', storeName: 'Galeri Indah Cirebon', address: 'Jl. Trusmi No. 8, Cirebon', phoneNumber: '081234567893', qualificationDocumentUrl: '/docs/doc4.pdf' },
];
export const MOCK_BATIK_DATA: Batik[] = [
  {
    id: 'b1',
    name: 'Batik Parang Kusumo',
    motif: 'Parang',
    history: 'Motif Parang adalah salah satu motif batik tertua di Indonesia, melambangkan kekuasaan dan kekuatan. Kusumo berarti bunga, melambangkan kehidupan dan kesuburan. Batik ini secara tradisional dikenakan oleh para bangsawan.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-6b25251a47a3?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a1',
    artisanName: 'Ibu Wati'
  },
  {
    id: 'b2',
    name: 'Batik Mega Mendung',
    motif: 'Mega Mendung',
    history: 'Berasal dari Cirebon, motif Mega Mendung melambangkan awan pembawa hujan yang meneduhkan dan memberi kehidupan. Motif ini dipengaruhi oleh budaya Tiongkok, menunjukkan akulturasi budaya yang kaya.',
    imageUrl: 'https://images.unsplash.com/photo-1622171499333-3b28a54c1045?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a2',
    artisanName: 'Bapak Joko'
  },
  {
    id: 'b3',
    name: 'Batik Kawung',
    motif: 'Kawung',
    history: 'Motif Kawung terinspirasi dari buah aren (kolang-kaling) yang dibelah empat. Ini melambangkan kesucian, kemurnian, dan harapan agar manusia selalu ingat akan asal-usulnya.',
    imageUrl: 'https://images.unsplash.com/photo-1583312818559-69b781f75a7a?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a1',
    artisanName: 'Ibu Wati'
  },
  {
    id: 'b4',
    name: 'Batik Sidomukti',
    motif: 'Sido',
    history: 'Berasal dari kata "sido" (jadi/terlaksana) dan "mukti" (mulia dan sejahtera). Batik ini sering digunakan dalam upacara pernikahan dengan harapan agar kedua mempelai mencapai kemuliaan dan kesejahteraan.',
    imageUrl: 'https://images.unsplash.com/photo-1556741533-4020f6011031?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a3',
    artisanName: 'Sanggar Lestari'
  },
  {
    id: 'b5',
    name: 'Batik Tujuh Rupa',
    motif: 'Tujuh Rupa',
    history: 'Batik dari Pekalongan ini sangat kaya akan warna dan motif, seringkali menampilkan unsur alam seperti hewan dan tumbuhan. Motif ini melambangkan kekayaan budaya pesisir yang dinamis dan adaptif.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a2',
    artisanName: 'Bapak Joko'
  },
  {
    id: 'b6',
    name: 'Batik Truntum',
    motif: 'Truntum',
    history: 'Motif Truntum diciptakan oleh Ratu Kencana, melambangkan cinta yang bersemi kembali. Bentuknya seperti kuntum atau bintang di langit, menjadi simbol cinta yang tulus, abadi, dan semakin berkembang.',
    imageUrl: 'https://images.unsplash.com/photo-1604537449193-0a9d8a34a5d8?q=80&w=800&auto=format&fit=crop',
    artisanId: 'a3',
    artisanName: 'Sanggar Lestari'
  }
];