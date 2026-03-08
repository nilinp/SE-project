import AdminSidebar from "../../components/adminsidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </main>
  );
}