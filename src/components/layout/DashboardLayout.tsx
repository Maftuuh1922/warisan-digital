import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Users, Palette, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
const BatikIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="hsl(var(--brand-accent))" fillOpacity="0.3"/>
  </svg>
);
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const artisanLinks = [
  { href: '/dashboard/artisan', label: 'Koleksi Batik Saya', icon: Palette },
];
const adminLinks = [
  { href: '/dashboard/admin', label: 'Verifikasi Pengrajin', icon: Users },
];
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : artisanLinks;
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-2 text-xl font-display font-bold text-foreground h-20 px-4 border-b">
        <BatikIcon />
        <span>Dashboard</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            end
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted',
                isActive && 'bg-muted text-foreground font-medium'
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Button variant="ghost" className="w-full justify-start rounded-xl" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col bg-muted/40">
        <header className="flex h-20 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            {/* Header content can go here */}
          </div>
          <div className="font-medium text-sm text-muted-foreground">
            Halo, <span className="text-foreground">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 h-full w-full bg-card md:hidden"
          >
            <div className="absolute top-5 right-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent isMobile />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}