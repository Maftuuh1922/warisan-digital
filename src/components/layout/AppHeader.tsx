import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            <Button variant="ghost">Login</Button>
            <Button className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground">Register</Button>
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
                <Button variant="outline">Login</Button>
                <Button className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground">Register</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}