"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Mic,
  Share2,
  Download,
  Plus,
  Sparkles,
  BarChart3,
  FileText,
  Code2,
  Settings,
  ChevronRight,
} from "lucide-react";

/* ==================== Types ==================== */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: AnalysisStep[];
  chart?: ChartData;
  table?: TableData;
  code?: CodeBlock;
  insight?: InsightData;
  suggestion?: InsightData;
}

interface AnalysisStep {
  num: number;
  label: string;
  status: "done" | "running" | "pending";
  time?: string;
}

interface ChartData {
  title: string;
  bars: { label: string; value: number; color: string }[];
}

interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

interface CodeBlock {
  lang: string;
  code: string;
}

interface InsightData {
  label: string;
  text: string;
  type: "finding" | "suggestion";
}

interface DataSource {
  id: string;
  name: string;
  type: "csv" | "xlsx";
  rows: number;
  cols: number;
  size: string;
}

/* ==================== Mock Data ==================== */
const MOCK_DATA_SOURCES: DataSource[] = [
  { id: "1", name: "sales_2024_q4.csv", type: "csv", rows: 2847, cols: 12, size: "1.2 MB" },
  { id: "2", name: "products_master.xlsx", type: "xlsx", rows: 156, cols: 8, size: "340 KB" },
];

const MOCK_HISTORY = [
  { icon: <BarChart3 size={14} />, text: "月度销售趋势分析" },
  { icon: <BarChart3 size={14} />, text: "产品线对比" },
  { icon: <Sparkles size={14} />, text: "客户流失预测" },
  { icon: <FileText size={14} />, text: "Q3 vs Q4 对比报告" },
  { icon: <BarChart3 size={14} />, text: "区域销售热力图" },
  { icon: <Sparkles size={14} />, text: "利润率优化建议" },
];

const MOCK_COLUMNS = [
  { name: "order_id", type: "str", unique: 2847 },
  { name: "order_date", type: "date", range: "2024-10-01 ~ 12-31" },
  { name: "customer_id", type: "str", unique: 813 },
  { name: "product_line", type: "str", unique: "5 个类别" },
  { name: "product_name", type: "str", unique: 48 },
  { name: "region", type: "str", unique: "6 个类别" },
  { name: "quantity", type: "num", mean: 3.2 },
  { name: "unit_price", type: "num", mean: "¥1,280" },
  { name: "amount", type: "num", mean: "¥4,096" },
  { name: "cost", type: "num", mean: "¥2,840" },
  { name: "profit", type: "num", mean: "¥1,256" },
  { name: "channel", type: "str", unique: "4 个类别" },
];

const MOCK_SUGGESTED_QUESTIONS = [
  { icon: <BarChart3 size={14} />, text: "各区域销售额排名及环比变化" },
  { icon: <BarChart3 size={14} />, text: "Top 10 客户贡献了多少营收？" },
  { icon: <Sparkles size={14} />, text: "哪个销售渠道的利润率最高？" },
  { icon: <FileText size={14} />, text: "11 月和 12 月的销售趋势对比" },
];

/* ==================== TopBar ==================== */
function TopBar() {
  return (
    <header className="h-[52px] flex items-center justify-between px-5 bg-[#111118] border-b border-[rgba(255,255,255,0.06)] z-10 shrink-0">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 font-bold text-base tracking-tight">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center text-white text-sm font-bold">
            D
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)]">DataMind</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[#9898b0]">
          <span>工作台</span>
          <ChevronRight size={14} className="text-[#68687e]" />
          <span className="text-[#e8e8f0] font-medium">sales_2024_q4.csv</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#9898b0] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0] transition-all">
          <Share2 size={14} /> 分享
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#9898b0] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0] transition-all">
          <Download size={14} /> 导出
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white bg-[#6c5ce7] hover:bg-[#8b7cf7] transition-all">
          <Plus size={14} /> 新分析
        </button>
        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center text-xs font-semibold text-white cursor-pointer">
          张
        </div>
      </div>
    </header>
  );
}

