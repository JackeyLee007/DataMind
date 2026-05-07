"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  TrendingUp,
  Activity,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/* ==================== Sidebar ==================== */
function Sidebar() {
  const navItems = [
    { icon: <BarChart3 size={18} />, label: "概览", href: "/admin", active: true },
    { icon: <Users size={18} />, label: "用户管理", href: "/admin/users", active: false },
    { icon: <CreditCard size={18} />, label: "订阅管理", href: "/admin/billing", active: false },
    { icon: <Server size={18} />, label: "系统状态", href: "/admin/system", active: false },
  ];

  return (
    <aside className="w-[220px] bg-[#111118] border-r border-[rgba(255,255,255,0.06)] flex flex-col">
      <div className="p-5">
        <a href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]">
            <Sparkles size={16} />
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)]">DataMind</span>
        </a>
        <div className="mt-2 px-1">
          <span className="text-[10px] text-[#6a6a82] uppercase tracking-wider">管理后台</span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="text-xs text-[#6a6a82] uppercase tracking-[0.08em] font-semibold px-3 mb-2 mt-2">
          管理
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  item.active
                    ? "bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] font-medium border border-[rgba(139,92,246,0.15)]"
                    : "text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0f0f5]"
                }`}
              >
                {item.icon}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ef4444] to-[#f59e0b] flex items-center justify-center text-xs text-white font-bold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">管理员</div>
            <div className="text-xs text-[#6a6a82] truncate">admin@datamind.ai</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ==================== Stat Card ==================== */
function StatCard({
  icon,
  label,
  value,
  change,
  changeType,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 hover:border-[rgba(139,92,246,0.15)] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.15)] flex items-center justify-center text-[#8b5cf6]">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            changeType === "up"
              ? "bg-[rgba(16,185,129,0.1)] text-[#10b981]"
              : "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
          }`}
        >
          {changeType === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-[#6a6a82]">{label}</div>
    </motion.div>
  );
}

/* ==================== Recent Users ==================== */
function RecentUsers() {
  const users = [
    { name: "张明远", email: "zhang@example.com", plan: "专业版", status: "活跃", statusColor: "#10b981" },
    { name: "李思涵", email: "li@example.com", plan: "企业版", status: "活跃", statusColor: "#10b981" },
    { name: "王建国", email: "wang@example.com", plan: "免费版", status: "活跃", statusColor: "#10b981" },
    { name: "陈雨薇", email: "chen@example.com", plan: "专业版", status: "离线", statusColor: "#6a6a82" },
    { name: "刘志强", email: "liu@example.com", plan: "企业版", status: "活跃", statusColor: "#10b981" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[0.95rem]">最近注册用户</h3>
        <a href="/admin/users" className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
          查看全部
        </a>
      </div>
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.email}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-xs text-white font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-[#6a6a82] truncate">{user.email}</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] rounded-full">
              {user.plan}
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: user.statusColor }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== Revenue Chart ==================== */
function RevenueChart() {
  const data = [
    { month: "1月", value: 28 },
    { month: "2月", value: 35 },
    { month: "3月", value: 42 },
    { month: "4月", value: 38 },
    { month: "5月", value: 55 },
    { month: "6月", value: 62 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[0.95rem]">月度收入</h3>
        <span className="text-xs text-[#6a6a82]">单位：万元</span>
      </div>
      <div className="flex items-end gap-4 h-[160px]">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative">
              <div
                className="w-full rounded-t bg-gradient-to-t from-[rgba(139,92,246,0.6)] to-[rgba(59,130,246,0.3)] transition-all"
                style={{ height: `${d.value * 2.2}px` }}
              />
            </div>
            <span className="text-[10px] text-[#6a6a82]">{d.month}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== System Status ==================== */
function SystemStatus() {
  const services = [
    { name: "API 服务", status: "正常", uptime: "99.99%", color: "#10b981" },
    { name: "数据库", status: "正常", uptime: "99.95%", color: "#10b981" },
    { name: "AI 引擎", status: "正常", uptime: "99.90%", color: "#10b981" },
    { name: "文件存储", status: "警告", uptime: "98.50%", color: "#f59e0b" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[0.95rem]">系统状态</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-xs text-[#10b981]">运行中</span>
        </div>
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: service.color }} />
              <span className="text-sm">{service.name}</span>
            </div>
            <div className="text-xs text-[#6a6a82]">
              {service.status} · {service.uptime}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== Main Page ==================== */
export default function AdminPage() {
  return (
    <>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                管理概览
              </h1>
              <p className="text-xs text-[#6a6a82] mt-0.5">监控平台运营数据和系统状态</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-full">
              <Shield size={14} className="text-[#10b981]" />
              <span className="text-xs text-[#10b981] font-medium">管理员模式</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[1200px]">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={<Users size={18} />}
              label="总用户数"
              value="12,458"
              change="+8.2%"
              changeType="up"
              delay={0}
            />
            <StatCard
              icon={<CreditCard size={18} />}
              label="月收入"
              value="¥42.6万"
              change="+12.5%"
              changeType="up"
              delay={0.1}
            />
            <StatCard
              icon={<Activity size={18} />}
              label="活跃会话"
              value="1,284"
              change="+5.3%"
              changeType="up"
              delay={0.2}
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="转化率"
              value="18.6%"
              change="-2.1%"
              changeType="down"
              delay={0.3}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <RecentUsers />
            </div>
            <div className="space-y-5">
              <SystemStatus />
            </div>
          </div>

          <div className="mt-5">
            <RevenueChart />
          </div>
        </div>
      </main>
    </>
  );
}
