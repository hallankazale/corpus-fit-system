import { useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SideDrawer } from "./SideDrawer";
import { TopBar } from "./TopBar";

export function AppShell({ children, title, hideBottomNav = false }: { children: ReactNode; title?: string; hideBottomNav?: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="phone-shell">
      <TopBar title={title} onMenu={() => setDrawerOpen(true)} />
      <main className={`app-content ${hideBottomNav ? "app-content--no-nav" : ""}`}>{children}</main>
      {!hideBottomNav && <BottomNav />}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
