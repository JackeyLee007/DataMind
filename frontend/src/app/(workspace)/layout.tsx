export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      {children}
    </div>
  );
}
