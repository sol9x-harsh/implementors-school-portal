"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Sprout, ArrowRight, BookOpen, Trophy, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { icon: BookOpen, label: "Active Students", value: "842+" },
  { icon: Trophy, label: "Verified Achievements", value: "3.2K+" },
  { icon: TrendingUp, label: "Portfolios Generated", value: "120+" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid credentials. Please check and try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel: Branding ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(145deg, oklch(0.36 0.17 155) 0%, oklch(0.48 0.18 165) 40%, oklch(0.58 0.16 185) 75%, oklch(0.68 0.15 200) 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.90 0.15 85) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.85 0.12 155) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />

        {/* Floating leaf shapes */}
        <div className="absolute top-24 right-24 w-32 h-32 opacity-10"
          style={{ background: "oklch(0.92 0.12 120)", borderRadius: "60% 40% 70% 30% / 40% 60% 40% 60%", transform: "rotate(30deg)" }} />
        <div className="absolute bottom-40 right-16 w-20 h-20 opacity-10"
          style={{ background: "oklch(0.90 0.10 85)", borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%", transform: "rotate(-20deg)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-heading font-bold text-xl tracking-tight">Sol9x Portal</span>
          </motion.div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-5xl font-heading font-bold text-white leading-tight">
              Every student<br />
              <span className="text-white/80">deserves to</span><br />
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl mt-1">flourish. 🌱</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/75 text-lg leading-relaxed max-w-md font-sans">
            Track academics, discover opportunities, and build a portfolio that tells your complete story of growth.
          </motion.p>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Icon className="w-5 h-5 text-white/80 mb-2" />
                  <div className="text-white font-heading font-bold text-xl">{stat.value}</div>
                  <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom attribution */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="relative z-10 text-white/40 text-xs font-sans">
          © 2026 Sol9x Academy. All rights reserved.
        </motion.p>
      </div>

      {/* ── Right Panel: Login Form ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 growth-mesh relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-growth-gradient flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">Sol9x Portal</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-heading font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5 font-sans">Sign in to your portal account</p>
          </div>

          {/* Glass Card Form */}
          <div className="glass-card rounded-3xl p-8 shadow-growth-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-sans"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identifier */}
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="identifier"
                  placeholder="scholar@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-border bg-white/80 text-sm placeholder:text-muted-foreground/60
                    focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 rounded-xl border-border bg-white/80 text-sm
                      focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-growth-gradient text-white font-semibold text-sm btn-glow
                  disabled:opacity-60 disabled:cursor-not-allowed border-0 mt-2 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
                {!loading && <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-sans">
            Access is managed by your school administrator.
            <button 
              onClick={() => router.push("/admin/login")}
              className="block mt-4 mx-auto text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dark transition-colors"
            >
              Institutional Login (Admin)
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
