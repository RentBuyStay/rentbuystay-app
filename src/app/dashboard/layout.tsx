import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";

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
