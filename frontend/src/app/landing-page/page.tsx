"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MessageSquare,
  BarChart3,
  Link2,
  Brain,
  FileText,
  Sparkles,
  Shield,
  Check,
  ArrowRight,
  Play,
} from "lucide-react";

/* ==================== Reveal Component ==================== */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ==================== Particles ==================== */
const PARTICLES = [
  { left: 16, duration: 21, delay: 1, size: 1, opacity: 0.3 },
  { left: 42, duration: 15, delay: 6, size: 2, opacity: 0.2 },
  { left: 70, duration: 19, delay: 7, size: 2, opacity: 0.3 },
  { left: 13, duration: 12, delay: 2, size: 1, opacity: 0.2 },
  { left: 95, duration: 14, delay: 7, size: 1, opacity: 0.4 },
  { left: 92, duration: 20, delay: 1, size: 2, opacity: 0.1 },
  { left: 14, duration: 20, delay: 3, size: 1, opacity: 0.5 },
  { left: 26, duration: 23, delay: 6, size: 2, opacity: 0.1 },
  { left: 19, duration: 20, delay: 9, size: 2, opacity: 0.3 },
  { left: 15, duration: 11, delay: 1, size: 1, opacity: 0.2 },
  { left: 82, duration: 21, delay: 1, size: 1, opacity: 0.4 },
  { left: 20, duration: 18, delay: 2, size: 1, opacity: 0.3 },
  { left: 97, duration: 12, delay: 2, size: 1, opacity: 0.1 },
  { left: 79, duration: 20, delay: 3, size: 1, opacity: 0.3 },
  { left: 99, duration: 11, delay: 9, size: 2, opacity: 0.1 },
  { left: 80, duration: 14, delay: 8, size: 2, opacity: 0.3 },
  { left: 8, duration: 12, delay: 6, size: 1, opacity: 0.5 },
  { left: 40, duration: 14, delay: 0, size: 2, opacity: 0.3 },
  { left: 90, duration: 22, delay: 4, size: 1, opacity: 0.2 },
  { left: 70, duration: 15, delay: 3, size: 1, opacity: 0.1 },
  { left: 99, duration: 21, delay: 7, size: 1, opacity: 0.3 },
  { left: 41, duration: 16, delay: 4, size: 1, opacity: 0.5 },
  { left: 89, duration: 24, delay: 3, size: 1, opacity: 0.3 },
  { left: 28, duration: 20, delay: 9, size: 1, opacity: 0.4 },
  { left: 95, duration: 23, delay: 2, size: 2, opacity: 0.4 },
  { left: 30, duration: 19, delay: 9, size: 1, opacity: 0.2 },
  { left: 66, duration: 17, delay: 5, size: 1, opacity: 0.4 },
  { left: 80, duration: 20, delay: 9, size: 1, opacity: 0.2 },
  { left: 86, duration: 21, delay: 4, size: 1, opacity: 0.1 },
  { left: 89, duration: 10, delay: 7, size: 1, opacity: 0.5 },
];

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[rgba(139,92,246,0.3)]"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `particleFloat ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ==================== Navigation ==================== */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] py-2.5"
          : "py-4"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Sparkles size={18} />
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)]">DataMind</span>
        </a>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {["功能", "演示", "模板", "安全", "定价"].map((item) => (
            <li key={item}>
              <a
                href={`#${item}`}
                className="text-sm text-[#a0a0b8] hover:text-[#f0f0f5] transition-colors font-medium"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 rounded-lg text-sm text-[#a0a0b8] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.05)] transition-all font-medium">
            登录
          </button>
          <button className="px-5 py-2.5 rounded-lg text-sm text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all">
            免费开始
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ==================== Hero Section ==================== */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(139,92,246,0.15)] via-[rgba(59,130,246,0.08)] to-transparent" />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 top-[-100px] right-[-100px]"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 bottom-[-50px] left-[-100px]"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-40 top-[40%] left-[50%]"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-[860px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-sm text-[#8b5cf6] mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          全新 AI 数据分析引擎已上线
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2.8rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight mb-6"
        >
          你的 <span className="gradient-text">AI 数据分析师</span>
          <br />
          让数据说话
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-[#a0a0b8] max-w-[600px] mx-auto mb-10 leading-relaxed"
        >
          连接你的数据源，用自然语言提问，秒级获得深度洞察。无需编写代码，从电子表格到数据库，一切尽在掌握。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <button className="px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
            开始免费分析 <ArrowRight size={18} />
          </button>
          <button className="px-8 py-3.5 rounded-xl text-base font-semibold text-[#f0f0f5] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] transition-all flex items-center gap-2">
            <Play size={18} /> 观看演示
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-12 mt-16 flex-wrap"
        >
          {[
            { value: "200万+", label: "活跃用户" },
            { value: "50亿+", label: "分析数据行" },
            { value: "99.9%", label: "服务可用性" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-[#6a6a82] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ==================== Brands Section ==================== */
function BrandsSection() {
  const brands = ["Microsoft", "Google", "Amazon", "Meta", "Tesla", "Stripe"];
  return (
    <section className="py-16 border-y border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-xs text-[#6a6a82] uppercase tracking-[0.1em] mb-8">
          受到全球领先企业的信赖
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#a0a0b8] hover:opacity-100 transition-opacity cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== How It Works ==================== */
function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      title: "连接数据源",
      desc: "上传 Excel、CSV、PDF 文件，或连接数据库。支持 Google Sheets、Postgres 等多种数据源。",
      color: "#8b5cf6",
    },
    {
      num: "2",
      title: "自然语言提问",
      desc: "用日常语言描述你的分析需求，AI 自动理解意图并选择最佳分析方法。",
      color: "#3b82f6",
    },
    {
      num: "3",
      title: "获取即时结果",
      desc: "秒级生成可视化图表、数据表格和完整分析报告，支持导出分享。",
      color: "#06b6d4",
    },
  ];

  return (
    <section className="py-24" id="使用流程">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              使用流程
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              三步完成数据分析
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              从数据连接到洞察输出，全程无需编写一行代码
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />

          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="text-center px-6 py-10 relative">
                <div
                  className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center font-[family-name:var(--font-space-grotesk)] text-xl font-bold relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}26, ${step.color}0D)`,
                    border: `1px solid ${step.color}4D`,
                    color: step.color,
                  }}
                >
                  {step.num}
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#a0a0b8] leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Chat Demo Section ==================== */
function ChatDemoSection() {
  return (
    <section className="py-24" id="演示">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              智能对话
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              与你的数据对话
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              从电子表格到数据库，用自然语言提问，获得即时洞察
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="max-w-[900px] mx-auto">
            <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.15),0_4px_24px_rgba(0,0,0,0.3)]">
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  </div>
                  <span className="text-xs text-[#6a6a82] font-[family-name:var(--font-jetbrains-mono)]">
                    DataMind — 数据分析工作台
                  </span>
                </div>
                <span className="px-3 py-1 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full text-xs text-[#8b5cf6] font-medium">
                  AI 就绪
                </span>
              </div>

              {/* Chat body */}
              <div className="p-8 min-h-[420px] flex flex-col gap-6">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[rgba(59,130,246,0.2)] to-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                  <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.12)] rounded-r-2xl rounded-bl-2xl rounded-tl px-4 py-3 text-sm text-[#f0f0f5] max-w-[80%]">
                    帮我分析这份销售数据，找出过去6个月的趋势和关键增长点
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-sm text-white flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1 max-w-[90%]">
                    <div className="text-sm text-[#a0a0b8] leading-relaxed mb-4">
                      已完成对销售数据的全面分析。以下是关键发现：
                      <br />
                      <br />
                      <strong className="text-[#f0f0f5]">📈 整体趋势：</strong>
                      过去6个月销售额呈持续上升趋势，月均增长率达{" "}
                      <strong className="text-[#f0f0f5]">12.3%</strong>。
                      <br />
                      <strong className="text-[#f0f0f5]">🔥 增长亮点：</strong>
                      线上渠道贡献了 <strong className="text-[#f0f0f5]">67%</strong>{" "}
                      的新增收入，其中移动端占比最高。
                      <br />
                      <strong className="text-[#f0f0f5]">💡 建议：</strong>
                      建议加大移动端投放力度，同时关注华东地区的市场渗透机会。
                    </div>

                    {/* Mini chart */}
                    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-[#f0f0f5]">
                          月度销售额趋势
                        </span>
                        <span className="text-xs px-2.5 py-1 bg-[rgba(16,185,129,0.1)] text-[#10b981] rounded-full font-medium">
                          ↑ 12.3% 增长
                        </span>
                      </div>
                      <div className="flex items-end gap-2 h-[100px] pt-2">
                        {[45, 62, 55, 78, 70, 88, 95].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t bg-gradient-to-t from-[rgba(139,92,246,0.6)] to-[rgba(139,92,246,0.3)]"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[10px] text-[#6a6a82]">
                              {["1月", "2月", "3月", "4月", "5月", "6月", "7月"][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* User follow-up */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[rgba(59,130,246,0.2)] to-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                  <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.12)] rounded-r-2xl rounded-bl-2xl rounded-tl px-4 py-3 text-sm text-[#f0f0f5] max-w-[80%]">
                    能否预测下个季度的销售额？
                  </div>
                </motion.div>

                {/* AI prediction */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-sm text-white flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1 max-w-[90%]">
                    <div className="text-sm text-[#a0a0b8] leading-relaxed">
                      基于历史数据的 <strong className="text-[#f0f0f5]">ARIMA 时序模型</strong>{" "}
                      预测：
                      <br />
                      <br />
                      📊 下季度预计总销售额：
                      <strong className="text-[#f0f0f5]">¥2,340万</strong>（置信区间 ¥2,100万 -
                      ¥2,580万）
                      <br />
                      📈 预计环比增长：
                      <strong className="text-[#f0f0f5]">15.8%</strong>
                      <br />
                      ⚠️ 风险提示：季节性波动可能影响11月数据，建议预留10%的缓冲空间
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Chat input */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
                <input
                  type="text"
                  placeholder="输入你的分析需求，例如：帮我找出销量Top10的产品..."
                  className="flex-1 bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#6a6a82] outline-none focus:border-[rgba(139,92,246,0.3)] transition-colors"
                />
                <button className="w-11 h-11 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                  <ArrowRight size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ==================== Features Section ==================== */
function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: "自然语言交互",
      desc: "用日常语言提问，AI 自动理解业务意图，生成精准分析。支持上下文记忆，越用越懂你。",
      color: "#8b5cf6",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "即时可视化",
      desc: "秒级生成专业图表，支持折线图、柱状图、散点图、热力图等多种可视化类型。",
      color: "#3b82f6",
    },
    {
      icon: <Link2 size={24} />,
      title: "多数据源整合",
      desc: "连接 Excel、CSV、PDF、Google Sheets、Postgres 等多种数据源，统一分析视角。",
      color: "#06b6d4",
    },
    {
      icon: <Brain size={24} />,
      title: "预测建模",
      desc: "内置回归分析、时间序列预测、分类模型等高级分析能力，挖掘数据深层价值。",
      color: "#10b981",
    },
    {
      icon: <FileText size={24} />,
      title: "自动化报告",
      desc: "设定定时任务，自动生成分析报告并通过邮件或 Slack 推送，团队协作更高效。",
      color: "#ec4899",
    },
    {
      icon: <Sparkles size={24} />,
      title: "智能数据清洗",
      desc: "自动检测异常值、处理缺失数据、标准化格式，让数据分析从干净的数据开始。",
      color: "#f59e0b",
    },
  ];

  return (
    <section className="py-24" id="功能">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              核心功能
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              为数据分析而生
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              专为数据洞察打造的 AI 引擎，覆盖从数据清洗到预测建模的全流程
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.08}>
              <div className="group bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 relative overflow-hidden hover:bg-[#1c1c28] hover:border-[rgba(139,92,246,0.15)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-lg"
                  style={{ background: `${feature.color}1F`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#a0a0b8] leading-relaxed">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Data Sources Section ==================== */
function DataSourcesSection() {
  const sources = [
    { icon: "📗", name: "Excel / CSV", desc: "支持 .xlsx .xls .csv 格式", color: "#10b981" },
    { icon: "📄", name: "PDF 文档", desc: "智能提取表格与数据", color: "#3b82f6" },
    { icon: "🗄️", name: "Postgres / MySQL", desc: "直连数据库实时查询", color: "#ef4444" },
    { icon: "🌐", name: "Google Sheets", desc: "云端协作表格无缝接入", color: "#f59e0b" },
  ];

  return (
    <section className="py-24 bg-[#111118]">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              数据连接
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              连接所有数据源
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              支持主流文件格式和数据库，一站式整合你的数据资产
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sources.map((source, i) => (
            <Reveal key={source.name} delay={i * 0.08}>
              <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 text-center hover:border-[rgba(139,92,246,0.2)] hover:-translate-y-0.5 transition-all cursor-default">
                <div
                  className="w-[52px] h-[52px] mx-auto mb-4 rounded-[14px] flex items-center justify-center text-2xl"
                  style={{ background: `${source.color}1A` }}
                >
                  {source.icon}
                </div>
                <div className="font-semibold text-[0.95rem] mb-1.5">{source.name}</div>
                <div className="text-xs text-[#6a6a82]">{source.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Templates Section ==================== */
function TemplatesSection() {
  const templates = [
    { icon: "💰", label: "FINANCE", tag: "金融分析", name: "SaaS 公司资产负债表创建", desc: "自动生成财务报表，追踪收入、支出和现金流", gradient: "from-[rgba(139,92,246,0.2)] to-[rgba(59,130,246,0.1)]" },
    { icon: "📢", label: "MARKETING", tag: "市场营销", name: "获客渠道效率分析", desc: "对比各渠道 ROI，优化营销预算分配策略", gradient: "from-[rgba(59,130,246,0.2)] to-[rgba(6,182,212,0.1)]" },
    { icon: "⚙️", label: "OPERATIONS", tag: "运营管理", name: "需求预测与库存优化", desc: "基于历史数据预测需求，降低库存成本", gradient: "from-[rgba(6,182,212,0.2)] to-[rgba(16,185,129,0.1)]" },
    { icon: "📈", label: "GROWTH", tag: "业务增长", name: "现金流预测与预算规划", desc: "预测未来现金流，辅助战略决策", gradient: "from-[rgba(16,185,129,0.2)] to-[rgba(245,158,11,0.1)]" },
    { icon: "🔬", label: "RESEARCH", tag: "科学研究", name: "基因数据集相关性矩阵", desc: "大规模数据集的特征关联分析与可视化", gradient: "from-[rgba(236,72,153,0.2)] to-[rgba(139,92,246,0.1)]" },
    { icon: "🧠", label: "DATA SCIENCE", tag: "数据科学", name: "数据清洗与预处理", desc: "自动化数据质量检测与标准化处理", gradient: "from-[rgba(245,158,11,0.2)] to-[rgba(239,68,68,0.1)]" },
  ];

  return (
    <section className="py-24" id="模板">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              场景模板
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              为每个角色量身定制
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              预设分析模板，覆盖金融、营销、运营、科研等主流场景
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:border-[rgba(139,92,246,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all cursor-pointer group">
                <div className={`h-40 bg-gradient-to-br ${t.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl opacity-70">{t.icon}</div>
                    <div className="text-xs text-[#6a6a82] font-[family-name:var(--font-jetbrains-mono)]">
                      {t.label}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <span className="inline-block px-2.5 py-0.5 bg-[rgba(139,92,246,0.1)] rounded-full text-xs text-[#8b5cf6] font-medium mb-2.5">
                    {t.tag}
                  </span>
                  <h3 className="font-semibold text-[0.95rem] mb-1.5">{t.name}</h3>
                  <p className="text-xs text-[#6a6a82] leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Testimonials Section ==================== */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "DataMind 彻底改变了我们分析数据的方式。以前需要数据团队花一整天完成的报表，现在不到一小时就能搞定。它不仅快速，还能提供我们没想到的分析角度。",
      name: "张明远",
      role: "增长负责人 · 星辰科技",
      avatar: "张",
      gradient: "from-[#8b5cf6] to-[#6366f1]",
    },
    {
      quote:
        "作为非技术背景的产品经理，DataMind 让我能够独立完成数据分析。自然语言交互非常直观，生成的可视化图表质量堪比专业数据分析师的产出。",
      name: "李思涵",
      role: "高级产品经理 · 云途教育",
      avatar: "李",
      gradient: "from-[#3b82f6] to-[#06b6d4]",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              用户评价
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              真实团队，真实成果
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              听听来自不同行业的用户如何使用 DataMind 提升效率
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 hover:border-[rgba(139,92,246,0.15)] transition-all">
                <p className="text-[0.95rem] text-[#a0a0b8] leading-relaxed mb-6 italic">
                  <span className="text-2xl text-[#8b5cf6] leading-none mr-1">&ldquo;</span>
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br ${t.gradient}`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-[#6a6a82]">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Security Section ==================== */
function SecuritySection() {
  return (
    <section className="py-24 bg-[#111118]" id="安全">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <Reveal className="flex-1">
            <div className="flex items-center justify-center">
              <div className="w-[200px] h-[200px] relative">
                <div
                  className="absolute inset-0 rounded-full border-2 border-[rgba(139,92,246,0.15)]"
                  style={{ animation: "shieldPulse 3s ease-in-out infinite" }}
                />
                <div
                  className="absolute inset-5 rounded-full border-2 border-[rgba(59,130,246,0.15)]"
                  style={{ animation: "shieldPulse 3s ease-in-out infinite", animationDelay: "-1s" }}
                />
                <div
                  className="absolute inset-10 rounded-full border-2 border-[rgba(6,182,212,0.15)]"
                  style={{ animation: "shieldPulse 3s ease-in-out infinite", animationDelay: "-2s" }}
                />
                <div className="absolute inset-[60px] rounded-full bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(59,130,246,0.1)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center text-4xl">
                  <Shield size={40} className="text-[#8b5cf6]" />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="flex-1" delay={0.2}>
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
                <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
                安全与合规
              </div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
                你的数据，始终安全
              </h2>
              <p className="text-[#a0a0b8] max-w-[480px] leading-relaxed mb-8">
                数据全程加密传输与存储，绝不用于训练 AI 模型。符合行业领先的安全标准，让你安心分析。
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: <Check size={14} />, text: "SOC 2 Type II", color: "#10b981" },
                  { icon: <Check size={14} />, text: "GDPR 合规", color: "#3b82f6" },
                  { icon: <Check size={14} />, text: "端到端加密", color: "#8b5cf6" },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm font-semibold text-[#a0a0b8]"
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-xs"
                      style={{ background: `${badge.color}26`, color: badge.color }}
                    >
                      {badge.icon}
                    </span>
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==================== Pricing Section ==================== */
function PricingSection() {
  const plans = [
    {
      name: "免费版",
      price: "¥0",
      period: "/月",
      features: [
        { text: "每月 15 次对话", included: true },
        { text: "基础图表生成", included: true },
        { text: "CSV 导出", included: true },
        { text: "预测建模", included: false },
        { text: "自动化报告", included: false },
      ],
      highlighted: false,
      buttonText: "免费开始",
    },
    {
      name: "专业版",
      price: "¥249",
      period: "/月",
      features: [
        { text: "无限对话次数", included: true },
        { text: "高级可视化图表", included: true },
        { text: "预测建模", included: true },
        { text: "多数据源连接", included: true },
        { text: "团队协作", included: false },
      ],
      highlighted: true,
      buttonText: "立即升级",
    },
    {
      name: "企业版",
      price: "定制",
      period: "按需定价",
      features: [
        { text: "专业版全部功能", included: true },
        { text: "团队协作空间", included: true },
        { text: "自动化报告推送", included: true },
        { text: "Slack 集成", included: true },
        { text: "专属客户成功经理", included: true },
      ],
      highlighted: false,
      buttonText: "联系销售",
    },
  ];

  return (
    <section className="py-24" id="定价">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] uppercase tracking-[0.1em] font-semibold mb-4">
              <span className="w-6 h-0.5 bg-[#8b5cf6] rounded-full" />
              定价方案
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
              选择适合你的方案
            </h2>
            <p className="text-[#a0a0b8] max-w-[560px] mx-auto leading-relaxed">
              从免费开始，按需升级
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <div
                className={`bg-[#16161f] border rounded-2xl p-8 text-center relative ${
                  plan.highlighted
                    ? "border-[rgba(139,92,246,0.3)]"
                    : "border-[rgba(255,255,255,0.06)]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full text-xs font-semibold text-white">
                    最受欢迎
                  </div>
                )}
                <div
                  className={`text-xs uppercase tracking-[0.08em] mb-4 ${
                    plan.highlighted ? "text-[#8b5cf6]" : "text-[#6a6a82]"
                  }`}
                >
                  {plan.name}
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold mb-2">
                  {plan.price}
                </div>
                <div className="text-sm text-[#6a6a82] mb-6">{plan.period}</div>
                <ul className="text-left space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={`text-sm flex items-center gap-2 ${
                        f.included ? "text-[#a0a0b8]" : "text-[#6a6a82]"
                      }`}
                    >
                      {f.included ? (
                        <Check size={16} className="text-[#10b981] flex-shrink-0" />
                      ) : (
                        <span className="w-4 text-center opacity-30">✗</span>
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                      : "text-[#f0f0f5] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== CTA Section ==================== */
function CTASection() {
  return (
    <section className="py-24 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <Reveal>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-tight mb-4">
            准备好让数据为你工作了吗？
          </h2>
          <p className="text-[#a0a0b8] max-w-[500px] mx-auto leading-relaxed mb-8">
            加入 200 万+ 用户，用 AI 重新定义数据分析体验。免费开始，无需信用卡。
          </p>
          <button className="px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto">
            免费开始使用 <ArrowRight size={18} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ==================== Footer ==================== */
function Footer() {
  return (
    <footer className="py-16 border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 font-bold text-lg mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white text-sm">
                <Sparkles size={16} />
              </div>
              <span className="font-[family-name:var(--font-space-grotesk)]">DataMind</span>
            </a>
            <p className="text-sm text-[#6a6a82] leading-relaxed max-w-[280px]">
              AI 驱动的智能数据分析平台，让每个人都能轻松获得数据洞察。
            </p>
          </div>

          {[
            {
              title: "产品",
              links: ["功能介绍", "定价方案", "场景模板", "API 文档"],
            },
            {
              title: "资源",
              links: ["帮助中心", "博客", "教程", "社区"],
            },
            {
              title: "公司",
              links: ["关于我们", "隐私政策", "服务条款", "联系我们"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-5 text-[#f0f0f5]">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#6a6a82] hover:text-[#f0f0f5] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[rgba(255,255,255,0.06)] text-xs text-[#6a6a82]">
          <span>© 2026 DataMind AI. 保留所有权利。</span>
          <span>用 ❤️ 和 AI 构建</span>
        </div>
      </div>
    </footer>
  );
}

/* ==================== Main Page ==================== */
export default function LandingPage() {
  return (
    <main className="noise-overlay">
      <Particles />
      <Navigation />
      <HeroSection />
      <BrandsSection />
      <HowItWorksSection />
      <ChatDemoSection />
      <FeaturesSection />
      <DataSourcesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <SecuritySection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
