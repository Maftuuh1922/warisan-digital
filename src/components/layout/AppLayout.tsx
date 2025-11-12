import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
type AppLayoutProps = {
  children: React.ReactNode;
};
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow batik-kawung-subtle">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <AppFooter />
    </div>
  );
}