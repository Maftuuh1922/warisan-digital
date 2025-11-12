import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// A simple Batik-inspired icon component
const BatikIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#3E2723" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D4AF37" fillOpacity="0.3"/>
  </svg>
);
export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { name: 'Galeri', href: '/galeri' },
    { name: 'Analisis AI', href: '/analisis-ai' },
    { name: 'Scan QR', href: '/scan-qr' },
  ];
  const NavItems = ({ isMobile = false }) => (
    <>
      {navLinks.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              'font-medium text-foreground/80 transition-colors hover:text-foreground relative group',
              isActive && 'text-foreground',
              isMobile ? 'block py-2 text-lg' : 'text-base'
            )
          }
        >
          <span>{item.name}</span>
          <span className={cn(
            'absolute bottom-0 left-0 h-0.5 bg-brand-accent w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out',
            isMobile ? 'hidden' : 'block'
          )} />
        </NavLink>
      ))}
    </>
  );
  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-foreground">
              <BatikIcon />
              <span>BatikIn</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-10">
            <NavItems />
          </nav>
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" asChild><Link to="/auth">Login</Link></Button>
            <Button asChild className="rounded-xl"><Link to="/auth">Daftar</Link></Button>
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-20 inset-x-0 bg-card p-4 border-b"
          >
            <nav className="flex flex-col space-y-4">
              <NavItems isMobile />
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" asChild><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Login</Link></Button>
                <Button asChild className="rounded-xl"><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Daftar</Link></Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}