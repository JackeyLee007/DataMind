export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      {children}
    </div>
  );
}
