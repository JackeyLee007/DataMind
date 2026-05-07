"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  Database,
  BarChart3,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  FileText,
  Globe,
  Server,
} from "lucide-react";

/* ==================== Sidebar ==================== */
function Sidebar() {
  const navItems = [
    { icon: <BarChart3 size={18} />, label: "仪表盘", href: "/dashboard", active: true },
    { icon: <MessageSquare size={18} />, label: "对话", href: "/chat", active: false },
    { icon: <Database size={18} />, label: "数据源", href: "/datasources", active: false },
    { icon: <FileText size={18} />, label: "报告", href: "/reports", active: false },
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
      </div>

      <nav className="flex-1 px-3">
        <div className="text-xs text-[#6a6a82] uppercase tracking-[0.08em] font-semibold px-3 mb-2 mt-2">
          工作区
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-xs text-white font-bold">
            用
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">用户</div>
            <div className="text-xs text-[#6a6a82] truncate">user@example.com</div>
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
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            changeType === "up"
              ? "bg-[rgba(16,185,129,0.1)] text-[#10b981]"
              : "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
          }`}
        >
          {change}
        </span>
      </div>
      <div className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-[#6a6a82]">{label}</div>
    </motion.div>
  );
}

/* ==================== Recent Chats ==================== */
function RecentChats() {
  const chats = [
    {
      title: "Q3 销售数据分析",
      desc: "分析了过去3个月的销售趋势，发现线上渠道增长显著",
      time: "2小时前",
      icon: <TrendingUp size={16} />,
      color: "#8b5cf6",
    },
    {
      title: "用户留存率预测",
      desc: "使用 ARIMA 模型预测下季度用户留存率",
      time: "昨天",
      icon: <BarChart3 size={16} />,
      color: "#3b82f6",
    },
    {
      title: "产品库存优化",
      desc: "识别出5个滞销SKU，建议调整采购策略",
      time: "3天前",
      icon: <Database size={16} />,
      color: "#06b6d4",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[0.95rem]">最近对话</h3>
        <a
          href="/chat"
          className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors flex items-center gap-1"
        >
          查看全部 <ChevronRight size={14} />
        </a>
      </div>
      <div className="space-y-3">
        {chats.map((chat) => (
          <a
            key={chat.title}
            href="/chat"
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-all group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${chat.color}1A`, color: chat.color }}
            >
              {chat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium mb-0.5 group-hover:text-[#8b5cf6] transition-colors">
                {chat.title}
              </div>
              <div className="text-xs text-[#6a6a82] truncate">{chat.desc}</div>
            </div>
            <div className="text-xs text-[#4a4a5c] flex items-center gap-1 flex-shrink-0">
              <Clock size={12} />
              {chat.time}
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== Data Sources ==================== */
function DataSourcesList() {
  const sources = [
    { name: "销售数据 2024.xlsx", type: "Excel", size: "2.4 MB", icon: <FileSpreadsheet size={16} />, color: "#10b981" },
    { name: "用户行为日志", type: "Postgres", size: "实时", icon: <Server size={16} />, color: "#ef4444" },
    { name: "市场调研报告.pdf", type: "PDF", size: "5.1 MB", icon: <FileText size={16} />, color: "#3b82f6" },
    { name: "Google Sheets 同步", type: "Sheets", size: "实时", icon: <Globe size={16} />, color: "#f59e0b" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[0.95rem]">数据源</h3>
        <button className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
          <Plus size={14} /> 添加
        </button>
      </div>
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.name}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${source.color}1A`, color: source.color }}
            >
              {source.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{source.name}</div>
              <div className="text-xs text-[#6a6a82]">
                {source.type} · {source.size}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== Usage Chart ==================== */
function UsageChart() {
  const data = [
    { day: "周一", value: 45 },
    { day: "周二", value: 62 },
    { day: "周三", value: 55 },
    { day: "周四", value: 78 },
    { day: "周五", value: 70 },
    { day: "周六", value: 88 },
    { day: "周日", value: 95 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[0.95rem]">使用趋势</h3>
        <span className="text-xs text-[#6a6a82]">本周</span>
      </div>
      <div className="flex items-end gap-3 h-[140px]">
        {data.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative">
              <div
                className="w-full rounded-t bg-gradient-to-t from-[rgba(139,92,246,0.5)] to-[rgba(139,92,246,0.2)] transition-all"
                style={{ height: `${d.value * 1.2}px` }}
              />
            </div>
            <span className="text-[10px] text-[#6a6a82]">{d.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ==================== Main Page ==================== */
export default function DashboardPage() {
  return (
    <div className="h-screen flex bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                仪表盘
              </h1>
              <p className="text-xs text-[#6a6a82] mt-0.5">欢迎回来，查看你的数据分析概览</p>
            </div>
            <a
              href="/chat"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} />
              新建分析
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[1200px]">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={<MessageSquare size={18} />}
              label="本月对话"
              value="128"
              change="+12%"
              changeType="up"
              delay={0}
            />
            <StatCard
              icon={<Database size={18} />}
              label="数据源"
              value="12"
              change="+3"
              changeType="up"
              delay={0.1}
            />
            <StatCard
              icon={<BarChart3 size={18} />}
              label="生成图表"
              value="86"
              change="+24%"
              changeType="up"
              delay={0.2}
            />
            <StatCard
              icon={<FileText size={18} />}
              label="报告"
              value="15"
              change="+5"
              changeType="up"
              delay={0.3}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <RecentChats />
            </div>
            <div className="space-y-5">
              <DataSourcesList />
              <UsageChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
