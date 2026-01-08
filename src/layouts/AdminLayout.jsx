import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen layout-bg">
      <Topbar />
      <main className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