/* ==================== Left Sidebar ==================== */
function LeftSidebar({ onSelectDataSource }: { onSelectDataSource: (ds: DataSource) => void }) {
  const [activeNav, setActiveNav] = useState("chat");

  const navItems = [
    { id: "chat", icon: <Sparkles size={16} />, label: "AI 对话", badge: "进行中" },
    { id: "charts", icon: <BarChart3 size={16} />, label: "图表画廊" },
    { id: "reports", icon: <FileText size={16} />, label: "分析报告" },
    { id: "code", icon: <Code2 size={16} />, label: "代码编辑器" },
    { id: "settings", icon: <Settings size={16} />, label: "数据清洗" },
  ];

  return (
    <aside className="w-[260px] bg-[#111118] border-r border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden shrink-0">
      {/* Data Sources */}
      <div className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#68687e] mb-2.5 px-1">
          数据源
        </div>
        {MOCK_DATA_SOURCES.map((ds) => (
          <div
            key={ds.id}
            onClick={() => onSelectDataSource(ds)}
            className="flex items-center gap-2.5 p-2.5 bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-xl cursor-pointer hover:border-[rgba(255,255,255,0.1)] hover:bg-[#22222e] transition-all mb-1.5"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                ds.type === "csv"
                  ? "bg-[rgba(0,214,143,0.12)] text-[#00d68f]"
                  : "bg-[rgba(84,160,255,0.12)] text-[#54a0ff]"
              }`}
            >
              {ds.type === "csv" ? "📊" : "📈"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{ds.name}</div>
              <div className="text-[11px] text-[#68687e]">
                {ds.rows.toLocaleString()} 行 · {ds.cols} 列 · {ds.size}
              </div>
            </div>
          </div>
        ))}
        <div className="border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-3.5 text-center cursor-pointer hover:border-[#6c5ce7] hover:text-[#8b7cf7] hover:bg-[rgba(108,92,231,0.08)] transition-all text-xs text-[#68687e]">
          <div className="text-lg mb-1">+</div>
          <div>上传数据或连接数据库</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-2 border-t border-[rgba(255,255,255,0.06)] pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#68687e] mb-2.5 px-1">
          导航
        </div>
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs ${
              activeNav === item.id
                ? "bg-[rgba(108,92,231,0.12)] text-[#8b7cf7]"
                : "text-[#9898b0] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0]"
            }`}
          >
            <span className="w-4 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeNav === item.id
                    ? "bg-[rgba(108,92,231,0.2)] text-[#8b7cf7]"
                    : "bg-[#22222e] text-[#68687e]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#68687e] mb-2.5 px-1">
          历史记录
        </div>
        {MOCK_HISTORY.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0] transition-all text-xs text-[#9898b0] mb-0.5"
          >
            <span className="text-[#68687e]">{h.icon}</span>
            <span className="truncate">{h.text}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ==================== Analysis Steps ==================== */
function AnalysisSteps({ steps }: { steps: AnalysisStep[] }) {
  return (
    <div className="my-2.5 space-y-1">
      {steps.map((step) => (
        <div key={step.num} className="flex items-center gap-2 py-1 text-xs">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
              step.status === "done"
                ? "bg-[rgba(0,214,143,0.12)] text-[#00d68f]"
                : step.status === "running"
                ? "bg-[rgba(255,159,67,0.12)] text-[#ff9f43] animate-pulse"
                : "bg-[rgba(108,92,231,0.12)] text-[#8b7cf7]"
            }`}
          >
            {step.status === "done" ? "✓" : step.num}
          </div>
          <span className="flex-1 text-[#9898b0]">{step.label}</span>
          {step.time && (
            <span className="text-[11px] text-[#68687e] font-[family-name:var(--font-jetbrains-mono)]">
              {step.time}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ==================== Inline Chart ==================== */
function InlineChart({ chart }: { chart: ChartData }) {
  const maxValue = Math.max(...chart.bars.map((b) => b.value));

  return (
    <div className="my-2.5 bg-[#22222e] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">{chart.title}</span>
        <div className="flex gap-1">
          {["📊", "📋", "⬇️"].map((icon, i) => (
            <button
              key={i}
              className="px-2 py-1 bg-[rgba(255,255,255,0.05)] rounded text-[11px] text-[#68687e] hover:text-[#e8e8f0] transition-colors"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2 h-[120px] pt-2">
        {chart.bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-t transition-all duration-700"
              style={{
                height: `${(bar.value / maxValue) * 100}%`,
                background: `linear-gradient(180deg, ${bar.color}, ${bar.color}80)`,
              }}
            />
            <span className="text-[10px] text-[#68687e] truncate w-full text-center">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== Inline Table ==================== */
function InlineTable({ table }: { table: TableData }) {
  return (
    <div className="my-2.5 border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden text-xs">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#22222e]">
            {table.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-[11px] font-semibold text-[#9898b0] border-b border-[rgba(255,255,255,0.06)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 text-[#9898b0] border-b border-[rgba(255,255,255,0.04)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== Code Block ==================== */
function CodeBlockComponent({ code }: { code: CodeBlock }) {
  return (
    <div className="my-2.5 bg-[#0d0d14] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#22222e] border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] text-[#68687e] font-[family-name:var(--font-jetbrains-mono)]">
          {code.lang}
        </span>
        <button className="text-[11px] text-[#68687e] hover:text-[#e8e8f0] transition-colors px-2 py-0.5 rounded hover:bg-[rgba(255,255,255,0.05)]">
          复制代码
        </button>
      </div>
      <pre className="p-3.5 text-xs leading-relaxed text-[#c8c8e0] font-[family-name:var(--font-jetbrains-mono)] overflow-x-auto">
        <code>{code.code}</code>
      </pre>
    </div>
  );
}

/* ==================== Insight Card ==================== */
function InsightCard({ insight }: { insight: InsightData }) {
  const isSuggestion = insight.type === "suggestion";
  return (
    <div
      className={`my-2.5 p-3.5 rounded-xl border ${
        isSuggestion
          ? "bg-gradient-to-br from-[rgba(0,214,143,0.08)] to-[rgba(84,160,255,0.06)] border-[rgba(0,214,143,0.2)]"
          : "bg-gradient-to-br from-[rgba(108,92,231,0.08)] to-[rgba(0,214,143,0.06)] border-[rgba(108,92,231,0.2)]"
      }`}
    >
      <div
        className={`text-[10px] font-semibold uppercase tracking-[1px] mb-1.5 flex items-center gap-1.5 ${
          isSuggestion ? "text-[#00d68f]" : "text-[#8b7cf7]"
        }`}
      >
        {isSuggestion ? "🎯" : "💡"} {insight.label}
      </div>
      <div className="text-sm leading-relaxed text-[#e8e8f0]">{insight.text}</div>
    </div>
  );
}

/* ==================== Message Bubble ==================== */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex gap-3 max-w-[780px] ${isUser ? "flex-row-reverse self-end" : ""}`}
    >
      <div
        className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
          isUser
            ? "bg-[#32323f] text-[#9898b0]"
            : "bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] text-white"
        }`}
      >
        {isUser ? "张" : "D"}
      </div>
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-[#6c5ce7] text-white rounded-tr-sm"
            : "bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-tl-sm"
        }`}
      >
        {message.content && <div className="mb-2">{message.content}</div>}
        {message.steps && <AnalysisSteps steps={message.steps} />}
        {message.chart && <InlineChart chart={message.chart} />}
        {message.table && <InlineTable table={message.table} />}
        {message.code && <CodeBlockComponent code={message.code} />}
        {message.insight && <InsightCard insight={message.insight} />}
      </div>
    </motion.div>
  );
}

/* ==================== Chat Input ==================== */
function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="px-8 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[#111118] shrink-0">
      <div className="flex items-end gap-2.5 bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-2xl p-2 focus-within:border-[#6c5ce7] focus-within:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="输入你的分析需求，例如：按区域拆解咨询服务线的销售数据..."
          rows={1}
          className="flex-1 bg-transparent border-none text-sm text-[#e8e8f0] placeholder:text-[#68687e] outline-none resize-none max-h-[120px] leading-relaxed py-2 px-2"
        />
        <div className="flex items-center gap-1 pb-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#68687e] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0] transition-all">
            <Paperclip size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#68687e] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8f0] transition-all">
            <Mic size={16} />
          </button>
          <button
            onClick={handleSend}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#6c5ce7] text-white hover:bg-[#8b7cf7] transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      <div className="text-[11px] text-[#68687e] mt-2 text-center">
        按 Enter 发送 · Shift+Enter 换行 · 支持 CSV、Excel、PDF 文件
      </div>
    </div>
  );
}

/* ==================== Right Panel ==================== */
function RightPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "数据概览" },
    { id: "fields", label: "字段详情" },
    { id: "settings", label: "分析设置" },
  ];

  return (
    <aside className="w-[420px] bg-[#111118] border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] px-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? "text-[#8b7cf7] border-[#6c5ce7]"
                : "text-[#68687e] border-transparent hover:text-[#9898b0]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">sales_2024_q4.csv</h3>
              <span className="text-[11px] text-[#68687e]">更新于 2 分钟前</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: "总行数", value: "2,847", color: "text-[#00d68f]" },
                { label: "总列数", value: "12", color: "text-[#54a0ff]" },
                { label: "缺失值", value: "23", color: "text-[#ff9f43]" },
                { label: "文件大小", value: "1.2 MB", color: "text-[#e8e8f0]" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg p-2.5"
                >
                  <div className="text-[10px] text-[#68687e] uppercase tracking-[0.8px] mb-0.5">
                    {stat.label}
                  </div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Columns */}
            <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#68687e] mb-2 px-1">
              字段列表
            </div>
            <div className="space-y-0.5 mb-4">
              {MOCK_COLUMNS.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors text-xs"
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium font-[family-name:var(--font-jetbrains-mono)] ${
                      col.type === "num"
                        ? "bg-[rgba(84,160,255,0.12)] text-[#54a0ff]"
                        : col.type === "str"
                        ? "bg-[rgba(0,214,143,0.12)] text-[#00d68f]"
                        : "bg-[rgba(255,159,67,0.12)] text-[#ff9f43]"
                    }`}
                  >
                    {col.type}
                  </span>
                  <span className="text-[#9898b0]">{col.name}</span>
                  <span className="text-[#68687e] ml-auto text-[11px]">
                    {"unique" in col
                      ? `唯一值 ${col.unique}`
                      : "range" in col
                      ? col.range
                      : `均值 ${col.mean}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#68687e] mb-2 px-1">
                推荐分析
              </div>
              {MOCK_SUGGESTED_QUESTIONS.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg text-xs text-[#9898b0] hover:border-[#6c5ce7] hover:text-[#e8e8f0] hover:bg-[rgba(108,92,231,0.08)] transition-all cursor-pointer mb-1.5"
                >
                  <span className="text-[#8b7cf7]">{q.icon}</span>
                  {q.text}
                </div>
              ))}
            </div>

            {/* Token Usage */}
            <div className="p-3 bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] rounded-lg">
              <div className="flex justify-between text-[11px] text-[#68687e] mb-1.5">
                <span>本月 AI 用量</span>
                <span>1,247 / 5,000 次</span>
              </div>
              <div className="h-1 bg-[#22222e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#00d68f] rounded-full transition-all"
                  style={{ width: "24.9%" }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "fields" && (
          <div className="text-sm text-[#9898b0] text-center py-8">字段详情内容</div>
        )}
        {activeTab === "settings" && (
          <div className="text-sm text-[#9898b0] text-center py-8">分析设置内容</div>
        )}
      </div>
    </aside>
  );
}

