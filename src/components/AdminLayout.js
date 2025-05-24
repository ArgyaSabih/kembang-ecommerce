import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Topbar />
      <Sidebar />
      <div className="pt-20 pl-[15%] p-6 ml-6 bg-[#F5F5F5] min-h-screen">{children}</div>
    </div>
  );
}
