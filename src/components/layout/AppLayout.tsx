import React from "react";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}