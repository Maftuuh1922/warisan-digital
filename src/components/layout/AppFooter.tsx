import { Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
export function AppFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex items-center gap-2">
            <Feather className="h-7 w-7 text-brand-accent" />
            <span className="text-xl font-bold">Warisan Digital</span>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm">&copy; {new Date().getFullYear()} Warisan Digital. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Platform Otentikasi dan Promosi Budaya Batik Indonesia.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Built with ❤️ at Cloudflare
          </div>
        </div>
      </div>
    </footer>
  );
}