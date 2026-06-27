export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Super clean wrapper, biarkan page.tsx yang ngatur semua UI dan Navigasinya
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <main className="min-h-screen relative overflow-hidden">{children}</main>
    </div>
  );
}
