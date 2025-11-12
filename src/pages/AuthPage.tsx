import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  storeName: z.string().min(2, { message: 'Store name is required.' }),
});
export function AuthPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const registerArtisan = useAuthStore((s) => s.register);
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  const onLogin = (data: z.infer<typeof loginSchema>) => {
    const user = login(data.email);
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/artisan');
      }
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };
  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerArtisan({ name: data.name, email: data.email, role: 'artisan' });
    toast.success('Registration successful! Your application is pending review.');
    // In a real app, you might redirect or show a success message.
    // For now, we'll just stay on the page.
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 flex items-center justify-center">
          <Tabs defaultValue="login" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Access your Artisan or Admin dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="admin@warisan.digital" {...registerLogin('email')} />
                      {loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" {...registerLogin('password')} defaultValue="password" />
                      {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent/90">Login</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register as Artisan</CardTitle>
                  <CardDescription>Join our community of verified artisans.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input id="register-name" {...registerRegister('name')} />
                      {registerErrors.name && <p className="text-sm text-destructive">{registerErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" type="email" {...registerRegister('email')} />
                      {registerErrors.email && <p className="text-sm text-destructive">{registerErrors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-store">Store Name</Label>
                      <Input id="register-store" {...registerRegister('storeName')} />
                      {registerErrors.storeName && <p className="text-sm text-destructive">{registerErrors.storeName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input id="register-password" type="password" {...registerRegister('password')} />
                      {registerErrors.password && <p className="text-sm text-destructive">{registerErrors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent/90">Register</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}