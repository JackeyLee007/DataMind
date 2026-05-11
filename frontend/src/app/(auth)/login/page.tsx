"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || "登录失败");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <a href="/" className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight mb-6">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Sparkles size={20} />
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)]">DataMind</span>
        </a>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight mb-2">
          欢迎回来
        </h1>
        <p className="text-sm text-[#6a6a82]">
          登录你的 DataMind 账户，开始数据分析之旅
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3 text-sm text-[#ef4444]"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-[#a0a0b8]">
              邮箱地址
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] placeholder:text-[#4a4a5c] focus:border-[rgba(139,92,246,0.3)] focus:ring-[rgba(139,92,246,0.1)] h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm text-[#a0a0b8]">
                密码
              </Label>
              <a
                href="#"
                className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
              >
                忘记密码？
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="输入你的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] placeholder:text-[#4a4a5c] focus:border-[rgba(139,92,246,0.3)] focus:ring-[rgba(139,92,246,0.1)] h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a82] hover:text-[#a0a0b8] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-full h-11 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white font-semibold transition-all rounded-lg border border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                登录中...
              </>
            ) : (
              <>
                登录 <ArrowRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[#16161f] text-[#6a6a82]">或使用以下方式登录</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 h-10 bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-all">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 h-10 bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-[#a0a0b8] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-all">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#6a6a82] mt-6">
        还没有账户？{" "}
        <a href="/register" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors font-medium">
          免费注册
        </a>
      </p>
    </motion.div>
  );
}
