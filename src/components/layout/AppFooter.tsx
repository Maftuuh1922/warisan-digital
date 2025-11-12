import { Link } from 'react-router-dom';
const BatikIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#FAF7F2" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D4AF37" fillOpacity="0.3"/>
  </svg>
);
export function AppFooter() {
  const footerLinks = {
    "About": [
      { name: "Our Mission", href: "#" },
      { name: "Team", href: "#" },
    ],
    "Fitur": [
      { name: "Galeri", href: "/galeri" },
      { name: "Analisis AI", href: "/analisis-ai" },
      { name: "Scan QR", href: "/scan-qr" },
    ],
    "Kontak": [
      { name: "Contact Us", href: "#" },
      { name: "Support", href: "#" },
    ],
  };
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold">
              <BatikIcon />
              <span>BatikIn</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Platform Digital Batik dengan Machine Learning & Modern UI.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold tracking-wider uppercase">{title}</h3>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/70">
            &copy; {new Date().getFullYear()} BatikIn. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/70 mt-4 sm:mt-0">
            Built with ��️ at Cloudflare
          </p>
        </div>
      </div>
    </footer>
  );
}