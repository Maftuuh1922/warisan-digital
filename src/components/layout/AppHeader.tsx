import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Feather, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinks = [
    { name: 'Gallery', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Artisans', href: '/artisans' },
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
              'font-medium transition-colors hover:text-brand-accent',
              isActive ? 'text-brand-accent' : 'text-foreground/80',
              isMobile ? 'block py-2 text-lg' : 'text-sm'
            )
          }
        >
          {item.name}
        </NavLink>
      ))}
    </>
  );
  const dashboardPath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/artisan';
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Feather className="h-6 w-6 text-brand-accent" />
              <span>Warisan Digital</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <NavItems />
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to={dashboardPath}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button onClick={handleLogout} className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/auth">Login</Link></Button>
                <Button asChild className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground"><Link to="/auth">Register</Link></Button>
              </>
            )}
            <ThemeToggle className="relative top-0 right-0" />
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggle className="relative top-0 right-0 mr-2" />
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background p-4 border-b"
          >
            <nav className="flex flex-col space-y-4">
              <NavItems isMobile />
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" asChild><Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></Button>
                    <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground">Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Login</Link></Button>
                    <Button asChild className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground"><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Register</Link></Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}