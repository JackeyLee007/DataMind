"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ==================== Sidebar ==================== */
function Sidebar() {
  const navItems = [
    { icon: <Database size={18} />, label: "仪表盘", href: "/dashboard", active: false },
    { icon: <Sparkles size={18} />, label: "对话", href: "/chat", active: false },
    { icon: <Database size={18} />, label: "数据源", href: "/datasources", active: false },
    { icon: <Shield size={18} />, label: "设置", href: "/settings", active: true },
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

/* ==================== Settings Section ==================== */
function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.15)] flex items-center justify-center text-[#8b5cf6]">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[0.95rem]">{title}</h3>
          <p className="text-xs text-[#6a6a82]">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </motion.div>
  );
}

/* ==================== Toggle Switch ==================== */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all ${
        checked ? "bg-[#8b5cf6]" : "bg-[rgba(255,255,255,0.1)]"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/* ==================== Main Page ==================== */
export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-screen flex bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                设置
              </h1>
              <p className="text-xs text-[#6a6a82] mt-0.5">管理你的账户和偏好设置</p>
            </div>
            <Button
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                saved
                  ? "bg-[#10b981] text-white"
                  : "bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              }`}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? "已保存" : "保存更改"}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[800px]">
          {/* Profile */}
          <SettingsSection
            icon={<User size={18} />}
            title="个人资料"
            description="更新你的个人信息和头像"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-xl text-white font-bold">
                用
              </div>
              <div>
                <button className="px-4 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-lg text-sm text-[#8b5cf6] hover:bg-[rgba(139,92,246,0.15)] transition-all">
                  更换头像
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#a0a0b8]">显示名称</Label>
                <Input
                  defaultValue="用户"
                  className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] focus:border-[rgba(139,92,246,0.3)] h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#a0a0b8]">邮箱地址</Label>
                <Input
                  defaultValue="user@example.com"
                  type="email"
                  className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] focus:border-[rgba(139,92,246,0.3)] h-10"
                />
              </div>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={<Bell size={18} />}
            title="通知设置"
            description="管理你接收通知的方式和频率"
          >
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">推送通知</div>
                <div className="text-xs text-[#6a6a82]">接收分析完成和系统更新通知</div>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">邮件报告</div>
                <div className="text-xs text-[#6a6a82]">每周接收数据分析摘要邮件</div>
              </div>
              <Toggle checked={emailReports} onChange={setEmailReports} />
            </div>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            icon={<Shield size={18} />}
            title="安全设置"
            description="保护你的账户安全"
          >
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">双重认证 (2FA)</div>
                <div className="text-xs text-[#6a6a82]">使用身份验证应用增强账户安全</div>
              </div>
              <Toggle checked={twoFactor} onChange={setTwoFactor} />
            </div>
            <div className="pt-3">
              <button className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                修改密码
              </button>
            </div>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            icon={<Palette size={18} />}
            title="外观"
            description="自定义界面主题和显示偏好"
          >
            <div className="space-y-2">
              <Label className="text-sm text-[#a0a0b8]">主题</Label>
              <div className="flex gap-3">
                <button className="flex-1 h-20 rounded-xl bg-[#0a0a0f] border-2 border-[#8b5cf6] flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#8b5cf6]" />
                  <span className="text-sm">深色</span>
                </button>
                <button className="flex-1 h-20 rounded-xl bg-[#f5f5f7] border border-[rgba(255,255,255,0.06)] flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-[#ccc]" />
                  <span className="text-sm text-[#333]">浅色</span>
                </button>
              </div>
            </div>
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}