/* ==================== Main Chat Page ==================== */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "帮我分析这份销售数据，找出表现最弱的产品线，并给出优化建议",
    },
    {
      id: "2",
      role: "assistant",
      content: "好的，我来对 sales_2024_q4.csv 进行全面分析。我会从多个维度拆解，找出薄弱环节。",
      steps: [
        { num: 1, label: "读取数据，识别 12 个字段的数据类型和分布", status: "done", time: "0.8s" },
        { num: 2, label: "按产品线汇总销售额和利润率", status: "done", time: "1.2s" },
        { num: 3, label: "计算各产品线环比增长率和同比变化", status: "done", time: "0.9s" },
        { num: 4, label: "按区域交叉分析，定位弱产品线的问题区域", status: "done", time: "1.5s" },
        { num: 5, label: "综合分析，生成优化建议", status: "running", time: "分析中..." },
      ],
      chart: {
        title: "各产品线 Q4 销售额（万元）",
        bars: [
          { label: "智能硬件", value: 486, color: "#8b5cf6" },
          { label: "云服务", value: 389, color: "#00d68f" },
          { label: "企业方案", value: 298, color: "#54a0ff" },
          { label: "数据分析", value: 156, color: "#ff9f43" },
          { label: "咨询服务", value: 87, color: "#ff6b6b" },
        ],
      },
      insight: {
        label: "关键发现",
        type: "finding",
        text: "咨询服务是表现最弱的产品线，Q4 销售额仅 87 万，环比下降 23.5%，同比下降 31.2%。该产品线利润率为 -8.3%，处于亏损状态。数据分析产品线虽然增长 12%，但利润率仅 5.1%，远低于公司平均 18.7%。",
      },
      table: {
        headers: ["产品线", "销售额(万)", "环比", "同比", "利润率", "客户数"],
        rows: [
          ["智能硬件", "486", "+8.2%", "+15.3%", "22.1%", "342"],
          ["云服务", "389", "+12.5%", "+28.7%", "24.6%", "218"],
          ["企业方案", "298", "-2.1%", "+5.4%", "19.8%", "86"],
          ["⚠️ 数据分析", "156", "+12.0%", "-8.5%", "5.1%", "124"],
          ["🔴 咨询服务", "87", "-23.5%", "-31.2%", "-8.3%", "43"],
        ],
      },
      code: {
        lang: "Python",
        code: `# 按产品线汇总 Q4 销售数据
import pandas as pd

df = pd.read_csv('sales_2024_q4.csv')
summary = df.groupby('product_line').agg(
    revenue=('amount', 'sum'),
    orders=('order_id', 'nunique'),
    customers=('customer_id', 'nunique'),
    profit_margin=('profit', 'mean')
).round(2)

# 计算环比和同比
summary['qoq'] = summary['revenue'].pct_change()
summary['yoy'] = summary['revenue'].pct_change(4)
summary.sort_values('revenue', ascending=False)`,
      },
      suggestion: {
        label: "优化建议",
        type: "suggestion",
        text: "1. 咨询服务线（紧急）：交付成本过高（人均交付 23 天）,可通过标准化交付流程降低 40% 成本。\n\n2。数据分析线（优化）：利润率偏低是因为免费试用用户占比 67%。建议将免费试用从 14 天缩短为 7 天，并增加使用引导，预计可将转化率从 12% 提升至 18%。\n\n3. 企业方案线（关注）：虽然环比微降 2.1%，但大客户续约率高达 92%。建议加大 upsell 力度。",
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate assistant response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "正在分析您的问题...",
        steps: [
          { num: 1, label: "理解分析意图并检索相关数据", status: "running", time: "分析中..." },
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleSelectDataSource = (ds: DataSource) => {
    console.log("Selected data source:", ds);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <LeftSidebar onSelectDataSource={handleSelectDataSource} />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#0a0a0f] min-w-0">
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSend} />
      </main>

      <RightPanel />
    </div>
  );
}
