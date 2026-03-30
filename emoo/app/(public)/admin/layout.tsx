import AdminSidebar from "@/app/components/adminsidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-white">
        {children}
      </div>
    </main>
  );
}