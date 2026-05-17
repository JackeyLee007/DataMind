"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Database,
  FileSpreadsheet,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  LogOut,
  Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

/* ==================== Sidebar ==================== */
function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Database size={18} />, label: "仪表盘", href: "/dashboard", active: false },
    { icon: <Sparkles size={18} />, label: "对话", href: "/chat", active: false },
    { icon: <FileSpreadsheet size={18} />, label: "数据源", href: "/datasources", active: false },
    { icon: <FileText size={18} />, label: "报告", href: "/reports", active: true },
  ];

  const displayName = user?.name || user?.email?.split("@")[0] || "用户";
  const displayInitial = displayName.charAt(0).toUpperCase();

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
            {displayInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-[#6a6a82] truncate">{user?.email || ""}</div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="text-[#6a6a82] hover:text-[#ef4444] transition-colors"
            title="退出登录"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ==================== Report Card ==================== */
function ReportCard({
  report,
  onDelete,
}: {
  report: any;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-[rgba(139,92,246,0.15)] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.15)] flex items-center justify-center">
          <FileText size={20} className="text-[#3b82f6]" />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[#6a6a82] hover:text-[#f0f0f5] transition-colors p-1"
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-[#1e1e2e] border border-[rgba(255,255,255,0.06)] rounded-lg shadow-xl py-1 min-w-[120px] z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  window.location.href = `/reports/${report.id}`;
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0f0f5] flex items-center gap-2"
              >
                <Eye size={14} /> 查看
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  alert("导出功能开发中");
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0f0f5] flex items-center gap-2"
              >
                <Download size={14} /> 导出
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(report.id);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] flex items-center gap-2"
              >
                <Trash2 size={14} /> 删除
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-medium text-sm mb-1 truncate">{report.title}</h3>
      <div className="text-xs text-[#6a6a82] mb-3">
        {new Date(report.createdAt).toLocaleDateString("zh-CN")}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10b981]">
          已完成
        </span>
      </div>
    </motion.div>
  );
}

/* ==================== Main Page ==================== */
export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.name || user?.email?.split("@")[0] || "用户";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // TODO: 替换为实际的报告 API
      // const result = await api.get("/api/reports");
      // setReports(result.data?.data || []);
      
      // 模拟数据
      setReports([
        {
          id: "1",
          title: "2024年销售数据分析报告",
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          title: "用户行为分析报告",
          createdAt: "2024-01-10T14:20:00Z",
        },
      ]);
    } catch (error) {
      console.error("Fetch reports error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个报告吗？")) return;

    try {
      // await api.delete(`/api/reports/${id}`);
      setReports(reports.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败");
    }
  };

  const filteredReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                报告
              </h1>
              <p className="text-xs text-[#6a6a82] mt-0.5">查看和管理 AI 生成的分析报告</p>
            </div>
            <button
              onClick={() => alert("新建报告功能开发中")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              新建报告
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[1200px]">
          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a82]" />
            <input
              type="text"
              placeholder="搜索报告..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#e8e8f0] placeholder-[#6a6a82] focus:outline-none focus:border-[rgba(139,92,246,0.3)] transition-all"
            />
          </div>

          {/* Reports Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#6a6a82]">
              <FileText size={48} className="mb-4 opacity-30" />
              <p className="text-sm">暂无报告</p>
              <p className="text-xs mt-1">点击右上角新建报告</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
