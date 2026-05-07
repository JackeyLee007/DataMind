export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.08)] via-transparent to-[rgba(59,130,246,0.06)]" />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 top-[-150px] right-[-150px]"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-30 bottom-[-100px] left-[-100px]"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] px-6">
        {children}
      </div>
    </div>
  );
}
