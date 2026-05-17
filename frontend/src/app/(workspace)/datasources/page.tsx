"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Database,
  FileSpreadsheet,
  FileText,
  Upload,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

/* ==================== Sidebar ==================== */
function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Database size={18} />, label: "仪表盘", href: "/dashboard", active: false },
    { icon: <Sparkles size={18} />, label: "对话", href: "/chat", active: false },
    { icon: <FileSpreadsheet size={18} />, label: "数据源", href: "/datasources", active: true },
    { icon: <FileText size={18} />, label: "报告", href: "/reports", active: false },
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

/* ==================== Datasource Card ==================== */
function DatasourceCard({
  datasource,
  onDelete,
}: {
  datasource: any;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const typeIcons: Record<string, any> = {
    EXCEL: <FileSpreadsheet size={20} className="text-[#10b981]" />,
    CSV: <FileText size={20} className="text-[#3b82f6]" />,
    PDF: <FileText size={20} className="text-[#ef4444]" />,
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-[rgba(139,92,246,0.15)] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.15)] flex items-center justify-center">
          {typeIcons[datasource.type] || <Database size={20} className="text-[#8b5cf6]" />}
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
                  window.location.href = `/datasources/${datasource.id}`;
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#f0f0f5] flex items-center gap-2"
              >
                <Eye size={14} /> 查看
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(datasource.id);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] flex items-center gap-2"
              >
                <Trash2 size={14} /> 删除
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-medium text-sm mb-1 truncate">{datasource.name}</h3>
      <div className="text-xs text-[#6a6a82] mb-3">
        {datasource.type} · {datasource.rowCount || 0} 行 · {formatSize(datasource.fileSize || 0)}
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            datasource.status === "ACTIVE"
              ? "bg-[rgba(16,185,129,0.1)] text-[#10b981]"
              : "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"
          }`}
        >
          {datasource.status === "ACTIVE" ? "可用" : "处理中"}
        </span>
      </div>
    </motion.div>
  );
}

/* ==================== Main Page ==================== */
export default function DatasourcesPage() {
  const { user } = useAuth();
  const [datasources, setDatasources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "用户";

  useEffect(() => {
    fetchDatasources();
  }, []);

  const fetchDatasources = async () => {
    try {
      const result = await api.get<any>("/api/datasources");
      if (result.data) {
        setDatasources(result.data.data || []);
      }
    } catch (error) {
      console.error("Fetch datasources error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("datamind_token");
      const res = await fetch("/api/datasources/upload", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (res.ok) {
        fetchDatasources();
      } else {
        const data = await res.json();
        alert(data.error || "上传失败");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个数据源吗？")) return;

    try {
      await api.delete(`/api/datasources/${id}`);
      setDatasources(datasources.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败");
    }
  };

  const filteredDatasources = datasources.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                数据源
              </h1>
              <p className="text-xs text-[#6a6a82] mt-0.5">管理你的数据文件和数据库连接</p>
            </div>
            <label className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer">
              <Upload size={16} />
              {isUploading ? "上传中..." : "上传文件"}
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[1200px]">
          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a82]" />
            <input
              type="text"
              placeholder="搜索数据源..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#e8e8f0] placeholder-[#6a6a82] focus:outline-none focus:border-[rgba(139,92,246,0.3)] transition-all"
            />
          </div>

          {/* Datasource Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]" />
            </div>
          ) : filteredDatasources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#6a6a82]">
              <Database size={48} className="mb-4 opacity-30" />
              <p className="text-sm">暂无数据源</p>
              <p className="text-xs mt-1">点击右上角上传文件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDatasources.map((datasource) => (
                <DatasourceCard
                  key={datasource.id}
                  datasource={datasource}
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
