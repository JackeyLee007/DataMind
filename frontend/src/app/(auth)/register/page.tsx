"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          创建账户
        </h1>
        <p className="text-sm text-[#6a6a82]">
          免费开始使用 DataMind，无需信用卡
        </p>
      </div>

      {/* Register Form */}
      <div className="bg-[#16161f] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-[#a0a0b8]">
              姓名
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="你的姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] placeholder:text-[#4a4a5c] focus:border-[rgba(139,92,246,0.3)] focus:ring-[rgba(139,92,246,0.1)] h-11"
            />
          </div>

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
              className="bg-[#111118] border-[rgba(255,255,255,0.06)] text-[#f0f0f5] placeholder:text-[#4a4a5c] focus:border-[rgba(139,92,246,0.3)] focus:ring-[rgba(139,92,246,0.1)] h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-[#a0a0b8]">
              密码
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="至少8位字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-4 h-4 mt-0.5 rounded border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)]">
              <Check size={10} className="text-[#8b5cf6]" />
            </div>
            <p className="text-xs text-[#6a6a82] leading-relaxed">
              注册即表示你同意我们的{" "}
              <a href="#" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                服务条款
              </a>{" "}
              和{" "}
              <a href="#" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                隐私政策
              </a>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white font-semibold transition-all"
          >
            创建账户 <ArrowRight size={16} className="ml-1" />
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#6a6a82] mt-6">
        已有账户？{" "}
        <a href="/login" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors font-medium">
          立即登录
        </a>
      </p>
    </motion.div>
  );
}
