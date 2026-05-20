import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";

// Property Owner dashboard layout — sticky sidebar (272px, #305E82) + topbar over scrollable content.
// Mirrors Figma 341:16016 (Desktop-16): sidebar 272x1024 + content area at x:312 w:1088 (40px gap, 40px right margin).
// Browser layout uses flex so the content fills whatever space is left.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white" style={{ minHeight: "100vh" }}>
      <DashboardSidebar />
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
        <DashboardTopbar />
        <main style={{ padding: "32px 40px", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
