import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  storeName: z.string().min(2, { message: 'Store name is required.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  phoneNumber: z.string().min(10, { message: 'Valid phone number is required.' }),
  qualificationDocumentUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});
export function AuthPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const registerArtisan = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', storeName: '', address: '', phoneNumber: '', qualificationDocumentUrl: '' },
  });
  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    const user = await login(data);
    if (user) {
      if (user.status !== 'verified') {
        toast.warning('Akun Anda belum diverifikasi. Mohon tunggu persetujuan admin.');
        useAuthStore.getState().logout();
        return;
      }
      toast.success(`Selamat datang kembali, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/artisan');
      }
    } else {
      toast.error('Email atau password salah.');
    }
  };
  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    const newUser = await registerArtisan({ ...data, id: crypto.randomUUID() });
    if (newUser) {
      toast.success('Pendaftaran berhasil! Aplikasi Anda sedang ditinjau oleh administrator.');
      registerForm.reset();
    } else {
      toast.error('Pendaftaran gagal. Email mungkin sudah digunakan.');
    }
  };
  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-10rem)] flex items-center justify-center py-16 md:py-24 bg-brand-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593941707882-6b25251a47a3?q=80&w=1800&auto=format&fit=crop')" }}
        />
        <div className="relative z-10 w-full max-w-md px-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-sm rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-[10px]">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-[10px]">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card className="rounded-2xl shadow-card border-none">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Login</CardTitle>
                  <CardDescription>Akses dashboard Pengrajin atau Admin Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField control={loginForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input className="rounded-xl" type="email" placeholder="email@anda.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={loginForm.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input className="rounded-xl" type="password" placeholder="••••••••" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card className="rounded-2xl shadow-card border-none">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Daftar sebagai Pengrajin</CardTitle>
                  <CardDescription>Bergabunglah dengan komunitas pengrajin terverifikasi kami.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField control={registerForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={registerForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input className="rounded-xl" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={registerForm.control} name="storeName" render={({ field }) => (
                        <FormItem><FormLabel>Nama Toko/Sanggar</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={registerForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Alamat Toko</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={registerForm.control} name="phoneNumber" render={({ field }) => (
                        <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={registerForm.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Password</FormLabel><FormControl><Input className="rounded-xl" type="password" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={registerForm.control} name="qualificationDocumentUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Dokumen Kualifikasi (Opsional)</FormLabel>
                          <FormControl><Input className="rounded-xl" placeholder="https://link-ke-portofolio-anda.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                        {isLoading ? 'Mendaftar...' : 'Daftar'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}